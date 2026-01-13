import mongoose from "mongoose";
import "dotenv/config";

const userSchema = new mongoose.Schema({ email: String });
const User = mongoose.models.User || mongoose.model("User", userSchema);

async function findUser() {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        const user = await User.findOne();
        if (user) {
            console.log('USER_EMAIL:', user.email);
        } else {
            console.log('NO_USER_FOUND');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.connection.close();
    }
}

findUser();
