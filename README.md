# Google Drive Scheduled File Uploader By Git Actions Workflow

This repository automates the process of generating a file and uploading it to a specific folder in Google Drive using GitHub Actions. The workflow is scheduled to run periodically (e.g., every 5 minutes) using GitHub's cron job scheduling. It covers:

- [**Setting Up Google Drive API**](#setting-up-google-drive-api)
- [**GitHub Actions Secrets**](#github-actions-secrets)
- [**How to Use**](#how-to-use)

---

## Setting Up Google Drive API
[[Back to Top](#google-drive-scheduled-file-uploader-by-git-actions-workflow)]

1. **Enable Google Drive API**: 
   - Visit the [Google Cloud Console](https://console.developers.google.com/).
   - Create a new project or select an existing one.
   - Go to **APIs & Services > Library** and enable the **Google Drive API**.

2. **Create OAuth2 Credentials**:
   - Navigate to **APIs & Services > Credentials**.
   - Click **Create Credentials > OAuth 2.0 Client ID**.
   - For **Application type**, choose **Desktop app**.
   - Enter a name for your OAuth client and click **Create**.

3. **Download `credentials.json`**:
   - Once the OAuth2 client is created, click **Download JSON**. This will be your `credentials.json` file containing client details required for authentication.

4. **Generate Access & Refresh Tokens**:
   - Use the `credentials.json` to obtain an authorization code by visiting the URL provided by the app.
   - Exchange this authorization code for access and refresh tokens, which will be stored in `token.json`.

> [!TIP]
> This repo assumes that you do not have a server to handle the OAuth2 redirect URI, in which case you will need to manually copy your authorization code and paste it in Git Actions Secrets. Refer to [**How To Use**](#how-to-use) section's important tip.

---

## GitHub Actions Secrets
[[Back to Top](#google-drive-scheduled-file-uploader-by-git-actions-workflow)]

To securely store sensitive information like your OAuth credentials and tokens, add the following secrets to your GitHub repository:

1. **`GOOGLE_CREDENTIALS_JSON`**: 
   - Base64-encode the content of your `credentials.json` file:
     ```bash
     base64 credentials.json
     ```
   - Copy the encoded string and add it as a GitHub secret with the name `GOOGLE_CREDENTIALS_JSON`.

2. **`GOOGLE_AUTH_CODE`**:
   - Generate an OAuth2 authorization code and store it as a GitHub secret with the name `GOOGLE_AUTH_CODE`.

3. **`GOOGLE_TOKEN_JSON_BASE64`** (Optional):
   - If you have already generated `token.json`, base64-encode it:
     ```bash
     base64 token.json
     ```
   - Copy the encoded string and add it as a GitHub secret with the name `GOOGLE_TOKEN_JSON`.

**Adding Secrets in GitHub**:
- Go to your repository on GitHub.
- Navigate to **Settings > Secrets and variables > Actions**.
- Click **New repository secret** and add the secrets as mentioned above.

---

## How to Use
[[Back to Top](#google-drive-scheduled-file-uploader-by-git-actions-workflow)]

1. **Fork/Clone the Repository**: 
   - Fork or clone the repository to your local machine to make any necessary modifications.

2. **Specify Which Files to Schedule Their Upload**: 
   - The NodeJs script [`create_file.js`](create_file.js) creates a text file [`generated-file.txt`](generated-file.txt) with the date-timestamp at the moment of execution, while script `upload-to-gdrive.js` uploads [`generated-file.txt`](generated-file.txt) to Google Drive using API credentials.
   - Re-configure the generated files/uploads according to your needs.

3. **Set Up the Workflow**:
   - The workflow file (`.github/workflows/upload-to-gdrive.yml`) is already configured to generate a file and upload it to Google Drive periodically (e.g., every 5 minutes).
   - Modify the cron schedule as necessary to adjust the frequency of the workflow.

4. **Configure GitHub Actions Secrets**:
   - Make sure the necessary secrets (`GOOGLE_CREDENTIALS_JSON_BASE64`, `GOOGLE_AUTH_CODE`, `GOOGLE_TOKEN_JSON_BASE64`) are correctly set up in your GitHub repository.
  
5. **Run the Workflow Manually (Optional)**:
   - Navigate to the **Actions** tab in your GitHub repository.
   - Select the workflow named "Schedule Script and Upload to GDrive".
   - Click **Run workflow** to manually trigger the workflow for testing purposes.

Once configured, the workflow will run automatically based on the cron schedule defined in the `.yml` file. It will:
     - Generate a file (using `create_file.js`).
     - Authenticate with the Google Drive API.
     - Upload the file to the specified folder on Google Drive (creating the folder if it doesn't exist).

> [!IMPORTANT]
> **If you're using localhost for authorization:**
> - Make sure to set your OAuth2 redirect URI to `http://localhost`.
> - Visit the authorization URL in your browser and manually copy the authorization code from the URL `...code=<CODE>&...`
> - Store your authorization code as a GitHub secret `GOOGLE_AUTH_CODE`.

By following these instructions, you will be able to set up the workflow to generate files and automatically upload them to a Google Drive folder. Make sure to handle your credentials securely and review your workflow logs for any issues during execution.
