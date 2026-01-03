import express from "express";
import { getUserById, updateUser, uploadDocument, updateProfileImage } from "../controllers/user.controller.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.post("/:id/document", uploadDocument);
router.patch("/:id/profile-image", upload.single('image'), updateProfileImage);

export default router;
