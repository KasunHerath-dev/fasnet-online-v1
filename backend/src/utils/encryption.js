const crypto = require('crypto');
require('dotenv').config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_must_be_32_bytes_long!!'; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

const encrypt = (text) => {
    if (!text) return text;
    // If it handles non-string data, ensure conversion
    const stringText = String(text);

    // Prevent double encryption if already looks encrypted (simple heuristic: includes :)
    // But be careful, a normal string could have a colon. 
    // Best practice is to rely on Mongoose logic or separate fields. 
    // For now, we assume this function is called on plain text.

    // Ensure key is exactly 32 bytes for AES-256
    // We use SHA-256 to hash the provided key to get exactly 32 bytes
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();

    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(stringText);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (text) => {
    if (!text) return text;

    try {
        let textParts = text.split(':');
        // Basic check if it is encrypted format
        if (textParts.length !== 2) return text;

        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');

        // Ensure key is exactly 32 bytes (must match encryption logic)
        const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();

        let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText);

        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    } catch (error) {
        // If decryption fails, it might be plain text or corrupted
        // In migration scenarios, mixed content exists.
        // Return original text if error occurs (assuming it's plain text)
        return text;
    }
};

module.exports = { encrypt, decrypt };
