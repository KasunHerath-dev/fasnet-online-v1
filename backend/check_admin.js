import 'dotenv/config';
import mongoose from 'mongoose';

async function checkAdmin() {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    const mainDb = mongoose.connection.useDb('test');
    const user = await mainDb.db.collection('users').findOne({ username: 'admin' });
    
    if (user) {
      console.log('ADMIN FOUND:', {
        username: user.username,
        roles: user.roles,
        hasHash: !!user.passwordHash,
        isActive: user.isActive,
        isLocked: user.isAccountLocked
      });
    } else {
      console.log('ADMIN NOT FOUND in test database.');
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('SEARCH ERROR:', err.message);
  }
}

checkAdmin();
