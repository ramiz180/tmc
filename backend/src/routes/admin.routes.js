import express from "express";
import { getAllUsers, toggleUserStatus, deleteUser } from "../controllers/admin.controller.js";
import { getServices } from "../controllers/service.controller.js";
import { getAllBookings } from "../controllers/booking.controller.js";

const router = express.Router();

router.get("/users", getAllUsers);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.delete("/users/:id", deleteUser);

router.get("/services", getServices);
router.get("/bookings", getAllBookings);

export default router;
