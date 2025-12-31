import User from "../models/User.js";

// Generate a random 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: "Phone number is required" });

    // In a real app, you would send this via SMS (Twilio, SNS, etc.)
    // For now, we log it to syntax for dev purposes
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log(`[DEV] OTP for ${phone}: ${otp}`);

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, otp, otpExpires });
    } else {
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    }

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

export const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;
  console.log(`[DEV] Verifying OTP for ${phone}. Received: ${otp}`);

  try {
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: "Phone and OTP are required" });
    }

    const user = await User.findOne({ phone }).select("+otp"); // Explicitly select otp
    if (!user) {
      console.log(`[DEV] User not found for ${phone}`);
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    console.log(`[DEV] Stored OTP: ${user.otp}, Expires: ${user.otpExpires}`);

    if (user.otp !== otp || user.otpExpires < new Date()) {
      console.log(`[DEV] OTP mismatch or expired. Stored: ${user.otp}, Received: ${otp}`);
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Return user info (excluding sensitive fields)
    const userResponse = user.toObject();
    delete userResponse.otp;
    delete userResponse.otpExpires;

    res.json({ success: true, user: userResponse });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

export const updateName = async (req, res) => {
  try {
    const { userId, name } = req.body;
    const user = await User.findByIdAndUpdate(userId, { name }, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const setLocation = async (req, res) => {
  const { userId, latitude, longitude, houseNo, apartment, directions, label, contactName, contactPhone } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.location = {
      latitude,
      longitude,
      houseNo: houseNo || "",
      apartment: apartment || "",
      directions: directions || "",
      label: label || "",
      contactName: contactName || "",
      contactPhone: contactPhone || "",
    };
    await user.save();

    res.json({ success: true, message: "Location updated" });
  } catch (err) {
    console.error("Set location error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
