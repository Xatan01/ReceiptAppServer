const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Initialize multer for image upload
const upload = multer({ 
    storage: multer.memoryStorage(), 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // limit file size to 5MB
});

function fileFilter(req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf|jfif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Only images and PDFs are allowed"));
    }
}

const {
    handleScan,
    handleHistory,
    handleDeleteSelected
} = require("../controllers/ApplicationService");

// Debugging tool: Displays any routed function performed by this routes file
router.use(function (req, res, next) {
    console.log(req.url, "@", Date.now());
    next();
});

// Define the route for the scanner API
router.post("/api/scan", upload.single('file'), handleScan);

// Define the route for fetching scan history
router.get("/api/history", handleHistory);

// Define the route for deleting selected scan history items
router.post("/api/deleteSelected", handleDeleteSelected); // Add this line

module.exports = router;
