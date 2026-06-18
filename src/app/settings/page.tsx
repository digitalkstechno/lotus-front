"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { X, Plus, Trash2, Edit2, GripVertical, ArrowLeft, ChevronDown, ChevronRight, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchMaster1All, addMaster1, updateMaster1, deleteMaster1 } from "../../redux/slices/master1Slice";
import { fetchMaster2ByMaster1, addMaster2, updateMaster2, deleteMaster2 } from "../../redux/slices/master2Slice";

type Master1Item = { id: string; name: string; weightage: number; order: number };
type Master2Item = { id: string; master1Id: string; master1Name: string; particulars: string; category: string; maxScore: number; order: number };

export default function UnifiedMastersPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    
    const master1State = useSelector((state: RootState) => state.master1);
    const master2State = useSelector((state: RootState) => state.master2);
    
    const [localMaster1, setLocalMaster1] = useState<Master1Item[]>([]);
    const [localMaster2, setLocalMaster2] = useState<Master2Item[]>([]);
    
    // Accordion state mapping master1Id -> boolean
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    useEffect(() => {
        dispatch(fetchMaster1All({ search: "" }));
        // Removed fetchMaster2All; now fetched lazily per row
    }, [dispatch]);

    useEffect(() => {
        if (master1State.items) {
            setLocalMaster1([...master1State.items].sort((a, b) => a.order - b.order));
        }
    }, [master1State.items]);

    useEffect(() => {
        if (master2State.items) {
            setLocalMaster2([...master2State.items].sort((a, b) => a.order - b.order));
        }
    }, [master2State.items]);

    const toggleExpand = (id: string) => {
        const isCurrentlyExpanded = expanded[id];
        if (!isCurrentlyExpanded) {
            dispatch(fetchMaster2ByMaster1(id));
        }
        setExpanded(prev => ({ ...prev, [id]: !isCurrentlyExpanded }));
    };

    // ----- DRAWER STATES -----
    const [drawerType, setDrawerType] = useState<"master1" | "master2" | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    
    // Master 1 Form
    const [m1Form, setM1Form] = useState({ name: "", weightage: "" });
    const [m1Errors, setM1Errors] = useState<{ name?: string; weightage?: string }>({});

    // Master 2 Form
    const [m2Form, setM2Form] = useState({ master1Id: "", particulars: "", category: "", maxScore: "" });
    const [m2Errors, setM2Errors] = useState<{ master1Id?: string; particulars?: string; category?: string; maxScore?: string }>({});

    // ----- DRAWER ACTIONS -----
    const openAddMaster1 = () => {
        setDrawerType("master1");
        setEditingId(null);
        setM1Form({ name: "", weightage: "" });
        setM1Errors({});
    };

    const openEditMaster1 = (item: Master1Item) => {
        setDrawerType("master1");
        setEditingId(item.id);
        setM1Form({ name: item.name, weightage: String(item.weightage) });
        setM1Errors({});
    };

    const openAddMaster2 = (master1Id: string) => {
        setDrawerType("master2");
        setEditingId(null);
        setM2Form({ master1Id, particulars: "", category: "", maxScore: "" });
        setM2Errors({});
        // Auto expand that row if not expanded
        setExpanded(prev => ({ ...prev, [master1Id]: true }));
    };

    const openEditMaster2 = (item: Master2Item) => {
        setDrawerType("master2");
        setEditingId(item.id);
        setM2Form({ master1Id: item.master1Id, particulars: item.particulars, category: item.category, maxScore: String(item.maxScore) });
        setM2Errors({});
    };

    const closeDrawer = () => {
        setDrawerType(null);
        setEditingId(null);
    };

    // ----- SAVE ACTIONS -----
    const saveMaster1 = async () => {
        const e: any = {};
        if (!m1Form.name.trim()) e.name = "Required";
        if (!m1Form.weightage || isNaN(Number(m1Form.weightage))) e.weightage = "Required";
        if (Object.keys(e).length) { setM1Errors(e); return; }
        
        try {
            if (editingId) {
                await dispatch(updateMaster1({ id: editingId, data: { name: m1Form.name.trim(), weightage: Number(m1Form.weightage) } })).unwrap();
            } else {
                await dispatch(addMaster1({ name: m1Form.name.trim(), weightage: Number(m1Form.weightage), order: localMaster1.length + 1 })).unwrap();
            }
            dispatch(fetchMaster1All({ search: "" }));
            closeDrawer();
        } catch (err: any) {
            setM1Errors({ name: err.message || "Operation failed" });
        }
    };

    const saveMaster2 = async () => {
        const e: any = {};
        if (!m2Form.master1Id) e.master1Id = "Required";
        if (!m2Form.particulars.trim()) e.particulars = "Required";
        if (!m2Form.category.trim()) e.category = "Required";
        if (!m2Form.maxScore || isNaN(Number(m2Form.maxScore))) e.maxScore = "Required";
        if (Object.keys(e).length) { setM2Errors(e); return; }
        
        try {
            if (editingId) {
                await dispatch(updateMaster2({ id: editingId, data: { master1Id: m2Form.master1Id, name: m2Form.particulars.trim(), category: m2Form.category.trim(), maxScore: Number(m2Form.maxScore) } })).unwrap();
            } else {
                const childCount = localMaster2.filter(m2 => m2.master1Id === m2Form.master1Id).length;
                await dispatch(addMaster2({ master1Id: m2Form.master1Id, name: m2Form.particulars.trim(), category: m2Form.category.trim(), maxScore: Number(m2Form.maxScore), order: childCount + 1 })).unwrap();
            }
            dispatch(fetchMaster2ByMaster1(m2Form.master1Id));
            dispatch(fetchMaster1All({ search: "" })); // Refetch M1 to update totalWeight
            closeDrawer();
        } catch (err: any) {
            setM2Errors({ particulars: err.message || "Operation failed" });
        }
    };

    // ----- DELETE ACTIONS -----
    const deleteM1 = async (id: string) => {
        if (confirm("Delete this Master 1 and all its dependencies?")) {
            await dispatch(deleteMaster1(id)).unwrap();
            dispatch(fetchMaster1All({ search: "" }));
        }
    };

    const deleteM2 = async (id: string, parentId: string) => {
        if (confirm("Delete this Master 2 record?")) {
            await dispatch(deleteMaster2(id)).unwrap();
            dispatch(fetchMaster2ByMaster1(parentId));
            dispatch(fetchMaster1All({ search: "" }));
        }
    };

    // ----- DRAG AND DROP (Master 1) -----
    const m1DragItem = useRef<number | null>(null);
    const m1DragOver = useRef<number | null>(null);

    const handleM1DragEnd = async () => {
        if (m1DragItem.current === null || m1DragOver.current === null || m1DragItem.current === m1DragOver.current) return;
        const updated = [...localMaster1];
        const [moved] = updated.splice(m1DragItem.current, 1);
        updated.splice(m1DragOver.current, 0, moved);
        
        const reordered = updated.map((it, i) => ({ ...it, order: i + 1 }));
        setLocalMaster1(reordered);
        m1DragItem.current = null;
        m1DragOver.current = null;

        try {
            await Promise.all(reordered.map(item => dispatch(updateMaster1({ id: item.id, data: { order: item.order } })).unwrap()));
        } catch (err) {
            dispatch(fetchMaster1All({ search: "" }));
        }
    };

    // ----- DRAG AND DROP (Master 2) -----
    const m2DragItem = useRef<{ index: number, parentId: string } | null>(null);
    const m2DragOver = useRef<{ index: number, parentId: string } | null>(null);

    const handleM2DragEnd = async (parentId: string) => {
        if (!m2DragItem.current || !m2DragOver.current) return;
        if (m2DragItem.current.parentId !== parentId || m2DragOver.current.parentId !== parentId) return;
        if (m2DragItem.current.index === m2DragOver.current.index) return;

        // Extract just the children for this parent
        const children = localMaster2.filter(m => m.master1Id === parentId);
        const [moved] = children.splice(m2DragItem.current.index, 1);
        children.splice(m2DragOver.current.index, 0, moved);

        const reorderedChildren = children.map((it, i) => ({ ...it, order: i + 1 }));
        
        // Optimistically update global list
        const newLocalM2 = localMaster2.map(m => {
            if (m.master1Id === parentId) {
                return reorderedChildren.find(r => r.id === m.id) || m;
            }
            return m;
        });
        setLocalMaster2(newLocalM2);

        m2DragItem.current = null;
        m2DragOver.current = null;

        try {
            await Promise.all(reorderedChildren.map(item => dispatch(updateMaster2({ id: item.id, data: { order: item.order } })).unwrap()));
        } catch (err) {
            dispatch(fetchMaster2ByMaster1(parentId));
        }
    };

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-50 font-sans text-xs">
            <div className="bg-emerald-700 text-white px-6 py-4 shadow-md shrink-0 flex items-center gap-3">
                <button onClick={() => router.back()} className="p-1.5 rounded-full bg-white/20 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                    <h1 className="text-sm font-semibold">Masters Directory</h1>
                    <p className="text-[11px] opacity-80 mt-0.5">Manage hierarchical Master 1 and Master 2 classifications</p>
                </div>
            </div>

            <div className="flex-1 overflow-auto px-6 pt-5 pb-10">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[13px] font-semibold text-slate-700">
                        {localMaster1.length} Root Categories
                    </p>
                    <button onClick={openAddMaster1} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 shadow-sm font-semibold text-white transition-colors text-[13px]">
                        <Plus className="w-4 h-4" /> Add Master 1
                    </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Master 1 Header */}
                    <div className="grid grid-cols-[3rem_1fr_8rem_12rem] bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        <div className="px-3 py-3 text-center">#</div>
                        <div className="px-4 py-3">Category Name</div>
                        <div className="px-4 py-3 text-right">Base Weightage</div>
                        <div className="px-4 py-3 text-right">Actions</div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {master1State.loading && localMaster1.length === 0 ? (
                            <div className="text-center py-14 text-sm text-slate-300 italic">Loading hierarchy...</div>
                        ) : localMaster1.length === 0 ? (
                            <div className="text-center py-14 text-sm text-slate-300 italic">No master categories. Click Add Master 1.</div>
                        ) : (
                            localMaster1.map((m1, idx) => {
                                const isExpanded = !!expanded[m1.id];
                                const m2Children = localMaster2.filter(m2 => m2.master1Id === m1.id);
                                const totalM2Score = m2Children.reduce((sum, c) => sum + c.maxScore, 0);

                                return (
                                    <div key={m1.id} className="flex flex-col">
                                        {/* Master 1 Row */}
                                        <div 
                                            draggable
                                            onDragStart={() => { m1DragItem.current = idx; }}
                                            onDragEnter={() => { m1DragOver.current = idx; }}
                                            onDragEnd={handleM1DragEnd}
                                            onDragOver={(e) => e.preventDefault()}
                                            className="grid grid-cols-[3rem_1fr_8rem_12rem] hover:bg-emerald-50/30 transition-colors group cursor-default"
                                        >
                                            <div className="px-3 py-3.5 flex items-center justify-center gap-2">
                                                <div className="cursor-grab text-slate-300 hover:text-slate-500 hidden group-hover:block">
                                                    <GripVertical className="w-3.5 h-3.5" />
                                                </div>
                                                <button onClick={() => toggleExpand(m1.id)} className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors">
                                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <div className="px-4 py-3.5 flex items-center font-bold text-sm text-slate-800">
                                                <Layers className="w-4 h-4 mr-2 text-emerald-600 opacity-70" />
                                                {m1.name}
                                                <span className="ml-3 text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{m2Children.length} items</span>
                                            </div>
                                            <div className="px-4 py-3.5 flex items-center justify-end text-sm text-slate-600 font-medium">{m1.weightage}%</div>
                                            <div className="px-4 py-3.5 flex items-center justify-end gap-1 transition-opacity">
                                                <button onClick={() => openAddMaster2(m1.id)} title="Add Master 2" className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors">
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => openEditMaster1(m1)} className="p-1.5 rounded-lg text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => deleteM1(m1.id)} className="p-1.5 rounded-lg text-red-400 bg-red-50 hover:bg-red-100 transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Master 2 Sub-table (Accordion) */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }} 
                                                    animate={{ height: "auto", opacity: 1 }} 
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-slate-50/50 border-t border-gray-100"
                                                >
                                                    <div className="pl-14 pr-6 py-4">
                                                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                                            {m2Children.length === 0 ? (
                                                                <div className="text-center py-6 text-[11px] text-slate-400 italic">No sub-items. Click (+) to add Master 2 records.</div>
                                                            ) : (
                                                                <table className="w-full text-left text-[11px]">
                                                                    <thead className="bg-slate-50 border-b border-gray-100 text-slate-500">
                                                                        <tr>
                                                                            <th className="px-3 py-2 w-8"></th>
                                                                            <th className="px-4 py-2 font-semibold">Particulars</th>
                                                                            <th className="px-4 py-2 font-semibold">Category</th>
                                                                            <th className="px-4 py-2 font-semibold text-right">Max Score</th>
                                                                            <th className="px-4 py-2 font-semibold text-right">Action</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-gray-50">
                                                                        {m2Children.map((m2, m2Idx) => (
                                                                            <tr 
                                                                                key={m2.id}
                                                                                draggable
                                                                                onDragStart={() => { m2DragItem.current = { index: m2Idx, parentId: m1.id }; }}
                                                                                onDragEnter={() => { m2DragOver.current = { index: m2Idx, parentId: m1.id }; }}
                                                                                onDragEnd={() => handleM2DragEnd(m1.id)}
                                                                                onDragOver={(e) => e.preventDefault()}
                                                                                className="hover:bg-slate-50 transition-colors group"
                                                                            >
                                                                                <td className="px-3 py-2 text-slate-300 hover:text-slate-500 cursor-grab">
                                                                                    <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                                                                </td>
                                                                                <td className="px-4 py-2 font-medium text-slate-700">{m2.particulars}</td>
                                                                                <td className="px-4 py-2 text-slate-500">{m2.category}</td>
                                                                                <td className="px-4 py-2 text-emerald-600 font-semibold text-right">{m2.maxScore}</td>
                                                                                <td className="px-4 py-2 text-right">
                                                                                    <div className="flex items-center justify-end gap-1 transition-opacity">
                                                                                        <button onClick={() => openEditMaster2(m2)} className="p-1 rounded text-slate-500 hover:bg-slate-200 transition-colors">
                                                                                            <Edit2 className="w-3 h-3" />
                                                                                        </button>
                                                                                        <button onClick={() => deleteM2(m2.id, m1.id)} className="p-1 rounded text-red-400 hover:bg-red-100 transition-colors">
                                                                                            <Trash2 className="w-3 h-3" />
                                                                                        </button>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                    <tfoot className="bg-slate-50 border-t border-gray-100">
                                                                        <tr>
                                                                            <td colSpan={3} className="px-4 py-2 font-semibold text-slate-500 text-right">Total Sub-Score</td>
                                                                            <td className="px-4 py-2 font-bold text-emerald-700 text-right">{totalM2Score}</td>
                                                                            <td></td>
                                                                        </tr>
                                                                    </tfoot>
                                                                </table>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* DRAWERS */}
            <AnimatePresence>
                {drawerType && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDrawer} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm cursor-pointer" />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }} className="fixed right-0 top-0 bottom-0 z-50 max-w-md w-full bg-white flex flex-col shadow-2xl">
                            
                            <div className="bg-emerald-500 px-5 py-4 flex items-center justify-between shrink-0">
                                <h3 className="font-semibold text-[15px] text-white tracking-tight">
                                    {drawerType === "master1" ? (editingId ? "Edit Master 1" : "Add Master 1") : (editingId ? "Edit Master 2" : "Add Master 2")}
                                </h3>
                                <button onClick={closeDrawer} className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
                                <div className="bg-white rounded-xl shadow-sm px-4 pt-4 pb-4 space-y-4">
                                    
                                    {drawerType === "master1" && (
                                        <>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Category Name <span className="text-red-500">*</span></label>
                                                <input type="text" autoFocus value={m1Form.name} onChange={(e) => { setM1Form((f) => ({ ...f, name: e.target.value })); setM1Errors((er) => ({ ...er, name: "" })); }} onKeyDown={(e) => e.key === "Enter" && saveMaster1()} placeholder="e.g. Technical Skills" className={`w-full bg-gray-100 text-slate-800 placeholder-slate-400 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${m1Errors.name ? "ring-2 ring-red-400" : ""}`} />
                                                {m1Errors.name && <p className="text-xs text-red-500">{m1Errors.name}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Base Weightage (%) <span className="text-red-500">*</span></label>
                                                <input type="number" min="0" value={m1Form.weightage} onChange={(e) => { setM1Form((f) => ({ ...f, weightage: e.target.value })); setM1Errors((er) => ({ ...er, weightage: "" })); }} placeholder="e.g. 20" className={`w-full bg-gray-100 text-slate-800 placeholder-slate-400 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${m1Errors.weightage ? "ring-2 ring-red-400" : ""}`} />
                                                {m1Errors.weightage && <p className="text-xs text-red-500">{m1Errors.weightage}</p>}
                                            </div>
                                            <button onClick={saveMaster1} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors text-sm mt-2">Save Master 1</button>
                                        </>
                                    )}

                                    {drawerType === "master2" && (
                                        <>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Parent Master 1 <span className="text-red-500">*</span></label>
                                                <select value={m2Form.master1Id} onChange={(e) => { setM2Form((f) => ({ ...f, master1Id: e.target.value })); setM2Errors((er) => ({ ...er, master1Id: "" })); }} className={`w-full bg-gray-100 text-slate-800 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${m2Errors.master1Id ? "ring-2 ring-red-400" : ""}`}>
                                                    <option value="">Select Parent</option>
                                                    {localMaster1.map(opt => (
                                                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                                                    ))}
                                                </select>
                                                {m2Errors.master1Id && <p className="text-xs text-red-500">{m2Errors.master1Id}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Particulars <span className="text-red-500">*</span></label>
                                                <input type="text" autoFocus={!!m2Form.master1Id} value={m2Form.particulars} onChange={(e) => { setM2Form((f) => ({ ...f, particulars: e.target.value })); setM2Errors((er) => ({ ...er, particulars: "" })); }} onKeyDown={(e) => e.key === "Enter" && saveMaster2()} placeholder="e.g. React.js Knowledge" className={`w-full bg-gray-100 text-slate-800 placeholder-slate-400 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${m2Errors.particulars ? "ring-2 ring-red-400" : ""}`} />
                                                {m2Errors.particulars && <p className="text-xs text-red-500">{m2Errors.particulars}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Sub-Category <span className="text-red-500">*</span></label>
                                                <input type="text" value={m2Form.category} onChange={(e) => { setM2Form((f) => ({ ...f, category: e.target.value })); setM2Errors((er) => ({ ...er, category: "" })); }} placeholder="e.g. Frontend Engineering" className={`w-full bg-gray-100 text-slate-800 placeholder-slate-400 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${m2Errors.category ? "ring-2 ring-red-400" : ""}`} />
                                                {m2Errors.category && <p className="text-xs text-red-500">{m2Errors.category}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Max Score <span className="text-red-500">*</span></label>
                                                <input type="number" min="0" value={m2Form.maxScore} onChange={(e) => { setM2Form((f) => ({ ...f, maxScore: e.target.value })); setM2Errors((er) => ({ ...er, maxScore: "" })); }} placeholder="e.g. 10" className={`w-full bg-gray-100 text-slate-800 placeholder-slate-400 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${m2Errors.maxScore ? "ring-2 ring-red-400" : ""}`} />
                                                {m2Errors.maxScore && <p className="text-xs text-red-500">{m2Errors.maxScore}</p>}
                                            </div>
                                            <button onClick={saveMaster2} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors text-sm mt-2">Save Master 2</button>
                                        </>
                                    )}

                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
