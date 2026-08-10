const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
require("dotenv").config();

const MONGO_URL = process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("Connected to MongoDB successfully");
        return initDB();
    })
    .then(() => {
        console.log("Database initialized with sample data");
        process.exit(0);
    })
    .catch((err) => {
        console.log("Error:", err);
        process.exit(1);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});

    // Existing user find karo
    const user = await User.findOne();

    if (!user) {
        throw new Error("No user found. Pehle signup karo.");
    }

    console.log("Owner:", user.username);

    // Har listing ko actual user ka _id do
    const listings = initData.data.map((obj) => ({
        ...obj,
        owner: user._id
    }));

    await Listing.insertMany(listings);
};