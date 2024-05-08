const express = require('express');
const cors = require('cors');
const path = require('path'); // Import the path module
const app = express();

app.use(cors());
app.use(express.json());

// Import routes
const receiptRoutes = require('./routes/receiptRoutes');

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// Use routes
app.use('/api/scan', receiptRoutes);

// Serve the frontend index.html for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
