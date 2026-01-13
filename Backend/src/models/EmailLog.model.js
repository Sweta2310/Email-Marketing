import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
    {
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EmailClient",
            required: true
        },
        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campaign"
        },
        to: {
            type: String,
            required: true,
            trim: true,
        },
        subject: {
            type: String,
            required: true,
        },
        text: {
            type: String,
        },
        html: {
            type: String,
        },
        status: {
            type: String,
            enum: ["pending", "sent", "failed"],
            default: "pending",
        },
        messageId: {
            type: String,
        },
        error: {
            type: String,
        },
    },
    { timestamps: true }
);

export default mongoose.model("EmailLog", emailLogSchema);
