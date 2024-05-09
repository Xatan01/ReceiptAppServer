const mysql = require('mysql');

// MySQL connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'user'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Method to authenticate a user
function authenticateUser(username, password, callback) {
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(sql, [username, password], (err, results) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, results.length > 0);
  });
}

// Method to register a new user
function registerUser(username, password, callback) {
  const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
  connection.query(sql, [username, password], (err, results) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null);
  });
}

module.exports = {
  authenticateUser,
  registerUser
};
