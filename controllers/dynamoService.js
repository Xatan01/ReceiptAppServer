// services/dynamoService.js
const { AWS } = require('../config/config');
const { v4: uuidv4 } = require('uuid');

const docClient = new AWS.DynamoDB.DocumentClient();

const saveScan = async (scanData) => {
    const params = {
        TableName: 'ScanHistory',
        Item: {
            id: uuidv4(),
            fileName: scanData.fileName,
            invoiceDate: scanData.invoiceDate,
            invoiceNumber: scanData.invoiceNumber,
            totalAmount: scanData.totalAmount,
            classification: scanData.classification,
            createdAt: new Date().toISOString(),
        },
    };

    try {
        await docClient.put(params).promise();
    } catch (error) {
        console.error('Error saving scan data to DynamoDB:', error);
        throw new Error('Could not save scan data');
    }
};

const getScanHistory = async () => {
    const params = {
        TableName: 'ScanHistory',
        ScanIndexForward: false, // to sort in descending order
    };

    try {
        const data = await docClient.scan(params).promise();
        return data.Items;
    } catch (error) {
        console.error('Error fetching scan history from DynamoDB:', error);
        throw new Error('Could not fetch scan history');
    }
};

module.exports = {
    saveScan,
    getScanHistory,
};
