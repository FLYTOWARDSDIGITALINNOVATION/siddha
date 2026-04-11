const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://siddhaDB:siddha12@cluster0.iampjkb.mongodb.net/siddha';

const AttemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionBank' },
    score: { type: Number, required: true },
}, { timestamps: true });

const Attempt = mongoose.model('Attempt', AttemptSchema);

const UserSchema = new mongoose.Schema({
    fullName: String,
    email: String
});
const User = mongoose.model('User', UserSchema);

async function checkData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const allBanks = await mongoose.model('QuestionBank', new mongoose.Schema({ title: String })).find();
        console.log('All Question Banks:', allBanks.map(b => `${b.title} (${b._id})`));
        
        const banks = await mongoose.model('QuestionBank', new mongoose.Schema({ title: String })).find({ _id: { $in: testIds } });
        console.log('Banks linked to attempts:', banks.map(b => `${b.title} (${b._id})`));

        const testIdCount = await Attempt.countDocuments({ testId: { $exists: true } });
        console.log('Attempts with testId:', testIdCount);
        
        const totalAttempts = await Attempt.countDocuments();
        console.log('Total attempts:', totalAttempts);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
