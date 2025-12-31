import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
            default: "pending",
        },
        chatMessages: [
            {
                senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                text: { type: String },
                createdAt: { type: Date, default: Date.now },
            }
        ],
    },
    { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
