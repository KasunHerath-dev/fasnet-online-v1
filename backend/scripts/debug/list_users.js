const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

const listUsers = async () => {
    try {
        const uri = 'mongodb+srv://kasunherath1969_db_user:DcuiVSDfe7PhCmQ8@cluster0.woltudw.mongodb.net/fas_db?appName=Cluster0';
        await mongoose.connect(uri);
        const users = await User.find({});
        console.log(`Found ${users.length} users.`);
        console.log(JSON.stringify(users, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

listUsers();
