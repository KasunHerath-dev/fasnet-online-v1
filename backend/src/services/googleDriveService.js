const { google } = require('googleapis');
const stream = require('stream');

// Setup Google Drive Auth Client
const createDriveClient = () => {
    // 1. Prefer OAuth2 Delegation (Bypasses 0GB Service Account Quota on free accounts)
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            "https://developers.google.com/oauthplayground"
        );
        oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
        return google.drive({ version: 'v3', auth: oauth2Client });
    }

    // 2. Fallback to Service Account (Requires Workspace "Shared Drives" to avoid 0GB Quota)
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        throw new Error("Missing Google Drive credentials in environment variables.");
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle env stringified newlines
        },
        scopes: ['https://www.googleapis.com/auth/drive'],
    });

    return google.drive({ version: 'v3', auth });
};

/**
 * Uploads a file buffer to Google Drive.
 * @param {Buffer} fileBuffer - The memory buffer of the file.
 * @param {string} fileName - Destination file name.
 * @param {string} mimeType - The mime type of the file.
 * @param {string} parentId - Optional parent folder ID (defaults to root).
 * @returns {Promise<{nodeId: string, link: string}>} - The ID and Web View Link.
 */
const uploadToDrive = async (fileBuffer, fileName, mimeType, parentId = null) => {
    const drive = createDriveClient();
    
    // Fallback to GOOGLE_DRIVE_FOLDER_ID from .env if parentId is not provided
    const folderId = parentId || process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!folderId) {
        throw new Error("Missing parent folder ID or GOOGLE_DRIVE_FOLDER_ID in environment variables.");
    }

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const fileMetadata = {
        name: fileName,
        parents: [folderId]
    };

    const media = {
        mimeType: mimeType || 'application/octet-stream',
        body: bufferStream,
    };

    // 1. Create the file in Drive
    const createOptions = {
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink, webContentLink',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
    };

    if (process.env.GOOGLE_DRIVE_SHARED_DRIVE_ID) {
        createOptions.driveId = process.env.GOOGLE_DRIVE_SHARED_DRIVE_ID;
    }

    const driveResponse = await drive.files.create(createOptions);

    const fileId = driveResponse.data.id;

    // 2. Set Public Read Permissions so anyone can access via link
    await drive.permissions.create({
        fileId: fileId,
        requestBody: { role: 'reader', type: 'anyone' },
        supportsAllDrives: true,
    });

    return {
        nodeId: fileId, // Using 'nodeId' naming convention to match Mega
        // use webContentLink for direct download fallback, webViewLink for viewing
        link: driveResponse.data.webContentLink || driveResponse.data.webViewLink
    };
};

/**
 * Deletes a file from Google Drive.
 * @param {string} fileId - The Google Drive file ID.
 * @returns {Promise<boolean>}
 */
const deleteFromDrive = async (fileId) => {
    const drive = createDriveClient();
    
    try {
        await drive.files.delete({ fileId, supportsAllDrives: true });
        return true;
    } catch (error) {
        if (error.code === 404 || error.message.includes('File not found')) {
            console.warn(`[Google Drive] Delete ignored. File ${fileId} not found.`);
            return true; // Already gone
        }
        console.error(`[Google Drive] Error deleting file ${fileId}:`, error);
        throw error;
    }
};

/**
 * Pipes a Google Drive file as a stream (Used by our stream proxy).
 * @param {string} fileId - The Google Drive file ID.
 * @returns {Promise<{ stream: NodeJS.ReadableStream, name: string, size: number, mimeType: string }>}
 */
const getFileStream = async (fileId) => {
    const drive = createDriveClient();

    // 1. Get Metadata for size and name
    const metadataResponse = await drive.files.get({
        fileId: fileId,
        fields: 'name, size, mimeType',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
    });
    
    const { name, size, mimeType } = metadataResponse.data;

    // 2. Get Media Stream
    const streamResponse = await drive.files.get(
        { fileId: fileId, alt: 'media', supportsAllDrives: true, includeItemsFromAllDrives: true },
        { responseType: 'stream' }
    );

    return {
        stream: streamResponse.data,
        name: name,
        size: Number(size),
        mimeType: mimeType
    };
};

/**
 * Ensures a folder exists under a parent. Returns folder ID.
 * Supports Shared Drives by using appropriate corpora and driveId settings.
 */
const getOrCreateFolder = async (parentId, folderName) => {
    const drive = createDriveClient();
    const sharedDriveId = process.env.GOOGLE_DRIVE_SHARED_DRIVE_ID;
    
    // Clean name for sanity
    const cleanName = folderName.trim().replace(/'/g, "\\'");

    // 1. Check if folder already exists under this parent
    const q = `name = '${cleanName}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`;
    
    const listOptions = {
        q,
        fields: 'files(id)',
        spaces: 'drive',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
    };

    // If we're in a Shared Drive context, search the specific drive
    if (sharedDriveId) {
        listOptions.corpora = 'drive';
        listOptions.driveId = sharedDriveId;
    }

    const findResponse = await drive.files.list(listOptions);

    if (findResponse.data.files && findResponse.data.files.length > 0) {
        return findResponse.data.files[0].id;
    }

    // 2. Create it if not found
    const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
    };

    const createResponse = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
        supportsAllDrives: true, // Crucial for Shared Drives
    });

    return createResponse.data.id;
};

module.exports = {
    createDriveClient,
    uploadToDrive,
    deleteFromDrive,
    getFileStream,
    getOrCreateFolder
};
