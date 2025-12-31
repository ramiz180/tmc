import express from "express";
import { createBooking, getBookingsForUser, updateBookingStatus, sendMessage } from "../controllers/booking.controller.js";

const router = express.Router();

router.post("/", createBooking);
router.get("/user/:userId/:role", getBookingsForUser);
router.patch("/status/:bookingId", updateBookingStatus);
router.post("/message/:bookingId", sendMessage);

export default router;
