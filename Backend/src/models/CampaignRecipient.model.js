import mongoose from "mongoose";

const campaignRecipientSchema = new mongoose.Schema(
    {
        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campaign",
            required: true,
            unique: true, // One recipient selection per campaign
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EmailClient",
            required: true,
        },
        type: {
            type: String,
            enum: ["list", "segment", "individual", "all"],
            required: true,
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "onModel",
        },
        onModel: {
            type: String,
            enum: ["List", "Segment"],
        },
        contacts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Contact",
            },
        ],
    },
    { timestamps: true }
);

// Indexes
campaignRecipientSchema.index({ campaign: 1 });
campaignRecipientSchema.index({ client: 1 });

const CampaignRecipient = mongoose.model("CampaignRecipient", campaignRecipientSchema);
export default CampaignRecipient;
