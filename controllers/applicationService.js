const { processScan } = require('./textractService');

const handleScan = async (req, res) => {
    try {
      console.log("File received:", req.file); // Log received file details
  
      const file = req.file;
      if (!file) {
        return res.status(400).send({ error: "No file uploaded" });
      }
  
      console.log("Starting scan..."); // Log before calling processScan
      const scanResult = await processScan(file);
      console.log("Scan complete:", scanResult); // Log scan result
  
      res.status(200).send(scanResult);
    } catch (error) {
      console.error("Error scanning file:", error);
      res.status(500).send({ error: "Failed to scan file" });
    }
  };
  

module.exports = {
    handleScan,
};
