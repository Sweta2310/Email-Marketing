import mongoose from "mongoose";
import "dotenv/config";

async function checkLists() {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        const List = mongoose.models.List || mongoose.model("List", new mongoose.Schema({ name: String, client: mongoose.Schema.Types.ObjectId }));
        const EmailClient = mongoose.models.EmailClient || mongoose.model("EmailClient", new mongoose.Schema({ name: String, owner: mongoose.Schema.Types.ObjectId }));

        const allLists = await List.find();
        console.log('ALL_LISTS_COUNT:', allLists.length);
        if (allLists.length > 0) {
            console.log('SAMPLE_LIST:', JSON.stringify(allLists[0], null, 2));
        }

        const allClients = await EmailClient.find();
        console.log('ALL_CLIENTS_COUNT:', allClients.length);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.connection.close();
    }
}

checkLists();
