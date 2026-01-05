import Setting from "../models/Setting.js";

// Get app settings
export const getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            // Create default settings if not exists
            settings = await Setting.create({
                terms_and_conditions: "Terms & Conditions Placeholder",
                privacy_policy: "Privacy Policy Placeholder",
                faqs: [
                    {
                        question: "How do I use this app?",
                        answer: "Download and sign up as a worker or customer.",
                    },
                ],
                contact_info: {
                    email: "support@themakeconnect.com",
                    phone: "+911234567890",
                },
            });
        }
        res.status(200).json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update app settings (Admin only)
export const updateSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = new Setting(req.body);
        } else {
            Object.assign(settings, req.body);
        }
        await settings.save();
        res.status(200).json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
