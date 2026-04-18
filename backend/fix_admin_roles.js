const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function fixAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fas_db');
    const admin = await User.findOne({ username: 'admin' });
    if (admin) {
      admin.roles = ['admin', 'superadmin'];
      admin.isActive = true;
      await admin.save();
      console.log('SUCCESS: Admin roles updated to [admin, superadmin]');
    } else {
      console.log('ERROR: Admin user not found');
    }
    process.exit(0);
  } catch (err) {
    console.error('FATAL ERROR:', err.message);
    process.exit(1);
  }
}

fixAdmin();
