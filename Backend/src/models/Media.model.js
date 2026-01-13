import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, default: 'image' },
    size: { type: Number },
    width: { type: Number },
    height: { type: Number },
    format: { type: String },
}, { timestamps: true });

export default mongoose.model('Media', mediaSchema);
