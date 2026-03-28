const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Scan Google Drive based on submitted JSON
exports.scanGoogleDrive = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No credentials file provided.' });
        }

        // Parse JSON credentials
        let credentials;
        try {
            credentials = JSON.parse(req.file.buffer.toString());
        } catch (error) {
            return res.status(400).json({ success: false, message: 'Invalid JSON file content.' });
        }

        if (!credentials.client_email || !credentials.private_key) {
            return res.status(400).json({ success: false, message: 'Invalid Google Service Account JSON. Missing client_email or private_key.' });
        }

        // Authenticate with Google Drive
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive'],
        });

        const drive = google.drive({ version: 'v3', auth });

        // Get account info
        // Note: For service accounts, 'about' might not have user info, but we can get email
        const email = credentials.client_email;

        // Fetch Shared Drives
        let sharedDrives = [];
        try {
            const drivesRes = await drive.drives.list();
            if (drivesRes.data.drives) {
                sharedDrives = drivesRes.data.drives.map(d => ({
                    id: d.id,
                    name: d.name,
                    isSharedDrive: true
                }));
            }
        } catch (err) {
            console.error("Shared Drives error:", err.message);
        }

        // Fetch Folders from My Drive and all Shared Drives
        const folders = [];
        try {
            const params = {
                q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
                fields: 'nextPageToken, files(id, name, mimeType, size, parents)',
                supportsAllDrives: true,
                includeItemsFromAllDrives: true,
                pageSize: 1000,
            };

            let pageToken = null;
            do {
                if (pageToken) params.pageToken = pageToken;
                const folderRes = await drive.files.list(params);
                if (folderRes.data.files) {
                    folderRes.data.files.forEach(f => {
                        folders.push({
                            id: f.id,
                            name: f.name,
                            parents: f.parents || ['root'],
                            isSharedDrive: false
                        });
                    });
                }
                pageToken = folderRes.data.nextPageToken;
            } while (pageToken);
        } catch (err) {
            console.error("Folders error:", err.message);
            return res.status(500).json({ success: false, message: 'Failed to access Google Drive API: ' + err.message });
        }

        // Return combined data
        res.status(200).json({
            success: true,
            account: {
                email,
            },
            drives: sharedDrives,
            folders: folders,
            credentialsRaw: JSON.stringify(credentials) // Pass it back so the frontend can send it on save
        });

    } catch (error) {
        console.error('Drive Scan Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error while scanning Drive'
        });
    }
};

// Save Configuration
exports.saveGoogleDriveConfig = async (req, res) => {
    try {
        const { credentialsRaw, folderId } = req.body;

        if (!credentialsRaw || !folderId) {
            return res.status(400).json({ success: false, message: 'Missing credentials or folder ID.' });
        }

        const credentials = JSON.parse(credentialsRaw);
        const email = credentials.client_email;
        const privateKey = credentials.private_key.replace(/\n/g, "\\n");

        const envPath = path.resolve(process.cwd(), '.env');
        let envFile = '';

        if (fs.existsSync(envPath)) {
            envFile = fs.readFileSync(envPath, 'utf8');
        }

        // Helper to update or append env var
        const updateEnvVar = (fileContent, key, value) => {
            const regex = new RegExp(`^${key}=.*`, 'm');
            // Safely escape value if needed (mostly private key needs quotes if multi-line, but JSON private key already has \n)
            const formattedValue = value.includes('\\n') ? `"${value}"` : value;

            if (regex.test(fileContent)) {
                return fileContent.replace(regex, `${key}=${formattedValue}`);
            } else {
                return fileContent + `\n${key}=${formattedValue}`;
            }
        };

        envFile = updateEnvVar(envFile, 'GOOGLE_CLIENT_EMAIL', email);
        envFile = updateEnvVar(envFile, 'GOOGLE_PRIVATE_KEY', privateKey);
        envFile = updateEnvVar(envFile, 'GOOGLE_DRIVE_FOLDER_ID', folderId);

        // Optional: Save Shared Drive ID if the chosen folder belongs to one. For now, tracking just Folder ID is fine, 
        // as googleDriveService is set to use supportsAllDrives=true anyway.

        // Delay writing to .env so the 200 OK reaches the client before nodemon resets the server
        setTimeout(() => {
            fs.writeFileSync(envPath, envFile, 'utf8');
        }, 500);

        // Note: process.env won't immediately reflect these changes in the current Node process unless we manually set them:
        process.env.GOOGLE_CLIENT_EMAIL = email;
        process.env.GOOGLE_PRIVATE_KEY = privateKey;
        process.env.GOOGLE_DRIVE_FOLDER_ID = folderId;

        res.status(200).json({
            success: true,
            message: 'Google Drive configuration saved successfully.'
        });

    } catch (error) {
        console.error('Drive Save Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error while saving configuration'
        });
    }
};

exports.getActiveStorage = async (req, res) => {
    try {
        const activeStorage = process.env.ACTIVE_STORAGE_PROVIDER || 'mega';
        res.status(200).json({
            success: true,
            activeStorage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error retrieving active storage'
        });
    }
};

exports.setActiveStorage = async (req, res) => {
    try {
        const { provider } = req.body;
        
        if (!['mega', 'google_drive'].includes(provider)) {
            return res.status(400).json({ success: false, message: 'Invalid storage provider selected.' });
        }

        if (provider === 'google_drive' && (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_DRIVE_FOLDER_ID)) {
             return res.status(400).json({ success: false, message: 'Cannot activate Google Drive because it is missing Service Account configuration.' });
        }

        const envPath = path.resolve(process.cwd(), '.env');
        let envFile = '';

        if (fs.existsSync(envPath)) {
            envFile = fs.readFileSync(envPath, 'utf8');
        }

        const updateEnvVar = (fileContent, key, value) => {
            const regex = new RegExp(`^${key}=.*`, 'm');
            if (regex.test(fileContent)) {
                return fileContent.replace(regex, `${key}=${value}`);
            } else {
                return fileContent + `\n${key}=${value}`;
            }
        };

        envFile = updateEnvVar(envFile, 'ACTIVE_STORAGE_PROVIDER', provider);
        process.env.ACTIVE_STORAGE_PROVIDER = provider;
        res.status(200).json({
            success: true,
            message: `Successfully updated active storage to ${provider === 'google_drive' ? 'Google Drive' : 'Mega Drive'}.`
        });

        // Delay writing to .env so the 200 OK reaches the client before nodemon resets the server
        setTimeout(() => {
            fs.writeFileSync(envPath, envFile, 'utf8');
        }, 500);

    } catch (error) {
        console.error('Set Active Storage Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while setting active storage'
        });
    }
};
