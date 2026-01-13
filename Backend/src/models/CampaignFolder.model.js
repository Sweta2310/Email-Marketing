import mongoose from "mongoose";

const campaignFolderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmailClient",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const CampaignFolder = mongoose.model("CampaignFolder", campaignFolderSchema);
export default CampaignFolder;
