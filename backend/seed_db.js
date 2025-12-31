import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const count = await User.countDocuments();
        if (count > 0) {
            console.log("Database already has users, skipping seed.");
            process.exit(0);
        }

        const testUser = await User.create({
            phone: "+911234567890",
            name: "Test User",
            role: "worker",
            location: {
                latitude: 28.6139,
                longitude: 77.2090,
            }
        });

        console.log("Seed successful:", testUser);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
