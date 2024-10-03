const fs = require('fs');

// File path and name
const filePath = './generated-file.txt';

// Get the current timestamp
const timestamp = new Date().toISOString(); // ISO format (e.g., 2024-10-03T12:34:56.789Z)

// Content to write to the file
const content = `Hello, this is a simple text file created by Node.js!\nFile created at: ${timestamp}`;

// Create the file
fs.writeFile(filePath, content, (err) => {
  if (err) {
    console.error('Error writing file:', err);
  } else {
    console.log(`File successfully created at ${filePath}, timestamp ${timestamp}`);
  }
});
