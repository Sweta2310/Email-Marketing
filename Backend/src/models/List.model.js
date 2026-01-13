import mongoose from "mongoose";

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmailClient",
        required: true
    },
    contacts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contact"
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const List = mongoose.model("List", listSchema);
export default List;
