-- Create a table to store user information
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Create a table to store user sessions
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Register a new user
INSERT INTO users (username, password) VALUES ('john_doe', 'hashed_password');

-- Authenticate user
SELECT * FROM users WHERE username = 'john_doe' AND password = 'hashed_password';

-- History of each user receipt scans
CREATE TABLE receipt_scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    receipt_image LONGBLOB, -- Assuming you store the image as PNG and JPEG
    receipt_desc VARCHAR(255), -- Result of the generated description after scanning
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Log history everytime the user scans something
INSERT INTO receipt_scans (user_id, receipt_image) VALUES (user_id_value, image_data);
