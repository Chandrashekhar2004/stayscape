const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');

const MONGO_URL = "mongodb://localhost:27017/StayScape";

main().then(() => {
    console.log('Connected to MongoDB successfully');
})
    .catch(err => {
        console.log('Error connecting to MongoDB:', err);
    });
async function main() {
    await mongoose.connect(MONGO_URL);
}
const initDB = async () => {
    await Listing.deleteMany({});
    initData.data.map((obj)=>({ ...obj, owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }))
    await Listing.insertMany(intData.data);
    console.log('Database initialized with sample data');
}
initDB();