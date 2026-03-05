const fs = require('fs');
const path = require('path');

// Determine upload directory
// In local dev this is backend/uploads
// In Vercel /tmp is the only writable place, but for local persistence we use uploads
const uploadDir = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(__dirname, '../../uploads');

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

exports.getLogo = (req, res) => {
    // We look for 'site-logo.png'
    const logoFilename = 'site-logo.png';
    const logoPath = path.join(uploadDir, logoFilename);

    if (fs.existsSync(logoPath)) {
        // Return URL path. 
        // Note: server.js must map '/uploads' to uploadDir
        const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
        // For local dev, we serve via static middleware
        return res.status(200).json({
            logoUrl: `/uploads/${logoFilename}?v=${new Date().getTime()}`
        });
    }

    // Default fallback if no logo uploaded
    return res.status(200).json({ logoUrl: null });
};
