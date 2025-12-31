import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    role: { type: String, enum: ["customer", "worker", ""], default: "" },
    isActive: { type: Boolean, default: true },
    otp: { type: String, select: false }, // Don't return OTP in queries by default
    otpExpires: { type: Date },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      houseNo: { type: String, default: "" }, // House/Flat/Street Name
      apartment: { type: String, default: "" }, // Landmark
      directions: { type: String, default: "" },
      label: { type: String, enum: ["Home", "Work", "Other", ""], default: "" },
      contactName: { type: String, default: "" },
      contactPhone: { type: String, default: "" },
    },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
