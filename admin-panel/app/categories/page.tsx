"use client";

import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
import { Plus, Trash2, Tag, Loader2, X, Edit2, AlertTriangle } from "lucide-react";

export default function Categories() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);

    // Form/Action state
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [categoryName, setCategoryName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [subCategoryInputs, setSubCategoryInputs] = useState<string[]>([""]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = () => {
        setLoading(true);
        fetch("http://localhost:5000/api/categories")
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    setCategories(data.categories);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching categories:", err);
                setLoading(false);
            });
    };

    const openAddModal = () => {
        setCategoryName("");
        setIsAddModalOpen(true);
    };

    const openEditModal = (cat: any) => {
        setSelectedCategory(cat);
        setCategoryName(cat.name);
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (cat: any) => {
        setSelectedCategory(cat);
        setIsDeleteModalOpen(true);
    };

    const handleAddCategory = async () => {
        if (!categoryName.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch("http://localhost:5000/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: categoryName }),
            });
            const data = await res.json();
            if (data.success) {
                setIsAddModalOpen(false);
                fetchCategories();
            } else {
                alert(data.message || "Failed to create category");
            }
        } catch (err) {
            console.error("Error adding category:", err);
            alert("Failed to add category");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateCategory = async () => {
        if (!categoryName.trim() || !selectedCategory) return;

        setSubmitting(true);
        try {
            const res = await fetch(`http://localhost:5000/api/categories/${selectedCategory._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: categoryName }),
            });
            const data = await res.json();
            if (data.success) {
                setIsEditModalOpen(false);
                fetchCategories();
            } else {
                alert(data.message || "Failed to update category");
            }
        } catch (err) {
            console.error("Error updating category:", err);
            alert("Failed to update category");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCategory = async () => {
        if (!selectedCategory) return;

        setSubmitting(true);
        try {
            const res = await fetch(`http://localhost:5000/api/categories/${selectedCategory._id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                setIsDeleteModalOpen(false);
                fetchCategories();
            } else {
                alert(data.message || "Failed to delete category");
            }
        } catch (err) {
            console.error("Error deleting category:", err);
            alert("Failed to delete category");
        } finally {
            setSubmitting(false);
        }
    };

    const openSubCategoryModal = (cat: any) => {
        setSelectedCategory(cat);
        // Initialize with existing sub-categories or one empty input
        if (cat.subCategories && cat.subCategories.length > 0) {
            setSubCategoryInputs(cat.subCategories);
        } else {
            setSubCategoryInputs([""]);
        }
        setIsSubCategoryModalOpen(true);
    };

    const addSubCategoryInput = () => {
        setSubCategoryInputs([...subCategoryInputs, ""]);
    };

    const removeSubCategoryInput = (index: number) => {
        if (subCategoryInputs.length > 1) {
            setSubCategoryInputs(subCategoryInputs.filter((_, i) => i !== index));
        }
    };

    const updateSubCategoryInput = (index: number, value: string) => {
        const updated = [...subCategoryInputs];
        updated[index] = value;
        setSubCategoryInputs(updated);
    };

    const handleSaveSubCategories = async () => {
        if (!selectedCategory) return;

        // Filter out empty inputs
        const validSubCategories = subCategoryInputs.filter(sub => sub.trim().length > 0);

        setSubmitting(true);
        try {
            const res = await fetch(`http://localhost:5000/api/categories/${selectedCategory._id}/subcategories`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subCategories: validSubCategories }),
            });
            const data = await res.json();
            if (data.success) {
                setIsSubCategoryModalOpen(false);
                fetchCategories();
            } else {
                alert(data.message || "Failed to save sub-categories");
            }
        } catch (err) {
            console.error("Error saving sub-categories:", err);
            alert("Failed to save sub-categories");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <div className="flex-1 md:ml-64 p-4 sm:p-8 lg:p-12 transition-all duration-300">
                <div className="max-w-5xl mx-auto pt-16 md:pt-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Categories</h1>
                            <p className="text-gray-500 mt-1 font-medium">Manage service categories for the platform</p>
                        </div>
                        <button
                            onClick={openAddModal}
                            className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                        >
                            <Plus size={20} />
                            Add Category
                        </button>
                    </div>

                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-16 bg-white rounded-2xl border border-gray-100" />
                            ))}
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="bg-white p-20 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Tag size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">No Categories Found</h3>
                            <p className="text-gray-500">Start by adding a new category above.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {categories.map((cat) => (
                                    <div key={cat._id} className="p-5 hover:bg-gray-50/50 transition-colors group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                                    <Tag size={18} />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-gray-800 text-lg">{cat.name}</span>
                                                    {cat.subCategories && cat.subCategories.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {cat.subCategories.map((sub: string, idx: number) => (
                                                                <span key={idx} className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-semibold">
                                                                    {sub}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openSubCategoryModal(cat)}
                                                    className="px-3 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors font-bold"
                                                    title="Add Sub-Category"
                                                >
                                                    Add Sub-Category
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(cat)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(cat)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Category Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-gray-900">Add Category</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Category Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Plumbing, Cleaning..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all font-medium text-gray-900 placeholder:text-gray-400 bg-gray-50 focus:bg-white"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="flex items-center gap-3 mt-8">
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddCategory}
                                    disabled={submitting || !categoryName.trim()}
                                    className="flex-1 py-3.5 rounded-xl font-bold bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : "Save Category"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Category Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-gray-900">Edit Category</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Category Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Plumbing, Cleaning..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all font-medium text-gray-900 placeholder:text-gray-400 bg-gray-50 focus:bg-white"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="flex items-center gap-3 mt-8">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateCategory}
                                    disabled={submitting || !categoryName.trim()}
                                    className="flex-1 py-3.5 rounded-xl font-bold bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : "Update Category"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Category Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Category?</h3>
                        <p className="text-gray-500 font-medium mb-8">
                            Are you sure you want to delete <span className="text-gray-900 font-bold">"{selectedCategory?.name}"</span>? This action cannot be undone.
                        </p>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteCategory}
                                disabled={submitting}
                                className="flex-1 py-3.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Sub-Category Modal */}
            {isSubCategoryModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">Add Sub-Categories</h3>
                                <p className="text-sm text-gray-500 mt-1">for <span className="font-bold text-gray-700">{selectedCategory?.name}</span></p>
                            </div>
                            <button
                                onClick={addSubCategoryInput}
                                className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors shadow-lg"
                                title="Add Input Field"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
                            {subCategoryInputs.map((value, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder={`Sub-category ${index + 1}`}
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium text-gray-900 placeholder:text-gray-400 bg-gray-50 focus:bg-white"
                                        value={value}
                                        onChange={(e) => updateSubCategoryInput(index, e.target.value)}
                                    />
                                    {subCategoryInputs.length > 1 && (
                                        <button
                                            onClick={() => removeSubCategoryInput(index)}
                                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsSubCategoryModalOpen(false)}
                                className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveSubCategories}
                                disabled={submitting}
                                className="flex-1 py-3.5 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
