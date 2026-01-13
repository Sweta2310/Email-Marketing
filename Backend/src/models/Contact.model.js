import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EmailClient",
            required: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        firstName: {
            type: String,
            trim: true,
        },
        lastName: {
            type: String,
            trim: true,
        },
        marketing_consent: {
            type: Boolean,
            default: true,
        },
        consent_timestamp: {
            type: Date,
            default: Date.now,
        },
        consent_source: {
            type: String,
            required: true,
        },
        is_bounced: {
            type: Boolean,
            default: false,
        },
        whatsapp: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

// Ensure unique email per client
contactSchema.index({ client: 1, email: 1 }, { unique: true });
// Index for search
contactSchema.index({ client: 1, firstName: 1, lastName: 1, email: 1 });

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;
