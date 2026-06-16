"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Trash2, Edit2, GripVertical, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const initialData = [
    { id: 1, particulars: "Communication Skills", category: "Soft Skills", maxScore: 10, weightage: 20, order: 1 },
    { id: 2, particulars: "Technical Knowledge", category: "Technical Skills", maxScore: 20, weightage: 30, order: 2 },
];

type Item = { id: number; particulars: string; category: string; maxScore: number; weightage: number; order: number };

export default function Master2Page() {
    const [items, setItems] = useState<Item[]>(() =>
        [...initialData].sort((a, b) => a.order - b.order)
    );
    const router = useRouter();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({ particulars: "", category: "", maxScore: "", weightage: "", order: "" });
    const [errors, setErrors] = useState<{ particulars?: string; category?: string; maxScore?: string; weightage?: string }>({});
    const dragItem = useRef<number | null>(null);
    const dragOver = useRef<number | null>(null)

    const openDrawer = () => {
        setEditingId(null);
        setForm({ particulars: "", category: "", maxScore: "", weightage: "", order: String(items.length + 1) });
        setErrors({});
        setDrawerOpen(true);
    };

    const openEdit = (item: Item) => {
        setEditingId(item.id);
        setForm({ particulars: item.particulars, category: item.category, maxScore: String(item.maxScore), weightage: String(item.weightage), order: String(item.order) });
        setErrors({});
        setDrawerOpen(true);
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        setEditingId(null);
        setForm({ particulars: "", category: "", maxScore: "", weightage: "", order: "" });
        setErrors({});
    };

    const handleSave = () => {
        const e: { particulars?: string; category?: string; maxScore?: string; weightage?: string } = {};
        if (!form.particulars.trim()) e.particulars = "Required";
        if (!form.category.trim()) e.category = "Required";
        if (!form.maxScore || isNaN(Number(form.maxScore))) e.maxScore = "Required";
        if (!form.weightage || isNaN(Number(form.weightage))) e.weightage = "Required";
        if (Object.keys(e).length) { setErrors(e); return; }
        if (editingId !== null) {
            setItems((prev) => prev.map((i) => i.id === editingId ? { ...i, particulars: form.particulars.trim(), category: form.category.trim(), maxScore: Number(form.maxScore), weightage: Number(form.weightage) } : i));
        } else {
            setItems((prev) => [...prev, { id: Date.now(), particulars: form.particulars.trim(), category: form.category.trim(), maxScore: Number(form.maxScore), weightage: Number(form.weightage), order: prev.length + 1 }]);
        }
        closeDrawer();
    };

    const handleDragEnd = () => {
        if (dragItem.current === null || dragOver.current === null || dragItem.current === dragOver.current) return;
        const updated = [...items];
        const [moved] = updated.splice(dragItem.current, 1);
        updated.splice(dragOver.current, 0, moved);
        setItems(updated.map((it, i) => ({ ...it, order: i + 1 })));
        dragItem.current = null;
        dragOver.current = null;
    };

    const totalWeightage = items.reduce((sum, i) => sum + i.weightage, 0);
    const totalMaxScore = items.reduce((sum, i) => sum + i.maxScore, 0);

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-white font-sans text-xs">
            <div className="bg-emerald-700 text-white px-6 py-4 shadow-md shrink-0 flex items-center gap-3">
                <button onClick={() => router.back()} className="p-1.5 rounded-full bg-white/20 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                    <h1 className="text-sm font-semibold">Master 2</h1>
                    <p className="text-[11px] opacity-80 mt-0.5">Manage master 2 data</p>
                </div>
            </div>

            <div className="flex-1 overflow-auto px-6 pt-5">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[13px] font-semibold text-slate-700">
                        {items.length} record{items.length !== 1 ? "s" : ""}
                    </p>
                    <button onClick={openDrawer} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-semibold text-white transition-colors text-[13px]">
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-3 py-3 w-8"></th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-10">#</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Particulars</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Max Score</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {items.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-14 text-sm text-slate-300 italic">No records. Click Add to create one.</td></tr>
                            ) : (
                                items.map((item, idx) => (
                                    <tr
                                        key={item.id}
                                        draggable
                                        onDragStart={() => { dragItem.current = idx; }}
                                        onDragEnter={() => { dragOver.current = idx; }}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) => e.preventDefault()}
                                        className="hover:bg-slate-50/50 transition-colors cursor-default"
                                    >
                                        <td className="px-3 py-3.5 text-slate-300 hover:text-slate-500 cursor-grab">
                                            <GripVertical className="w-3.5 h-3.5" />
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-slate-400">{idx + 1}</td>
                                        <td className="px-4 py-3.5 text-sm font-medium text-slate-800">{item.particulars}</td>
                                        <td className="px-4 py-3.5 text-sm text-slate-600">{item.category}</td>
                                        <td className="px-4 py-3.5 text-sm text-slate-600 text-right">{item.maxScore}</td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => setItems((p) => p.filter((i) => i.id !== item.id).map((it, i) => ({ ...it, order: i + 1 })))} className="p-1.5 rounded-lg text-red-400 bg-red-50 hover:bg-red-100 transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {items.length > 0 && (
                            <tfoot className="bg-gray-50 border-t border-gray-200">
                                <tr>
                                    <td colSpan={4} className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Weightage</td>
                                    <td className="px-4 py-3 text-sm font-bold text-emerald-700 text-right">{totalMaxScore}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {drawerOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDrawer} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm cursor-pointer" />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }} className="fixed right-0 top-0 bottom-0 z-50 max-w-md w-full bg-white flex flex-col shadow-2xl">
                            <div className="bg-emerald-500 px-5 py-4 flex items-center justify-between shrink-0">
                                <h3 className="font-semibold text-[15px] text-white tracking-tight">{editingId !== null ? "Edit Master 2" : "Add Master 2"}</h3>
                                <button onClick={closeDrawer} className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
                                <div className="bg-white rounded-xl shadow-sm px-4 pt-4 pb-4 space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Particulars <span className="text-red-500">*</span></label>
                                        <input type="text" autoFocus value={form.particulars} onChange={(e) => { setForm((f) => ({ ...f, particulars: e.target.value })); setErrors((er) => ({ ...er, particulars: "" })); }} placeholder="Enter particulars" className={`w-full bg-gray-100 text-slate-800 placeholder-slate-400 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${errors.particulars ? "ring-2 ring-red-400" : ""}`} />
                                        {errors.particulars && <p className="text-xs text-red-500">{errors.particulars}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Category <span className="text-red-500">*</span></label>
                                        <input type="text" value={form.category} onChange={(e) => { setForm((f) => ({ ...f, category: e.target.value })); setErrors((er) => ({ ...er, category: "" })); }} placeholder="Enter category" className={`w-full bg-gray-100 text-slate-800 placeholder-slate-400 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${errors.category ? "ring-2 ring-red-400" : ""}`} />
                                        {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Max Score <span className="text-red-500">*</span></label>
                                        <input type="number" min="0" value={form.maxScore} onChange={(e) => { setForm((f) => ({ ...f, maxScore: e.target.value })); setErrors((er) => ({ ...er, maxScore: "" })); }} placeholder="e.g. 10" className={`w-full bg-gray-100 text-slate-800 placeholder-slate-400 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${errors.maxScore ? "ring-2 ring-red-400" : ""}`} />
                                        {errors.maxScore && <p className="text-xs text-red-500">{errors.maxScore}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Weightage (%) <span className="text-red-500">*</span></label>
                                        <input type="number" min="0" value={form.weightage} onChange={(e) => { setForm((f) => ({ ...f, weightage: e.target.value })); setErrors((er) => ({ ...er, weightage: "" })); }} placeholder="e.g. 20" className={`w-full bg-gray-100 text-slate-800 placeholder-slate-400 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${errors.weightage ? "ring-2 ring-red-400" : ""}`} />
                                        {errors.weightage && <p className="text-xs text-red-500">{errors.weightage}</p>}
                                    </div>
                                    <button onClick={handleSave} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors text-sm">Save</button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
