const { Storage, File } = require('megajs');

let storage = null;

/**
 * Always get a fresh or cached connected MEGA storage instance.
 * Forces reload of storage.files on every call to avoid stale cache.
 */
const connectToMega = async (forceReload = false) => {
    if (storage && !forceReload) return storage;

    try {
        storage = await new Storage({
            email: process.env.MEGA_EMAIL,
            password: process.env.MEGA_PASSWORD
        }).ready;
        console.log('✅ Connected to MEGA! Files loaded:', Object.keys(storage.files).length);
        return storage;
    } catch (error) {
        storage = null; // Reset so next call tries again
        console.error('❌ MEGA Connection Error:', error);
        throw error;
    }
};

/**
 * Fetch or generate a nested folder natively inside Mega
 */
const getOrCreateFolder = async (parentId, folderName) => {
    const conn = await connectToMega();
    let parentNode = conn.root;
    
    if (parentId && parentId !== 'root') {
        parentNode = conn.files[parentId] || Object.values(conn.files).find(f => f.nodeId === parentId);
        if (!parentNode) throw new Error(`MEGA Parent Folder not found: ${parentId}`);
    }

    // Check if the folder already exists
    const children = parentNode.children || [];
    const existing = children.find(c => c.directory && c.name.toLowerCase() === folderName.toLowerCase());
    if (existing) {
        return existing.nodeId;
    }

    // Create the new folder
    console.log(`[MEGA] Creating new folder: "${folderName}" inside ${parentId || 'root'}`);
    const createdFolder = await conn.mkdir({ name: folderName, target: parentNode }).complete;
    
    // Refresh connection to ensure files map updates
    await connectToMega(true); 

    return createdFolder.nodeId;
};

const uploadToMega = async (fileBuffer, fileName, fileSize, parentId = 'root') => {
    const conn = await connectToMega();
    
    let parentNode = conn.root;
    if (parentId && parentId !== 'root') {
        parentNode = conn.files[parentId] || Object.values(conn.files).find(f => f.nodeId === parentId);
        if (!parentNode) throw new Error(`MEGA Target Folder not found: ${parentId}`);
    }

    const result = await conn.upload({
        name: fileName,
        size: fileSize,
        target: parentNode
    }, fileBuffer).complete;

    const link = await result.link();

    return {
        name: result.name,
        link: link,
        nodeId: result.nodeId
    };
};

/**
 * Get a streamable file from MEGA by nodeId or public link.
 *
 * Strategy:
 *  1. If fileId looks like a MEGA public link → use File.fromURL() directly
 *  2. Otherwise try storage.files[nodeId] (direct key lookup — most reliable)
 *  3. Fall back to scanning all files for matching nodeId
 *  4. If still not found, force-reload the MEGA session and retry once
 */
const getFileStream = async (fileId) => {
    if (!fileId) throw new Error('No fileId provided');

    // ── Strategy 1: Public link (e.g. https://mega.nz/file/...) ──────────────
    if (fileId.startsWith('http') || fileId.includes('mega.nz')) {
        console.log(`[MEGA] Using public link strategy for: ${fileId}`);
        const file = File.fromURL(fileId);
        await file.loadAttributes();
        return {
            stream: file.download(),
            name: file.name,
            size: file.size
        };
    }

    // ── Strategy 2 & 3: NodeId lookup ──────────────────────────────────────
    const tryByNodeId = async (conn) => {
        // Direct key lookup (fastest)
        if (conn.files[fileId]) {
            return conn.files[fileId];
        }
        // Scan all files for matching nodeId (fallback)
        return Object.values(conn.files).find(f => f.nodeId === fileId) || null;
    };

    let conn = await connectToMega();
    let file = await tryByNodeId(conn);

    // ── Strategy 4: Force reload session and retry ─────────────────────────
    if (!file) {
        console.log(`[MEGA] File not found with cached session, forcing reload... nodeId=${fileId}`);
        conn = await connectToMega(true); // force reconnect
        file = await tryByNodeId(conn);
    }

    if (!file) {
        // Log all available nodeIds for debugging
        const availableIds = Object.keys(conn.files).slice(0, 10);
        console.error(`[MEGA] File NOT found. Searched for: ${fileId}`);
        console.error(`[MEGA] Available file keys (first 10):`, availableIds);
        throw new Error(`File not found on MEGA (nodeId: ${fileId}). The file may have been deleted or the nodeId is outdated.`);
    }

    return {
        stream: file.download(),
        name: file.name,
        size: file.size
    };
};

/**
 * List all files available in the MEGA account (with a fresh session).
 * Returns array of { nodeId, name, size } for diagnostic/mapping purposes.
 */
const listAllFiles = async () => {
    const conn = await connectToMega(true);
    return Object.values(conn.files)
        .filter(f => !f.directory)
        .map(f => ({
            nodeId: f.nodeId,
            name: f.name,
            size: f.size
        }));
};

const deleteFromMega = async (nodeId) => {
    const conn = await connectToMega();
    const file = conn.files[nodeId] || Object.values(conn.files).find(f => f.nodeId === nodeId);

    if (file) {
        await file.delete();
        return true;
    }
    return false;
};

module.exports = {
    connectToMega,
    uploadToMega,
    getFileStream,
    deleteFromMega,
    listAllFiles,
    getOrCreateFolder
};
