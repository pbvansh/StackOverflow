const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const URL = process.env.MONGO_URL;
const client = new MongoClient(URL, { useNewUrlParser: true, useUnifiedTopology: true });

const connectDB = async () => {
    try {
        await client.connect();
        console.log('connected to DB!');
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    connectDB,
    client
}

