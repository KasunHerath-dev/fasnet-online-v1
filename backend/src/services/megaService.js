const { Storage } = require('megajs');

let storage;

const connectToMega = async () => {
    if (storage) return storage;

    try {
        storage = await new Storage({
            email: process.env.MEGA_EMAIL,
            password: process.env.MEGA_PASSWORD
        }).ready;
        console.log('✅ Connected to MEGA!');
        return storage;
    } catch (error) {
        console.error('❌ MEGA Connection Error:', error);
        throw error;
    }
};

const uploadToMega = async (fileBuffer, fileName, fileSize) => {
    const storage = await connectToMega();

    // Upload file
    const result = await storage.upload({
        name: fileName,
        size: fileSize
    }, fileBuffer).complete;

    // Generate public link
    const link = await result.link();

    return {
        name: result.name,
        link: link,
        nodeId: result.nodeId // Important for streaming/deleting
    };
};

const getFileStream = async (nodeId) => {
    const storage = await connectToMega();
    const file = Object.values(storage.files).find(f => f.nodeId === nodeId);

    if (!file) throw new Error('File not found on MEGA');

    return {
        stream: file.download(),
        name: file.name,
        size: file.size
    };
};

const deleteFromMega = async (nodeId) => {
    const storage = await connectToMega();
    const file = Object.values(storage.files).find(f => f.nodeId === nodeId);

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
    deleteFromMega
};
