import Booking from "../models/Booking.js";
import User from "../models/User.js";

export const createBooking = async (req, res) => {
    const {
        serviceId,
        customerId,
        workerId,
        location,
        bookingDate,
        bookingTime,
        instructions,
        paymentMethod
    } = req.body;
    try {
        const newBooking = new Booking({
            serviceId,
            customerId,
            workerId,
            location,
            bookingDate,
            bookingTime,
            instructions,
            paymentMethod,
            status: "pending",
        });

        await newBooking.save();
        res.status(201).json({ success: true, booking: newBooking });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getBookingsForUser = async (req, res) => {
    const { userId, role } = req.params;
    try {
        const query = role === "worker" ? { workerId: userId } : { customerId: userId };
        const bookings = await Booking.find(query)
            .populate("serviceId")
            .populate("customerId", "name phone location")
            .populate("workerId", "name phone location");
        res.json({ success: true, bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateBookingStatus = async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body;
    try {
        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { status },
            { new: true }
        );
        res.json({ success: true, booking });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const sendMessage = async (req, res) => {
    const { bookingId } = req.params;
    const { senderId, text } = req.body;
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        booking.chatMessages.push({ senderId, text });
        await booking.save();
        res.json({ success: true, booking });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getBookingById = async (req, res) => {
    const { bookingId } = req.params;
    try {
        const booking = await Booking.findById(bookingId)
            .populate("serviceId")
            .populate("customerId", "name phone location profileImage")
            .populate("workerId", "name phone location profileImage");

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        res.json({ success: true, booking });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("serviceId")
            .populate("customerId", "name phone location profileImage")
            .populate("workerId", "name phone location profileImage");
        res.json({ success: true, bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
