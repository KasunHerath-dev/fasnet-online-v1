const mongoose = require('mongoose');
const uri = 'mongodb+srv://kasunherath1969_db_user:VDhWILW42trkaanY@cluster0.hekpp2l.mongodb.net/test?appName=Cluster0';

async function fix() {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const result = await db.collection('systemsettings').updateOne(
        { key: 'SCRAPER_CONFIG' },
        { $set: { 'value.autoPublish': true } }
    );
    console.log('Updated:', result.modifiedCount);
    process.exit(0);
}

fix().catch(err => {
    console.error(err);
    process.exit(1);
});
