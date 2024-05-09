-- Create a table to store user information
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- History of each user receipt scans
CREATE TABLE receipt_scans (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    receipt_image BYTEA, -- Assuming you store the image as binary data
    receipt_desc VARCHAR(255) -- Result of the generated description after scanning
);
