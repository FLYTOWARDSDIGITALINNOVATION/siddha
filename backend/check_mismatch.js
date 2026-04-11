const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://siddhaDB:siddha12@cluster0.iampjkb.mongodb.net/siddha';

const AttemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionBank' },
    score: Number,
}, { timestamps: true });

const Attempt = mongoose.model('Attempt', AttemptSchema);

const UserSchema = new mongoose.Schema({
    fullName: String,
    email: String
});
const User = mongoose.model('User', UserSchema);

async function check() {
    await mongoose.connect(MONGODB_URI);
    const id = "69d91b000c6e56d606ba32fa";
    let query = { $or: [{ testId: id }] };
    try {
        query.$or.push({ testId: new mongoose.Types.ObjectId(id) });
    } catch (e) {}

    const attempts = await Attempt.find(query).populate('userId', 'fullName email mobile');
    console.log(JSON.stringify(attempts, null, 2));

    const attemptCounts = await Attempt.aggregate([
        { $group: { _id: "$testId", count: { $sum: 1 } } }
    ]);
    console.log('Aggregated counts:', attemptCounts);

    process.exit(0);
}
check();
