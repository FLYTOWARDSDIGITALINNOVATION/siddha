const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017';

async function listDatabases() {
    try {
        await mongoose.connect(MONGO_URI + '/test');
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log('Databases:', dbs.databases.map(db => db.name));
        
        for (const dbInfo of dbs.databases) {
            const dbName = dbInfo.name;
            const db = mongoose.connection.useDb(dbName);
            const collections = await db.listCollections().toArray();
            console.log(`Database: ${dbName}, Collections: ${collections.map(c => c.name)}`);
        }

        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listDatabases();
