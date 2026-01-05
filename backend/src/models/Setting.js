import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
    {
        terms_and_conditions: { type: String, default: "" },
        privacy_policy: { type: String, default: "" },
        faqs: [
            {
                question: { type: String, required: true },
                answer: { type: String, required: true },
            },
        ],
        contact_info: {
            email: { type: String, default: "" },
            phone: { type: String, default: "" },
            whatsapp: { type: String, default: "" },
        },
    },
    { timestamps: true }
);

export default mongoose.model("Setting", settingSchema);
