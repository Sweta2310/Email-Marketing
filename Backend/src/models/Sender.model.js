import mongoose from "mongoose";

const senderSchema = new mongoose.Schema(
    {
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EmailClient",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Ensure unique email per client
senderSchema.index({ client: 1, email: 1 }, { unique: true });

const Sender = mongoose.model("Sender", senderSchema);
export default Sender;
