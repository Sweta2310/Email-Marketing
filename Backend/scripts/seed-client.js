import mongoose from "mongoose";
import "dotenv/config";
import EmailClient from "../src/models/EmailClient.model.js";

async function seedClient() {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        // console.log("Connected to MongoDB for seeding...");

        const existingClient = await EmailClient.findOne({ apiKey: "abc123" });
        if (existingClient) {
            // console.log("Client with API key 'abc123' already exists.");
        } else {
            const newClient = await EmailClient.create({
                name: "Test Client",
                apiKey: "abc123",
                fromDomain: "test.com",
                dailyLimit: 1000,
                isActive: true
            });
            // console.log("Successfully created test client:", newClient);
        }
    } catch (error) {
        console.error("Error seeding client:", error);
    } finally {
        await mongoose.connection.close();
        // console.log("MongoDB connection closed.");
    }
}

seedClient();
