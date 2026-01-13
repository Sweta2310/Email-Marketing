import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        default: ""
    },
    text: {
        type: String,
        default: ""
    },
    html: {
        type: String,
        default: ""
    },
    design: {
        type: Object, // Stores the JSON design schema
        default: {}
    },
    category: {
        type: String,
        enum: ["saved", "basic", "ready", "ready-to-use"],
        default: "saved"
    },
    blocks: {
        type: Array, // Kept for backward compatibility or simple blocks
        default: []
    },
    thumbnail: {
        type: String,
        default: ""
    },
    isSystem: {
        type: Boolean,
        default: false
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmailClient",
        required: function () { return !this.isSystem; }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Template = mongoose.model("Template", templateSchema);
export default Template;
