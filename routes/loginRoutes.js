const express = require('express');
const jwt = require('jsonwebtoken'); 
const router = express.Router();
const { authenticateUser } = require('./controllers/login');

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  authenticateUser(email, password, (err, authenticated) => {
    if (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Internal Server Error' });
      return;
    }
    if (authenticated) {
      // User authenticated successfully
      // Generate JWT token
      const crypto = require('crypto');
      const secretKey= crypto.randomBytes(64).toString('hex');
      const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' }); // Change 'your_secret_key' to your actual secret key
      // Send JWT token to the frontend
      res.status(200).json({ message: 'Login successful', token });
    } else {
      // Authentication failed
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

module.exports = router;
