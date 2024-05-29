require('dotenv').config();

const config = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  AWS_REGION: 'ap-southeast-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
};

const AWS = require('aws-sdk');

AWS.config.update({
  region: config.AWS_REGION,
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
});

module.exports = {
  config,
  AWS,
};
