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
        location: {
            latitude: { type: Number },
            longitude: { type: Number },
            address: { type: String },
        },
        bookingDate: { type: String },
        bookingTime: { type: String },
        instructions: { type: String },
        paymentMethod: {
            type: { type: String, default: "Card" },
            last4: { type: String },
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
