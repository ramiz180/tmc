import express from "express";
import {
    createBooking,
    getBookingsForUser,
    updateBookingStatus,
    sendMessage,
    getAllBookings,
    getBookingById
} from "../controllers/booking.controller.js";

const router = express.Router();

router.post("/", createBooking);
router.get("/all", getAllBookings);
router.get("/:bookingId", getBookingById);
router.get("/user/:userId/:role", getBookingsForUser);
router.patch("/status/:bookingId", updateBookingStatus);
router.post("/message/:bookingId", sendMessage);

export default router;
