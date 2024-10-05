# Google Drive Scheduled File Uploader By Git Actions Workflow

This repository automates the process of generating a file and uploading it to a specific folder in Google Drive using GitHub Actions. The workflow is scheduled to run periodically (e.g., every 5 minutes) using GitHub's cron job scheduling.

---

## Setting Up Google Drive API

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

> [!IMPORTANT]
> If you do not have a server to handle the OAuth2 redirect URI, configure the **redirect URIs** for your OAuth2 credentials to use `http://localhost`. Alternatively, add `urn:ietf:wg:oauth:2.0:oob` as a redirect URI, which will display the authorization code on the screen for you to manually paste. Refer to [**How To Use**](howtouse) section's important tip.

---

## GitHub Actions Secrets

### **1. Preparing Secrets**

To securely store sensitive information like your OAuth credentials and tokens, add the following secrets to your GitHub repository:

1. **`GOOGLE_CREDENTIALS_JSON_BASE64`**: 
   - Base64-encode the content of your `credentials.json` file:
     ```bash
     base64 credentials.json
     ```
   - Copy the encoded string and add it as a GitHub secret with the name `GOOGLE_CREDENTIALS_JSON_BASE64`.

2. **`GOOGLE_AUTH_CODE`**:
   - Generate an OAuth2 authorization code and store it as a GitHub secret with the name `GOOGLE_AUTH_CODE`.

3. **`GOOGLE_TOKEN_JSON_BASE64`** (Optional):
   - If you have already generated `token.json`, base64-encode it:
     ```bash
     base64 token.json
     ```
   - Copy the encoded string and add it as a GitHub secret with the name `GOOGLE_TOKEN_JSON_BASE64`.

**Adding Secrets in GitHub**:
- Go to your repository on GitHub.
- Navigate to **Settings > Secrets and variables > Actions**.
- Click **New repository secret** and add the secrets as mentioned above.

---

## How to Use

1. **Fork/Clone the Repository**: 
   - Fork or clone the repository to your local machine to make any necessary modifications.

2. **Set Up the Workflow**:
   - The workflow file (`.github/workflows/upload-to-gdrive.yml`) is already configured to generate a file and upload it to Google Drive periodically (e.g., every 5 minutes).
   - Modify the cron schedule as necessary to adjust the frequency of the workflow.

3. **Configure GitHub Actions Secrets**:
   - Make sure the necessary secrets (`GOOGLE_CREDENTIALS_JSON_BASE64`, `GOOGLE_AUTH_CODE`, `GOOGLE_TOKEN_JSON_BASE64`) are correctly set up in your GitHub repository.

4. **Run the Workflow Manually (Optional)**:
   - Navigate to the **Actions** tab in your GitHub repository.
   - Select the workflow named "Schedule Script and Upload to GDrive".
   - Click **Run workflow** to manually trigger the workflow for testing purposes.

5. **Schedule the Workflow**:
   - Once configured, the workflow will run automatically based on the cron schedule defined in the `.yml` file.
   - The workflow will:
     - Generate a file (using `create_file.js`).
     - Authenticate with the Google Drive API.
     - Upload the file to the specified folder on Google Drive (creating the folder if it doesn't exist).

> [!IMPORTANT]
> **If you're using localhost for authorization:**
> - Make sure to set your OAuth2 redirect URI to `http://localhost`.
> - Visit the authorization URL in your browser and manually copy the authorization code.
> - In your GitHub Actions workflow:
>   - Ensure that your secrets are correctly base64-encoded and stored as GitHub secrets.
>   - Use `printf` instead of `echo` to properly preserve JSON formatting:
>     ```yaml
>     - name: Create credentials.json
>       run: printf "%s" "${{ secrets.GOOGLE_CREDENTIALS_JSON_BASE64 }}" | base64 -d > credentials.json
>     ```

By following these instructions, you will be able to set up the workflow to generate files and automatically upload them to a Google Drive folder. Make sure to handle your credentials securely and review your workflow logs for any issues during execution.
