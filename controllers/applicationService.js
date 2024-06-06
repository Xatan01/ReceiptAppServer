const { processScan } = require('./textractService');
const { extractFieldsWithOpenAI } = require('./openaiService');
const { saveScan, getScanHistory, deleteScans } = require('./dynamoService');
const { convertImageToPDF } = require('./createPDF');
const { MimeType } = require('@adobe/pdfservices-node-sdk');

const handleScan = async (req, res) => {
    try {
        console.log("File received:", req.file);

        const file = req.file;
        if (!file) {
            return res.status(400).send({ error: "No file uploaded" });
        }

        console.log("Starting Adobe PDF conversion...");
        const pdfBuffer = await convertImageToPDF(file.buffer, MimeType.JPEG); // Adjust mimeType as needed
        console.log("Adobe PDF conversion complete");

        console.log("Starting Textract scan...");
        const textractResult = await processScan({ buffer: pdfBuffer });
        console.log("Textract scan complete:", textractResult);

        const allText = textractResult.text.join('\n'); // Assuming textractResult.text is an array of lines

        console.log("Extracting fields with OpenAI...");
        const fields = await extractFieldsWithOpenAI([allText]); // Ensure allText is passed as an array
        console.log("Field extraction complete:", fields);

        // Save the scan result to DynamoDB
        await saveScan({
            fileName: file.originalname,
            invoiceDate: fields.invoiceDate,
            invoiceNumber: fields.invoiceNumber,
            totalAmount: fields.totalAmount,
            classification: fields.classification,
        });

        // Send the extracted fields back to the frontend
        res.status(200).send({ message: "Scan and extraction successful", fields });
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
