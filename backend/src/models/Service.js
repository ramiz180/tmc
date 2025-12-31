import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        category: { type: String, required: true },
        subCategories: { type: [String], default: [] },
        price: { type: Number, required: true },
        description: { type: String, default: "" },
        workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        workerName: { type: String, required: true },
        location: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
            address: { type: String, default: "" },
        },
        images: [{ type: String }],
        videos: [{ type: String }],
    },
    { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
