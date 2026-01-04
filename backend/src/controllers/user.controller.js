import User from "../models/User.js";

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, user });
    } catch (err) {
        console.error("Get user error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const updateData = { ...req.body };
        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, user });
    } catch (err) {
        console.error("Update user error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const uploadDocument = async (req, res) => {
    try {
        const { name, url } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.documents.push({ name, url, status: "pending" });
        await user.save();

        res.json({ success: true, user });
    } catch (err) {
        console.error("Upload document error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image file uploaded" });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { profileImage: req.file.path },
            { new: true }
        );

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, profileImage: user.profileImage });
    } catch (err) {
        console.error("Update profile image error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
