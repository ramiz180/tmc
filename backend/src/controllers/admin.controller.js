import User from "../models/User.js";
import Booking from "../models/Booking.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-otp -otpExpires");

        // Enrich users with booking counts
        const enrichedUsers = await Promise.all(users.map(async (u) => {
            let count = 0;
            if (u.role === "worker") {
                count = await Booking.countDocuments({ workerId: u._id, status: "completed" });
            } else {
                count = await Booking.countDocuments({ customerId: u._id });
            }
            return { ...u._doc, count };
        }));

        res.json(enrichedUsers);
    } catch (err) {
        console.error("Fetch users error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
};

export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isActive = !user.isActive;
        await user.save();
        res.json({ success: true, isActive: user.isActive });
    } catch (err) {
        res.status(500).json({ message: "Toggle status failed" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "User deleted" });
    } catch (err) {
        res.status(500).json({ message: "Delete user failed" });
    }
};
