import Category from "../models/Category.js";

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ name: 1 });
        res.json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Create a new category
export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "Category name is required" });

        const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
        if (existing) return res.status(400).json({ success: false, message: "Category already exists" });

        const category = await Category.create({ name });
        res.status(201).json({ success: true, category });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update a category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) return res.status(400).json({ success: false, message: "Category name is required" });

        const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
        if (existing && existing._id.toString() !== id) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        const category = await Category.findByIdAndUpdate(id, { name }, { new: true });
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });

        res.json({ success: true, category, message: "Category updated successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete a category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByIdAndDelete(id);

        if (!category) return res.status(404).json({ success: false, message: "Category not found" });

        res.json({ success: true, message: "Category deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Add/Update sub-categories for a category
export const addSubCategories = async (req, res) => {
    try {
        const { id } = req.params;
        const { subCategories } = req.body;

        if (!Array.isArray(subCategories)) {
            return res.status(400).json({ success: false, message: "Sub-categories must be an array" });
        }

        // Filter out empty strings and trim whitespace
        const cleanedSubCategories = subCategories
            .map(sub => sub.trim())
            .filter(sub => sub.length > 0);

        const category = await Category.findByIdAndUpdate(
            id,
            { subCategories: cleanedSubCategories },
            { new: true }
        );

        if (!category) return res.status(404).json({ success: false, message: "Category not found" });

        res.json({ success: true, category, message: "Sub-categories updated successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
