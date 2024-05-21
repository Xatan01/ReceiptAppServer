const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const textract = new AWS.Textract();

const extractFields = (blocks) => {
    const lines = blocks.filter(block => block.BlockType === "LINE").map(block => block.Text);

    let billDate = '';
    let invoiceNo = '';
    let totalAmount = '';

    lines.forEach(line => {
        if (!billDate && /date|bill date|invoice date/i.test(line)) {
            billDate = line.split(/[:\-]/)[1]?.trim();
        }
        if (!invoiceNo && /invoice|bill no|invoice no|invoice number|bill number/i.test(line)) {
            invoiceNo = line.split(/[:\-]/)[1]?.trim();
        }
        if (!totalAmount && /total|amount due|total amount|total due/i.test(line)) {
            const amountMatch = line.match(/(\d+[\.,]?\d*)/);
            totalAmount = amountMatch ? amountMatch[0].replace(',', '') : '';
        }
    });

    return { billDate, invoiceNo, totalAmount };
};

const processScan = async (file) => {
    try {
        const params = {
            Document: {
                Bytes: file.buffer,
            },
            FeatureTypes: ["TABLES", "FORMS"],
        };

        const data = await textract.analyzeDocument(params).promise();

        const fields = extractFields(data.Blocks);

        return { message: "Scan successful", fields };
    } catch (error) {
        console.error("Error processing scan:", error);
        throw new Error("Error processing scan");
    }
};

module.exports = {
    processScan,
};
