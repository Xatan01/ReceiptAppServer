const { AWS } = require('../config/config');

const textract = new AWS.Textract();

const extractAllText = (blocks) => {
    return blocks
        .filter(block => block.BlockType === "LINE")
        .map(block => block.Text);
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

        const allText = extractAllText(data.Blocks);

        return { message: "Scan successful", text: allText };
    } catch (error) {
        console.error("Error processing scan:", error);
        throw new Error("Error processing scan");
    }
};

module.exports = {
    processScan,
};
