const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://siddhaDB:siddha12@cluster0.iampjkb.mongodb.net/siddha';

async function listUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const students = await User.find({ role: 'student' }).limit(5);
        console.log('Students:', students.map(u => ({ id: u._id, email: u.email, fullName: u.fullName })));
        
        const testCount = await mongoose.model('QuestionBank', new mongoose.Schema({}, { strict: false })).countDocuments({ status: 'published' });
        console.log('Total Published Tests:', testCount);

        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listUsers();
