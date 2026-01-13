import mongoose from "mongoose";
import "dotenv/config";

async function debugData() {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);

        const Contact = mongoose.models.Contact || mongoose.model("Contact", new mongoose.Schema({ email: String, client: mongoose.Schema.Types.ObjectId }));
        const List = mongoose.models.List || mongoose.model("List", new mongoose.Schema({ name: String, client: mongoose.Schema.Types.ObjectId }));
        // Note the special collection name for EmailClient
        const EmailClient = mongoose.models.EmailClient || mongoose.model("EmailClient", new mongoose.Schema({ name: String, owner: mongoose.Schema.Types.ObjectId }), "emailClients");

        const contactCount = await Contact.countDocuments();
        const listCount = await List.countDocuments();
        const clientCount = await EmailClient.countDocuments();
        const userCount = await mongoose.connection.db.collection("users").countDocuments();

        console.log('STATS:');
        console.log(' - Contacts:', contactCount);
        console.log(' - Lists:', listCount);
        console.log(' - EmailClients:', clientCount);
        console.log(' - Users:', userCount);

        if (clientCount > 0) {
            const client = await EmailClient.findOne();
            console.log('SAMPLE_CLIENT:', { id: client._id, name: client.name, owner: client.owner });
        }

        if (contactCount > 0) {
            const contact = await Contact.findOne();
            console.log('SAMPLE_CONTACT:', { id: contact._id, email: contact.email, client: contact.client });
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.connection.close();
    }
}

debugData();
