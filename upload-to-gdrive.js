const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { exec } = require('child_process');

// Load OAuth2 client credentials
const CREDENTIALS_PATH = './credentials.json'; // Replace with your credentials file path
const TOKEN_PATH = './token.json'; // This will store your OAuth token after authorization
const GENERATED_FILE_PATH = './generated-file.txt'; // The path of the file created by create_file.js

// Function to run create_file.js
function generateFile() {
  return new Promise((resolve, reject) => {
    console.log('Generating file...');
    exec('node create_file.js', (error, stdout, stderr) => {
      if (error) {
        console.error('Error generating file:', error);
        reject(error);
      }
      console.log(stdout);
      resolve();
    });
  });
}

// Function to authenticate with Google Drive
async function authenticate() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if token is stored
  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH, 'utf8');
    oAuth2Client.setCredentials(JSON.parse(token));
  } else {
    // Generate a new token
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.file'],
    });
    console.log('Authorize this app by visiting this URL:', authUrl);
    // After visiting the URL and authorizing the app, save the token in TOKEN_PATH
    // You can automate this step in your application flow
  }

  return oAuth2Client;
}

// Function to upload the file to Google Drive
async function uploadFile(auth) {
  const drive = google.drive({ version: 'v3', auth });

  // File metadata
  const fileMetadata = {
    name: 'generated-file.txt', // Name to be given to the file on Google Drive
  };

  // Media/content of the file
  const media = {
    mimeType: 'text/plain',
    body: fs.createReadStream(GENERATED_FILE_PATH),
  };

  // Upload the file
  try {
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    console.log('File uploaded successfully, File ID:', response.data.id);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

// Main function to run the whole process
(async () => {
  try {
    // Step 1: Generate the file
    await generateFile();

    // Step 2: Authenticate with Google Drive
    const auth = await authenticate();

    // Step 3: Upload the generated file to Google Drive
    await uploadFile(auth);
  } catch (error) {
    console.error('Error:', error);
  }
})();
