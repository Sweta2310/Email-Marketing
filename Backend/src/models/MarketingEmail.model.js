// import mongoose from "mongoose";

// const marketingEmailSchema = new mongoose.Schema(
//     {
//         user: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//         },
//         email: {
//             type: String,
//             required: true,
//             lowercase: true,
//             trim: true,
//         },
//         marketing_consent: {
//             type: Boolean,
//             default: true,
//         },
//         consent_timestamp: {
//             type: Date,
//             default: Date.now,
//         },
//         consent_source: {
//             type: String,
//             required: true,
//         },
//         is_bounced: {
//             type: Boolean,
//             default: false,
//         },
//     },
//     { timestamps: true }
// );

// // Ensure unique email globally for marketing (one record per email)
// marketingEmailSchema.index({ email: 1 }, { unique: true });
// // Index for campaign targeting and user lookup
// marketingEmailSchema.index({ user: 1, email: 1 });
// // Index for strict campaign targeting (consent + bounce status)
// marketingEmailSchema.index({ marketing_consent: 1, is_bounced: 1, email: 1 });

// export default mongoose.model("MarketingEmail", marketingEmailSchema);
