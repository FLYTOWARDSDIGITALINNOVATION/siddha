const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://localhost:27017/siddha';

async function listCollections() {
    try {
        await mongoose.connect(MONGODB_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`Collection: ${col.name}, Count: ${count}`);
        }

        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listCollections();
