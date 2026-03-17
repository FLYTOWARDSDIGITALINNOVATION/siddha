const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://siddhaDB:siddha12@cluster0.iampjkb.mongodb.net/siddha';

async function checkDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        const QuestionBank = mongoose.model('QuestionBank', new mongoose.Schema({}, { strict: false }));
        const exams = await QuestionBank.find().lean();
        console.log('--- ALL TESTS ---');
        exams.forEach(ex => {
            console.log(`Title: ${ex.title}, Status: ${ex.status}, Subject: ${ex.subject}, Category: ${ex.category}`);
        });
        
        const publishedCount = await QuestionBank.countDocuments({ status: 'published' });
        console.log('Published Count:', publishedCount);

        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

checkDB();
