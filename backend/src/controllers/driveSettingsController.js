const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const megaService = require('../services/megaService');

// Scan Google Drive based on submitted JSON or OAuth Strings
exports.scanGoogleDrive = async (req, res) => {
    try {
        let auth;
        let email = 'Unknown OAuth Account';
        let credentialsToSave = {};

        // 1. Check if OAuth credentials were submitted as text fields
        if (req.body.clientId && req.body.clientSecret && req.body.refreshToken) {
            auth = new google.auth.OAuth2(
                req.body.clientId,
                req.body.clientSecret,
                "https://developers.google.com/oauthplayground"
            );
            auth.setCredentials({ refresh_token: req.body.refreshToken });
            credentialsToSave = {
                type: 'oauth2',
                clientId: req.body.clientId,
                clientSecret: req.body.clientSecret,
                refreshToken: req.body.refreshToken
            };
        } 
        // 2. Check if Service Account JSON was uploaded
        else if (req.file) {
            let credentials;
            try {
                credentials = JSON.parse(req.file.buffer.toString());
            } catch (error) {
                return res.status(400).json({ success: false, message: 'Invalid JSON file content.' });
            }

            if (!credentials.client_email || !credentials.private_key) {
                return res.status(400).json({ success: false, message: 'Invalid Google Service Account JSON. Missing client_email or private_key.' });
            }

            auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/drive'],
            });
            email = credentials.client_email;
            credentialsToSave = {
                type: 'service_account',
                clientEmail: credentials.client_email,
                privateKey: credentials.private_key
            };
        } else {
            return res.status(400).json({ success: false, message: 'No credentials provided (File or OAuth strings expected).' });
        }

        const drive = google.drive({ version: 'v3', auth });

        // If OAuth2, we can fetch real user email
        if (credentialsToSave.type === 'oauth2') {
            try {
                const aboutRes = await drive.about.get({ fields: 'user(emailAddress)' });
                if (aboutRes.data.user && aboutRes.data.user.emailAddress) {
                    email = aboutRes.data.user.emailAddress;
                }
            } catch (err) {
                console.warn("Could not fetch OAuth user email, token might lack identity scope, proceeding anyway...");
            }
        }

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
            credentialsRaw: JSON.stringify(credentialsToSave) // Standardized format for frontend
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
        const { credentialsRaw, folderId, sharedDriveId } = req.body;

        if (!credentialsRaw || !folderId) {
            return res.status(400).json({ success: false, message: 'Missing credentials or folder ID.' });
        }

        const credentials = JSON.parse(credentialsRaw);
        const { type } = credentials;

        const envPath = path.resolve(process.cwd(), '.env');
        let envFile = '';

        if (fs.existsSync(envPath)) {
            envFile = fs.readFileSync(envPath, 'utf8');
        }

        // Helper to update or append env var
        const updateEnvVar = (fileContent, key, value) => {
            if (value === undefined || value === null) return fileContent; // Skip if null/undefined
            const regex = new RegExp(`^${key}=.*`, 'm');
            // Safely escape value if needed (mostly private key needs quotes if multi-line, but JSON private key already has \n)
            const formattedValue = value.includes('\\n') ? `"${value}"` : value;

            if (regex.test(fileContent)) {
                return fileContent.replace(regex, `${key}=${formattedValue}`);
            } else {
                return fileContent + `\n${key}=${formattedValue}`;
            }
        };

        envFile = updateEnvVar(envFile, 'GOOGLE_DRIVE_FOLDER_ID', folderId);

        if (type === 'oauth2') {
            envFile = updateEnvVar(envFile, 'GOOGLE_CLIENT_ID', credentials.clientId);
            envFile = updateEnvVar(envFile, 'GOOGLE_CLIENT_SECRET', credentials.clientSecret);
            envFile = updateEnvVar(envFile, 'GOOGLE_REFRESH_TOKEN', credentials.refreshToken);
            
            process.env.GOOGLE_CLIENT_ID = credentials.clientId;
            process.env.GOOGLE_CLIENT_SECRET = credentials.clientSecret;
            process.env.GOOGLE_REFRESH_TOKEN = credentials.refreshToken;
        } else if (type === 'service_account') {
            const privateKey = credentials.privateKey.replace(/\n/g, "\\n");
            envFile = updateEnvVar(envFile, 'GOOGLE_CLIENT_EMAIL', credentials.clientEmail);
            envFile = updateEnvVar(envFile, 'GOOGLE_PRIVATE_KEY', privateKey);

            process.env.GOOGLE_CLIENT_EMAIL = credentials.clientEmail;
            process.env.GOOGLE_PRIVATE_KEY = privateKey;
        }
        
        // Save Shared Drive ID if provided
        if (sharedDriveId) {
            envFile = updateEnvVar(envFile, 'GOOGLE_DRIVE_SHARED_DRIVE_ID', sharedDriveId);
            process.env.GOOGLE_DRIVE_SHARED_DRIVE_ID = sharedDriveId;
        }

        // Delay writing to .env so the 200 OK reaches the client before nodemon resets the server
        setTimeout(() => {
            fs.writeFileSync(envPath, envFile, 'utf8');
        }, 800);

        process.env.GOOGLE_DRIVE_FOLDER_ID = folderId;

        res.status(200).json({
            success: true,
            message: 'Google Drive configuration saved successfully. (Note: Shared Drive support is now active)'
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

exports.getStorageHealth = async (req, res) => {
    try {
        const activeStorage = process.env.ACTIVE_STORAGE_PROVIDER || 'mega';

        // --- Mega Health ---
        const megaConfigured = !!(process.env.MEGA_EMAIL && process.env.MEGA_PASSWORD);

        // --- Google Drive Health ---
        const hasOAuth = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN);
        const hasServiceAccount = !!(process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
        const driveConfigured = hasOAuth || hasServiceAccount;
        const driveType = hasOAuth ? 'oauth2' : hasServiceAccount ? 'service_account' : null;
        const driveAccount = hasOAuth ? process.env.GOOGLE_CLIENT_ID?.split('-')[0] + '...' : process.env.GOOGLE_CLIENT_EMAIL || null;
        const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;

        res.status(200).json({
            success: true,
            health: {
                activeStorage,
                mega: {
                    configured: megaConfigured,
                    email: megaConfigured ? process.env.MEGA_EMAIL : null,
                },
                googleDrive: {
                    configured: driveConfigured,
                    type: driveType,
                    account: driveAccount,
                    folderId: driveFolderId,
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.setActiveStorage = async (req, res) => {
    try {
        const { provider } = req.body;
        
        if (!['mega', 'google_drive'].includes(provider)) {
            return res.status(400).json({ success: false, message: 'Invalid storage provider selected.' });
        }

        const hasOAuth = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN;
        const hasServiceAcc = process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY;

        if (provider === 'google_drive' && !hasOAuth && !hasServiceAcc) {
             return res.status(400).json({ success: false, message: 'Cannot activate Google Drive because it is missing Service Account or OAuth configuration.' });
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

exports.exploreDriveFolder = async (req, res) => {
    try {
        let auth;
        if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
            auth = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                "https://developers.google.com/oauthplayground"
            );
            auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
        } else if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
            auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_CLIENT_EMAIL,
                    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                },
                scopes: ['https://www.googleapis.com/auth/drive'],
            });
        } else {
            return res.status(400).json({ success: false, message: 'Google Drive is not configured in environment.' });
        }

        const { folderId } = req.query; // If empty, we list Root + Shared Drives

        const drive = google.drive({ version: 'v3', auth });

        let files = [];
        let folders = [];
        
        if (!folderId || folderId === 'root_drives') {
             // 1. Fetch Shared Drives
             try {
                const drivesRes = await drive.drives.list();
                if (drivesRes.data.drives) {
                    drivesRes.data.drives.forEach(d => folders.push({
                        id: d.id,
                        name: d.name,
                        mimeType: 'application/vnd.google-apps.drive',
                        isSharedDrive: true
                    }));
                }
             } catch(e) { console.error("Shared drive error:", e.message); }

             // 2. Fetch Root Folders/Files of the Service Account
             try {
                 const params = {
                     q: "'root' in parents and trashed=false",
                     fields: 'files(id, name, mimeType, size, parents)',
                     supportsAllDrives: true,
                     includeItemsFromAllDrives: true,
                     pageSize: 1000,
                 };
                 const folderRes = await drive.files.list(params);
                 if (folderRes.data.files) {
                     folderRes.data.files.forEach(f => {
                         if (f.mimeType === 'application/vnd.google-apps.folder') folders.push(f);
                         else files.push(f);
                     });
                 }
             } catch(e) { console.error("Root drive error:", e.message); }
        } else {
             // Search inside specific Folder OR Shared Drive Root (ID is same)
             try {
                 const params = {
                     q: `'${folderId}' in parents and trashed=false`,
                     fields: 'files(id, name, mimeType, size, parents)',
                     supportsAllDrives: true,
                     includeItemsFromAllDrives: true,
                     pageSize: 1000,
                 };
                 
                 const folderRes = await drive.files.list(params);
                 if (folderRes.data.files) {
                     folderRes.data.files.forEach(f => {
                         if (f.mimeType === 'application/vnd.google-apps.folder') folders.push(f);
                         else files.push(f);
                     });
                 }
             } catch(e) { 
                 console.error("Folder exploration error:", e.message); 
                 return res.status(500).json({ success: false, message: 'Drive query failed: ' + e.message });
             }
        }

        // Sort folders first, alphabetically, then files alphabetically
        folders.sort((a,b) => a.name.localeCompare(b.name));
        files.sort((a,b) => a.name.localeCompare(b.name));

        res.status(200).json({
            success: true,
            folders,
            files
        });

    } catch (error) {
        console.error('Drive Explorer Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error while exploring Drive'
        });
    }
};

exports.exploreMegaFolder = async (req, res) => {
    try {
        if (!process.env.MEGA_EMAIL || !process.env.MEGA_PASSWORD) {
            return res.status(400).json({ success: false, message: 'Mega Drive is not configured in environment.' });
        }

        const { folderId } = req.query; // If empty, we list Root

        // Use existing megaService exactly as is
        const storage = await megaService.connectToMega();
        
        let targetFolderNode = storage.root;
        
        if (folderId && folderId !== 'root_drives') {
            targetFolderNode = Object.values(storage.files).find(f => f.nodeId === folderId);
            if (!targetFolderNode) {
                return res.status(404).json({ success: false, message: 'Folder not found in Mega Drive' });
            }
        }

        let folders = [];
        let files = [];

        // In megaJS, targetFolderNode.children is an array of child file objects.
        if (targetFolderNode.children) {
            targetFolderNode.children.forEach(node => {
                if (node.directory) {
                    folders.push({
                        id: node.nodeId,
                        name: node.name,
                        mimeType: 'application/vnd.google-apps.folder', // Mimic Google UI for consistency
                        isSharedDrive: false
                    });
                } else {
                    // Try to guess mime type crudely based on extension for better icons
                    let ext = node.name.split('.').pop().toLowerCase();
                    let mime = 'application/octet-stream';
                    if (['pdf'].includes(ext)) mime = 'application/pdf';
                    if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) mime = 'image/jpeg';
                    if (['csv', 'xls', 'xlsx'].includes(ext)) mime = 'text/csv';

                    files.push({
                        id: node.nodeId,
                        name: node.name,
                        mimeType: mime,
                        size: node.size
                    });
                }
            });
        }

        // Sort alphabetically
        folders.sort((a,b) => a.name.localeCompare(b.name));
        files.sort((a,b) => a.name.localeCompare(b.name));

        res.status(200).json({
            success: true,
            folders,
            files
        });

    } catch (error) {
        console.error('Mega Explorer Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error while exploring Mega Drive'
        });
    }
};

