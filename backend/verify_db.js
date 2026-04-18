import 'dotenv/config';
import mongoose from 'mongoose';

async function verifyDb() {
  try {
    const uri = process.env.MONGO_URI;
    console.log('Connecting to:', uri.split('@')[1] || uri);
    await mongoose.connect(uri);
    
    console.log('Connected DB:', mongoose.connection.db.databaseName);
    
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    console.log('Available Databases:');
    for (const db of dbs.databases) {
      console.log(`- ${db.name} (${db.sizeOnDisk} bytes)`);
    }
    
    const mainDb = mongoose.connection.useDb('test');
    const collections = await mainDb.db.listCollections().toArray();
    console.log(`Collections in test:`);
    for (const coll of collections) {
      const count = await mainDb.db.collection(coll.name).countDocuments();
      console.log(`- ${coll.name}: ${count} docs`);
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('VERIFY ERROR:', err.message);
  }
}

verifyDb();
