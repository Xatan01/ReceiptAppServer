const mysql = require('mysql');

// MySQL connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database_name'
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

// Usage example
authenticateUser('john_doe', 'hashed_password', (err, authenticated) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('User authenticated:', authenticated);
});
