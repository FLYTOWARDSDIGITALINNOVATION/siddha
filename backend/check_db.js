const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/siddha';

async function checkDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        const QuestionBank = mongoose.model('QuestionBank', new mongoose.Schema({}, { strict: false }));
        const allTests = await QuestionBank.find({});
        console.log('Total Tests in DB:', allTests.length);
        
        const publishedTests = await QuestionBank.find({ status: 'published' });
        console.log('Published Tests:', publishedTests.length);
        
        const statusValues = await QuestionBank.distinct('status');
        console.log('Unique status values:', statusValues);
        
        const categories = await QuestionBank.distinct('category');
        console.log('Unique categories:', categories);

        const subjects = await QuestionBank.distinct('subject');
        console.log('Unique subjects:', subjects);

        // Check if any tests are published or draft
        const draftTests = await QuestionBank.find({ status: 'draft' });
        console.log('Draft Tests:', draftTests.length);

        const nullStatusTests = await QuestionBank.find({ status: { $exists: false } });
        console.log('Tests with no status field:', nullStatusTests.length);

        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

checkDB();
