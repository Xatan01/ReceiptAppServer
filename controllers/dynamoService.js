const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
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
        const dynamoParams = {
            TableName: TABLE_NAME,
            Key: { 
                id: item.id, 
                createdAt: item.createdAt 
            }
        };

        const s3Params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: item.s3Key
        };

        return Promise.all([
            dynamoDb.delete(dynamoParams).promise(),
            s3.deleteObject(s3Params).promise()
        ]);
    });
    
    await Promise.all(deletePromises);
};

module.exports = {
    saveScan,
    getScanHistory,
    deleteScans
};
