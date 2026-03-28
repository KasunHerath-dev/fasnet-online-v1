require('dotenv').config();
const { uploadToDrive, deleteFromDrive, getFileStream } = require('../src/services/googleDriveService');

async function test() {
    try {
        console.log("Testing Google Drive Integration...");
        
        // 1. Upload
        const demoBuffer = Buffer.from("Hello World from Google Drive Integration Test!");
        console.log("Attempting upload...");
        const res = await uploadToDrive(demoBuffer, "test_file.txt", "text/plain");
        console.log("Upload Success! Response:", res);

        // 2. Fetch Metadata/Stream
        console.log("Fetching file stream...");
        const fileStreamData = await getFileStream(res.nodeId);
        console.log("Stream fetched efficiently! File size:", fileStreamData.size);

        // 3. Delete
        console.log("Cleaning up file...");
        const delRes = await deleteFromDrive(res.nodeId);
        console.log("Delete Success:", delRes);
        
        console.log("\n✅ All Google Drive Operations Working Successfully!");
    } catch(err) {
        console.error("\n❌ Test Failed:");
        console.error(err);
    }
}
test();
