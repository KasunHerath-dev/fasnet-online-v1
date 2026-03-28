const { google } = require('googleapis');
const stream = require('stream');

// Setup Google Drive Auth Client
const createDriveClient = () => {
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
 * @returns {Promise<{nodeId: string, link: string}>} - The ID and Web View Link.
 */
const uploadToDrive = async (fileBuffer, fileName, mimeType) => {
    const drive = createDriveClient();
    
    if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
        throw new Error("Missing GOOGLE_DRIVE_FOLDER_ID in environment variables.");
    }

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const fileMetadata = {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
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

module.exports = {
    uploadToDrive,
    deleteFromDrive,
    getFileStream
};
