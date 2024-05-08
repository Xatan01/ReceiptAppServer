const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController')
const upload = require('../controllers/upload');

router.post('/receipt', upload.single('receiptImage'), receiptController.scanReceipt)

module.exports = router;