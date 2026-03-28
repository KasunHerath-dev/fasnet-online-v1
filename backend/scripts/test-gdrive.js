require('dotenv').config({ path: __dirname + '/../.env' });
const { uploadToDrive, deleteFromDrive, getFileStream } = require('../src/services/googleDriveService');

async function testDrive() {
    console.log("==========================================");
    console.log("Testing Google Drive Integration...");
    
    // Quick Check for environment variables
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        console.error("❌ FAILED: Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY in .env file.");
        return;
    }
    if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
        console.error("❌ FAILED: Missing GOOGLE_DRIVE_FOLDER_ID in .env file.");
        console.error("Please add the folder ID you wish to upload items to.");
        return;
    }

    try {
        const dummyBuffer = Buffer.from("Hello world! This is a test file to verify Google Drive API connection.");
        
        console.log("\n1. Uploading test file...");
        const result = await uploadToDrive(dummyBuffer, "gdrive_test.txt", "text/plain");
        console.log("✅ Upload Success!");
        console.log(`   File ID: ${result.nodeId}`);
        console.log(`   Link: ${result.link}`);
        
        console.log("\n2. Deleting test file to clean up...");
        await deleteFromDrive(result.nodeId);
        console.log("✅ Delete Success!");
        
        console.log("\n🎉 Drive Integration is perfectly operational.");
    } catch (err) {
        console.error("\n❌ Google Drive Test Failed:");
        console.error(err.message);
        if (err.response && err.response.data) {
            console.error(err.response.data.error);
        }
    }
    console.log("==========================================");
}

testDrive();
