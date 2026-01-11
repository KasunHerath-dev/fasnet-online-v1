const { google } = require('googleapis');
const stream = require('stream');
const SystemSetting = require('../models/SystemSetting');

class GoogleDriveService {
    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
        this.isAuthorized = false;
    }

    /**
     * Ensure the client has valid credentials (from memory or DB)
     */
    async ensureAuthorized() {
        if (this.isAuthorized) return;

        try {
            // Try fetching token from DB
            const setting = await SystemSetting.findOne({ key: 'GOOGLE_REFRESH_TOKEN' });

            if (setting && setting.value) {
                this.oauth2Client.setCredentials({
                    refresh_token: setting.value
                });
                this.isAuthorized = true;
                console.log('Google Drive: Authorized using DB token');
            } else if (process.env.GOOGLE_REFRESH_TOKEN) {
                // Fallback to Env
                this.oauth2Client.setCredentials({
                    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
                });
                this.isAuthorized = true;
                console.log('Google Drive: Authorized using ENV token');
            } else {
                console.log('Google Drive: No refresh token found in DB or ENV');
            }
        } catch (error) {
            console.error('Google Drive Auth Check Failed:', error);
        }
    }

    /**
     * Generate the URL for the user to authorize the app
     */
    generateAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/drive.file' // Only access files created by this app
        ];

        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline', // Required to get a refresh token
            scope: scopes,
            prompt: 'consent' // Force consent to ensure refresh token is returned
        });
    }

    /**
     * Exchange authorization code for tokens
     * @param {string} code - The code from the callback URL
     */
    async getTokens(code) {
        const { tokens } = await this.oauth2Client.getToken(code);
        return tokens;
    }

    /**
     * Upload a file to Google Drive
     * @param {Object} fileObject - The file object from Multer (buffer, mimetype, originalname)
     * @param {string} folderId - (Optional) The ID of the folder to upload to
     */
    async uploadFile(fileObject, folderId = null) {
        await this.ensureAuthorized();

        if (!this.isAuthorized) {
            throw new Error('Google Drive is not authorized. Please visit Admin > Resources to connect.');
        }

        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileObject.buffer);

        // Preference: 1. Argument, 2. Env, 3. Root (null)
        const targetFolder = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

        const fileMetadata = {
            name: fileObject.originalname,
            mimeType: fileObject.mimetype
        };

        if (targetFolder) {
            fileMetadata.parents = [targetFolder];
        }

        try {
            const response = await this.drive.files.create({
                requestBody: fileMetadata,
                media: {
                    mimeType: fileObject.mimetype,
                    body: bufferStream
                }
            });

            return response.data;
        } catch (error) {
            // Check for specific error reasons
            const reason = error.errors?.[0]?.reason || 'unknown';
            console.error(`Google Drive Upload Error (${reason}):`, error.message);
            throw error;
        }
    }

    /**
     * Delete a file from Google Drive
     * @param {string} fileId 
     */
    async deleteFile(fileId) {
        await this.ensureAuthorized();
        try {
            await this.drive.files.delete({
                fileId: fileId
            });
            return true;
        } catch (error) {
            console.error('Google Drive Delete Error:', error.message);
            return false;
        }
    }
}

module.exports = new GoogleDriveService();
