const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { exec } = require('child_process');

// Constants
const CREDENTIALS_PATH = './credentials.json'; // Path to credentials file
const TOKEN_PATH = './token.json'; // Path to token file
const GENERATED_FILE_PATH = './generated-file.txt'; // Path to the generated file
const FOLDER_NAME = 'Uploaded Via Git Actions'; // Name of the folder in Google Drive

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

  // Check if token is already stored
  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH, 'utf8');
    oAuth2Client.setCredentials(JSON.parse(token));
  } else {
    // Retrieve the authorization code from the environment variable
    const code = process.env.GOOGLE_AUTH_CODE;

    if (!code) {
      console.error('Authorization code not found in environment variables.');
      return;
    }

    // Exchange code for tokens
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      // Store the token for future use
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
      console.log('Token stored to', TOKEN_PATH);
      // Set the credentials for OAuth2 client
      oAuth2Client.setCredentials(tokens);
    } catch (err) {
      console.error('Error retrieving access token', err);
      return;
    }
  }

  return oAuth2Client;
}

// Function to get or create folder in Google Drive
async function getOrCreateFolder(drive) {
  // Step 1: Check if folder exists
  let folderId;
  try {
    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false`,
      fields: 'files(id, name)',
    });

    const folders = response.data.files;
    if (folders.length > 0) {
      // Folder exists, use the ID
      folderId = folders[0].id;
      console.log(`Found folder '${FOLDER_NAME}' with ID: ${folderId}`);
    } else {
      // Folder not found, create it
      console.log(`Folder '${FOLDER_NAME}' not found. Creating new folder...`);
      const fileMetadata = {
        name: FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      };
      const folder = await drive.files.create({
        resource: fileMetadata,
        fields: 'id',
      });
      folderId = folder.data.id;
      console.log(`Folder '${FOLDER_NAME}' created with ID: ${folderId}`);
    }
  } catch (error) {
    console.error('Error finding or creating folder:', error);
    throw error;
  }

  return folderId;
}

// Function to upload the file to Google Drive
async function uploadFile(auth) {
  const drive = google.drive({ version: 'v3', auth });

  // Get or create the folder
  const folderId = await getOrCreateFolder(drive);

  // File metadata with the parent folder ID
  const fileMetadata = {
    name: 'generated-file.txt',
    parents: [folderId], // Specify the folder to upload the file into
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
