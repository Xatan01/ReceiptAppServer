const multer = require('multer');

const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')){
        return cb(new Error('Only image files are allowed'))
    }
    cb(null, true)
};

const upload = multer({
    dest: 'uploads/',
    fileFilter: fileFilter
});
module.exports = upload;
