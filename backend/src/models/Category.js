import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        isActive: { type: Boolean, default: true },
        subCategories: { type: [String], default: [] },
    },
    { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
