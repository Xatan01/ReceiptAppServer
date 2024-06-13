const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

const saveScan = async (scanDetails) => {
    const params = {
        TableName: TABLE_NAME,
        Item: scanDetails
    };
    await dynamoDb.put(params).promise();
};

const getScanHistory = async () => {
    const params = {
        TableName: TABLE_NAME,
    };
    const result = await dynamoDb.scan(params).promise();
    return result.Items;
};

const deleteScans = async (items) => {
    const deletePromises = items.map(item => {
        const params = {
            TableName: TABLE_NAME,
            Key: { id: item.id }
        };
        return dynamoDb.delete(params).promise();
    });
    await Promise.all(deletePromises);
};

module.exports = {
    saveScan,
    getScanHistory,
    deleteScans
};