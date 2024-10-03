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
  