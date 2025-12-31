import express from "express";
import { sendOtp, verifyOtp, updateName, updateRole, setLocation } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify", verifyOtp);
router.post("/name", updateName);
router.post("/role", updateRole);
router.post("/location", setLocation);

export default router;

