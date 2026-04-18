try {
    console.log('Testing Google Drive Service...');
    const googleDriveService = require('./src/services/googleDriveService');
    console.log('Google Drive Service loaded.');

    console.log('Testing Migration Controller...');
    const migrationController = require('./src/controllers/migrationController');
    console.log('Migration Controller loaded.');

    console.log('Testing Settings Routes...');
    const settingsRoutes = require('./src/routes/settingsRoutes');
    console.log('Settings Routes loaded.');

    console.log('ALL NEW MODULES LOADED SUCCESSFULLY!');
} catch (err) {
    console.error('CRITICAL ERROR DURING MODULE LOAD:');
    console.error(err);
    process.exit(1);
}
