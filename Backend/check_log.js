import mongoose from "mongoose";
import "dotenv/config";

async function checkLog() {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        // Using existing model if possible, or define schema
        const EmailLog = mongoose.models.EmailLog || mongoose.model("EmailLog", new mongoose.Schema({
            status: String,
            error: String,
            to: String,
            createdAt: Date
        }));
        const logs = await EmailLog.find().sort({ createdAt: -1 }).limit(5);
        console.log('LATEST_LOGS:', JSON.stringify(logs, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.connection.close();
    }
}

checkLog();
