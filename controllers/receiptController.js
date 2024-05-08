const sharp = require('sharp');
const Tesseract = require('tesseract.js')

async function scanReceipt(req, res){
    try{
        if(!req.file){
            return res.status(400).json({success: false, error: 'No receipt image provided'});
        }
        const resizedImage = 'uploads/resized_${Date.now()}.jpg'
        await sharp(req.file.path)
        .resize(500)
        .toFile(resizedImage)

        const {data:{text}} = await Tesseract.recognize(resizedImage, 'eng')

        const receipt = new Receipt({text});
        await receipt.save();

        res.json({success: true, text});
    } catch (error) {
        console.error('Error processing receipt', error);
        res.status(500).json({success: false, error: 'Error processing recipt'});
    }
}

module.exports = {
    scanReceipt
};