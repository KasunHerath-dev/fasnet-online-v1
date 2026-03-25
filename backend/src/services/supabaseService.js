const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const bucket = process.env.SUPABASE_BUCKET || 'lms-materials';

if (!supabaseUrl || !supabaseKey) {
    console.warn('[SUPABASE] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload a file (Buffer or Stream) to Supabase Storage.
 * @param {Buffer|ReadableStream} file - File data
 * @param {string} storagePath - Path inside the bucket
 * @param {string} mimeType - MIME type e.g. application/pdf
 * @returns {{ publicUrl: string, storagePath: string }}
 */
const uploadFile = async (file, storagePath, mimeType) => {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
            contentType: mimeType,
            upsert: false,
            duplex: 'half' // Required for Node.js streams
        });

    if (error) throw new Error(`Supabase upload failed: ${error.message}`);

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);

    return {
        storagePath,
        publicUrl: urlData.publicUrl
    };
};

/**
 * Delete a file from Supabase Storage.
 * @param {string} storagePath - Path inside the bucket
 */
const deleteFile = async (storagePath) => {
    if (!storagePath) return;
    const { error } = await supabase.storage.from(bucket).remove([storagePath]);
    if (error) {
        console.warn('[SUPABASE] Delete warning:', error.message);
    }
};

/**
 * Get the public URL for a file.
 * @param {string} storagePath
 * @returns {string}
 */
const getPublicUrl = (storagePath) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    return data.publicUrl;
};

/**
 * List all files and folders in a path.
 * @param {string} prefix - Folder path inside bucket
 * @returns {Array} List of files and folders with metadata
 */
const listFiles = async (prefix = '') => {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
    });

    if (error) throw new Error(`Supabase list failed: ${error.message}`);
    
    return data.map(item => ({
        ...item,
        isFolder: !item.id, // Supabase folders don't have IDs in the list response
        fullPath: prefix ? `${prefix}/${item.name}` : item.name
    }));
};

/**
 * Recursively list all files in the bucket (Careful with large buckets)
 * @returns {Array} All files with their full paths
 */
const listAllFiles = async () => {
    const { data, error } = await supabase.storage.from(bucket).list('', {
        limit: 10000,
        recursive: true
    });
    if (error) throw new Error(`Supabase recursive list failed: ${error.message}`);
    return data;
};

module.exports = { uploadFile, deleteFile, getPublicUrl, listFiles, listAllFiles };
