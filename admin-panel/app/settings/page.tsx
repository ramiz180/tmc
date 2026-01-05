"use client";

import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        terms_and_conditions: "",
        privacy_policy: "",
        faqs: [{ question: "", answer: "" }],
        contact_info: {
            email: "",
            phone: "",
            whatsapp: ""
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/settings");
            const data = await res.json();
            if (data.success) {
                setSettings(data.settings);
            }
        } catch (err) {
            console.error("Error fetching settings:", err);
            alert("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });
            const data = await res.json();
            if (data.success) {
                alert("Settings updated successfully!");
            }
        } catch (err) {
            console.error("Error saving settings:", err);
            alert("Failed to save settings");
        }
    };

    const addFaq = () => {
        setSettings({
            ...settings,
            faqs: [...settings.faqs, { question: "", answer: "" }]
        });
    };

    const removeFaq = (index: number) => {
        const newFaqs = settings.faqs.filter((_, i) => i !== index);
        setSettings({ ...settings, faqs: newFaqs });
    };

    const updateFaq = (index: number, field: "question" | "answer", value: string) => {
        const newFaqs = [...settings.faqs];
        newFaqs[index][field] = value;
        setSettings({ ...settings, faqs: newFaqs });
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <main className="flex-1 md:ml-64 p-4 sm:p-8 lg:p-12 transition-all duration-300">
                <div className="max-w-4xl mx-auto pt-16 md:pt-0">
                    <header className="mb-10 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">App Settings</h1>
                            <p className="text-gray-500 mt-1 font-medium">Manage app content and legal documents</p>
                        </div>
                        <button
                            onClick={handleSave}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-green-500/20 transition-all active:scale-95 text-sm"
                        >
                            Save Changes
                        </button>
                    </header>

                    <div className="space-y-8">
                        {/* Terms & Conditions */}
                        <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Terms & Conditions</h2>
                            <textarea
                                className="w-full h-48 p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm text-gray-700 leading-relaxed"
                                value={settings.terms_and_conditions}
                                onChange={(e) => setSettings({ ...settings, terms_and_conditions: e.target.value })}
                                placeholder="Enter Terms & Conditions..."
                            />
                        </section>

                        {/* Privacy Policy */}
                        <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Privacy Policy</h2>
                            <textarea
                                className="w-full h-48 p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm text-gray-700 leading-relaxed"
                                value={settings.privacy_policy}
                                onChange={(e) => setSettings({ ...settings, privacy_policy: e.target.value })}
                                placeholder="Enter Privacy Policy..."
                            />
                        </section>

                        {/* FAQs */}
                        <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h2>
                                <button
                                    onClick={addFaq}
                                    className="text-green-500 hover:text-green-600 font-bold text-sm flex items-center gap-1"
                                >
                                    <span>+</span> Add FAQ
                                </button>
                            </div>
                            <div className="space-y-4">
                                {settings.faqs.map((faq, index) => (
                                    <div key={index} className="p-6 bg-gray-50 rounded-2xl relative border border-gray-100 group">
                                        <button
                                            onClick={() => removeFaq(index)}
                                            className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                        <div className="space-y-4">
                                            <input
                                                className="w-full p-3 bg-white rounded-xl border border-gray-200 outline-none text-sm font-bold"
                                                value={faq.question}
                                                onChange={(e) => updateFaq(index, "question", e.target.value)}
                                                placeholder="Question"
                                            />
                                            <textarea
                                                className="w-full p-3 bg-white rounded-xl border border-gray-200 outline-none text-sm text-gray-600"
                                                value={faq.answer}
                                                onChange={(e) => updateFaq(index, "answer", e.target.value)}
                                                placeholder="Answer"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Contact Info */}
                        <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Contact Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Support Email</label>
                                    <input
                                        className="w-full p-4 rounded-2xl border border-gray-200 outline-none text-sm"
                                        value={settings.contact_info.email}
                                        onChange={(e) => setSettings({ ...settings, contact_info: { ...settings.contact_info, email: e.target.value } })}
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Support Phone</label>
                                    <input
                                        className="w-full p-4 rounded-2xl border border-gray-200 outline-none text-sm"
                                        value={settings.contact_info.phone}
                                        onChange={(e) => setSettings({ ...settings, contact_info: { ...settings.contact_info, phone: e.target.value } })}
                                        placeholder="+91..."
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">WhatsApp Number</label>
                                    <input
                                        className="w-full p-4 rounded-2xl border border-gray-200 outline-none text-sm"
                                        value={settings.contact_info.whatsapp}
                                        onChange={(e) => setSettings({ ...settings, contact_info: { ...settings.contact_info, whatsapp: e.target.value } })}
                                        placeholder="+91..."
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
