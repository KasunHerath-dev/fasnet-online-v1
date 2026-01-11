require('dotenv').config({ path: require('path').resolve(__dirname, '../../secure_config/.env') });

console.log('Checking Environment Variables...');
console.log('Current Directory:', __dirname);
console.log('Resolved Path:', require('path').resolve(__dirname, '../../secure_config/.env'));

if (process.env.JWT_SECRET) {
    console.log('✅ JWT_SECRET is set (Length: ' + process.env.JWT_SECRET.length + ')');
} else {
    console.log('❌ JWT_SECRET is MISSING!');
}

if (process.env.MONGO_URI) {
    console.log('✅ MONGO_URI is set');
} else {
    console.log('❌ MONGO_URI is MISSING!');
}
