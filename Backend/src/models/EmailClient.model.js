import mongoose from "mongoose";

const emailClientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    apiKey: { type: String, required: true, unique: true },
    fromDomain: { type: String, required: true },
    dailyLimit: { type: Number, default: 500 },
    dailyLimit: { type: Number, default: 500 },
    isActive: { type: Boolean, default: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: true,
    collection: "emailClients"
  }
);

export default mongoose.model("EmailClient", emailClientSchema);
