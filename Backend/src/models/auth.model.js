import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: function () {
        return this.provider === 'local';
      },
      minlength: 8,
    },

    provider: {
      type: String,
      enum: ['local', 'google', 'apple'],
      default: 'local',
    },

    providerId: {
      type: String,
    },

    profilePicture: {
      type: String,
    },

    // Profile Information
    firstName: {
      type: String,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    // Company Information
    company: {
      type: String,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    street: {
      type: String,
      trim: true,
    },

    zipCode: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
    },

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);


export default mongoose.model("User", userSchema);
