const { processScan } = require('./textractService');
const { extractFieldsWithOpenAI } = require('./openaiService'); // Updated to use OpenAI service
const { saveScan, getScanHistory } = require('./dynamoService');

const handleScan = async (req, res) => {
    try {
        console.log("File received:", req.file);

        const file = req.file;
        if (!file) {
            return res.status(400).send({ error: "No file uploaded" });
        }

        console.log("Starting scan...");
        const textractResult = await processScan(file);
        console.log("Scan complete:", textractResult);

        const allText = textractResult.text; // Assuming textractResult.text is a string

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

module.exports = {
    handleScan,
    handleHistory,
};
