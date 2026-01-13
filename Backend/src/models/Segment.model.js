import mongoose from "mongoose";

const segmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmailClient",
        required: true
    },
    type: {
        type: String,
        enum: ['standard', 'abtest', 'static', 'contact'],
        default: 'standard'
    },
    leadsMatch: {
        type: String,
        enum: ['Any', 'All', 'None'],
        default: 'Any'
    },
    abTestConfig: {
        leads: { type: String }, // 'All', 'Tags', 'Segments'
        slices: { type: Number }
    },
    conditions: [{
        type: {
            type: String,
            required: true
        },
        action: String,
        operator: String,
        value: mongoose.Schema.Types.Mixed,
        fieldName: String
    }],
    leadCount: {
        type: Number,
        default: 0
    },
    subscriberCount: {
        type: Number,
        default: 0
    },
    criteria: {
        type: Object,
        default: {}
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

const Segment = mongoose.model("Segment", segmentSchema);
export default Segment;
