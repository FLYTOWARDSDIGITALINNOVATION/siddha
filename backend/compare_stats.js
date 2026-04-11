const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://siddhaDB:siddha12@cluster0.iampjkb.mongodb.net/siddha';

const AttemptSchema = new mongoose.Schema({
    testId: mongoose.Schema.Types.ObjectId,
});
const Attempt = mongoose.model('Attempt', AttemptSchema);

const BankSchema = new mongoose.Schema({
    title: String,
    attempts: Number
});
const Bank = mongoose.model('QuestionBank', BankSchema);

async function check() {
    await mongoose.connect(MONGODB_URI);
    const banks = await Bank.find();
    for (const bank of banks) {
        const actualAttempts = await Attempt.countDocuments({ testId: bank._id });
        console.log(`Bank: ${bank.title} (${bank._id})`);
        console.log(`  Count in Bank doc: ${bank.attempts}`);
        console.log(`  Actual Attempt docs: ${actualAttempts}`);
    }
    process.exit(0);
}
check();
