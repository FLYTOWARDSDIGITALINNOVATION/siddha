const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://siddhaDB:siddha12@cluster0.iampjkb.mongodb.net/siddha';

async function checkDB() {
    try {
        console.log('Connecting to Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const QuestionBank = mongoose.model('QuestionBank', new mongoose.Schema({}, { strict: false }));
        const allTests = await QuestionBank.find({});
        console.log('Total Tests in DB:', allTests.length);
        
        if (allTests.length > 0) {
            console.log('Stats of first test:', {
                title: allTests[0].title,
                status: allTests[0].status,
                subject: allTests[0].subject,
                category: allTests[0].category
            });
        }

        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

checkDB();
