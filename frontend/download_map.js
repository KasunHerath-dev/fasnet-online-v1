
const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://essykings.github.io/JavaScript/map.png';
const filePath = path.join(__dirname, 'public/assets/images/glass_map.png');

console.log(`Downloading ${url} to ${filePath}...`);

https.get(url, (res) => {
    if (res.statusCode !== 200) {
        console.error(`Failed to download: Status Code ${res.statusCode}`);
        process.exit(1);
    }

    const fileStream = fs.createWriteStream(filePath);
    res.pipe(fileStream);

    fileStream.on('finish', () => {
        console.log('Download complete.');
        fileStream.close();
    });
}).on('error', (err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
});
