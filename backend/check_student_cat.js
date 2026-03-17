const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://siddhaDB:siddha12@cluster0.iampjkb.mongodb.net/siddha';

async function checkStudent() {
    try {
        await mongoose.connect(MONGODB_URI);
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const navani = await User.findById('69844481b6f777cd3a1c14cc').lean();
        console.log('Navani Category:', navani.category);
        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkStudent();
