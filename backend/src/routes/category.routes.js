import express from "express";
import { getCategories, createCategory, updateCategory, deleteCategory, addSubCategories } from "../controllers/category.controller.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.put("/:id/subcategories", addSubCategories);
router.delete("/:id", deleteCategory);

export default router;
