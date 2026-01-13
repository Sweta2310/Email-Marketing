import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["draft", "sending", "sent", "failed"],
        default: "draft"
    },
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Template"
    },
    content: {
        subject: { type: String },
        text: { type: String },
        html: { type: String }
    },
    blocks: {
        type: Array,
        default: []
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmailClient",
        required: true
    },
    folder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CampaignFolder"
    },
    sender: {
        name: { type: String },
        email: { type: String }
    },
    // Recipients are now managed via CampaignRecipient model
    stats: {
        total: { type: Number, default: 0 },
        sent: { type: Number, default: 0 },
        failed: { type: Number, default: 0 }
    },
    design: {
        type: Object,
        default: {}
    },
    lastSaved: {
        type: Date,
        default: Date.now
    },
    executedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Campaign = mongoose.model("Campaign", campaignSchema);
export default Campaign;
