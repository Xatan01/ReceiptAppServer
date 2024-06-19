require('dotenv').config();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const AWS = require('../config/config');
const { processScan } = require('./textractService');
const { saveScan, getScanHistory, deleteScans } = require('./dynamoService');
const { extractFieldsWithOpenAI } = require('./openaiService');

const s3 = new AWS.S3();

const handleScan = async (req, res) => {
    try {
        console.log("/api/scan @ " + Date.now());
        console.log("File received:", req.file);

        const file = req.file;
        if (!file) {
            return res.status(400).send({ error: "No file uploaded" });
        }

        const fileExtension = path.extname(file.originalname);
        const s3Key = `${uuidv4()}${fileExtension}`;

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype
        };

        const s3UploadResult = await s3.upload(params).promise();
        const s3Url = s3UploadResult.Location;

        console.log("S3 URL:", s3Url); // Log the S3 URL

        console.log("Starting Textract scan...");
        const textractResult = await processScan({ buffer: file.buffer });
        console.log("Textract scan complete:", textractResult);

        // Prepare textArray for OpenAI extraction
        const textArray = Object.values(textractResult.fields);

        console.log("Starting OpenAI extraction with S3 URL...");
        const openaiResult = await extractFieldsWithOpenAI(s3Url, textArray);
        console.log("OpenAI extraction complete:", openaiResult);

        const createdAt = new Date().toISOString(); // Ensure createdAt is included

        // Save the scan result to DynamoDB
        await saveScan({
            id: uuidv4(),
            fileName: file.originalname,
            s3Url,
            textractResult: textractResult.fields,
            openaiResult,
            createdAt
        });

        res.status(200).send({ message: "Scan and extraction successful", textractResult: textractResult.fields, openaiResult, s3Url });
    } catch (error) {
        console.error("Error scanning file:", error);
        res.status(500).send({ error: "Failed to scan and extract fields from file" });
    }
};


const handleHistory = async (req, res) => {
    try {
        const history = await getScanHistory();
        res.status(200).send(history);
    } catch (error) {
        console.error("Error retrieving scan history:", error);
        res.status(500).send({ error: "Failed to retrieve scan history" });
    }
};

const handleDeleteSelected = async (req, res) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).send({ error: "No items provided for deletion" });
        }
        await deleteScans(items);
        res.status(200).send({ message: "Selected scans deleted successfully" });
    } catch (error) {
        console.error("Error deleting selected scans:", error);
        res.status(500).send({ error: "Failed to delete selected scans" });
    }
};

module.exports = {
    handleScan,
    handleHistory,
    handleDeleteSelected
};
