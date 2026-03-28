const { google } = require('googleapis');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const getDriveService = () => {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/drive'],
    });
    return google.drive({ version: 'v3', auth });
};

async function listDrives(drive) {
    try {
        const res = await drive.drives.list();
        if (res.data.drives && res.data.drives.length > 0) {
            console.log("\n--- Shared Drives Available ---");
            res.data.drives.forEach(d => console.log(`Name: ${d.name} | ID: ${d.id}`));
            console.log("-------------------------------\n");
        } else {
            console.log("\n❌ No Shared Drives found. You NEED a Shared Drive for this Service Account to upload files without the 'Storage Quota' error.");
        }
    } catch (err) {
        console.error("Error fetching Shared Drives:", err.message);
    }
}

async function listFolders(drive, sharedDriveId = null) {
    console.log("Loading folders...");
    try {
        const params = {
            q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
            fields: 'files(id, name, parents)',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
            pageSize: 50
        };

        if (sharedDriveId) {
            params.corpora = 'drive';
            params.driveId = sharedDriveId;
        }

        const res = await drive.files.list(params);
        const files = res.data.files;
        if (files && files.length) {
            console.log("\n--- Folders Found ---");
            files.forEach(f => console.log(`Folder: ${f.name} | ID: ${f.id} | Parent: ${f.parents ? f.parents[0] : 'root'}`));
            console.log("---------------------\n");
        } else {
            console.log("\nNo folders found in this location.");
        }
    } catch (err) {
        console.error("Error listing files:", err.message);
    }
}

async function uploadFile(drive, parentId) {
    console.log(`\nAttempting to upload a test file to folder: ${parentId || 'root'}`);
    try {
        const res = await drive.files.create({
            requestBody: {
                name: "test_upload_explorer.txt",
                parents: parentId && parentId !== 'root' ? [parentId] : []
            },
            media: {
                mimeType: 'text/plain',
                body: 'Hello from Drive Explorer!'
            },
            supportsAllDrives: true
        });
        console.log("✅ Upload Success! File ID:", res.data.id);
        
        await drive.files.delete({ fileId: res.data.id, supportsAllDrives: true });
        console.log("✅ Test file deleted.");

    } catch (err) {
        console.log("❌ Upload Failed!");
        console.error(err.message);
    }
}

async function start() {
    console.log("===============================");
    console.log("   Google Drive Explorer CLI   ");
    console.log("===============================");
    
    if (!process.env.GOOGLE_CLIENT_EMAIL) {
        console.log("Missing GOOGLE_CLIENT_EMAIL in .env");
        process.exit(1);
    }

    const drive = getDriveService();

    // Show drives first
    await listDrives(drive);

    const menu = async () => {
        console.log("\nOptions:");
        console.log("1. List Folders in My Drive (Service Account's Drive)");
        console.log("2. List Folders in a Shared Drive");
        console.log("3. Test Upload to a Folder");
        console.log("4. Exit");
        rl.question("\nSelect option (1-4): ", async (answer) => {
            if (answer === '1') {
                await listFolders(drive, null);
                menu();
            } else if (answer === '2') {
                rl.question("Enter Shared Drive ID: ", async (driveId) => {
                    await listFolders(drive, driveId);
                    menu();
                });
            } else if (answer === '3') {
                rl.question("Enter Target Folder ID (or 'root'): ", async (folderId) => {
                    await uploadFile(drive, folderId);
                    menu();
                });
            } else {
                console.log("Exiting...");
                process.exit(0);
            }
        });
    };

    menu();
}

start();
