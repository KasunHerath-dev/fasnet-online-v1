const mongoose = require('mongoose');
const uri = 'mongodb+srv://kasunherath1969_db_user:VDhWILW42trkaanY@cluster0.hekpp2l.mongodb.net/test?appName=Cluster0';

async function fix() {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    
    // 1. Force SCRAPER_CONFIG autoPublish to true
    await db.collection('systemsettings').updateOne(
        { key: 'SCRAPER_CONFIG' },
        { $set: { 'value.autoPublish': true } }
    );
    console.log('Force set autoPublish in DB');

    // 2. Publish all existing drafts
    const result = await db.collection('notices').updateMany(
        { status: 'draft' },
        { $set: { status: 'published', isActive: true, publishedAt: new Date() } }
    );
    console.log('Published', result.modifiedCount, 'existing notices');
    
    process.exit(0);
}

fix().catch(err => {
    console.error(err);
    process.exit(1);
});
