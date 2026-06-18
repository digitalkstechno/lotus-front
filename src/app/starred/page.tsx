"use client";

import { useState, useEffect, useRef } from "react";
import {
  CirclePlus, Check, Circle, CheckCircle2, Star, MoreVertical, Menu, Clock,
  Repeat2, RefreshCw, LayoutGrid, LogOut, GripVertical, ChevronLeft, ChevronRight,
  X, Target, Paperclip, Trash2, ListPlus, AlignLeft,
} from "lucide-react";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const TASK_LISTS = ["My Tasks", "test 1", "test 2", "test 3"];

function uid() { return Math.random().toString(36).slice(2); }

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = startOffset - 1; i >= 0; i--) cells.push({ day: daysInPrevMonth - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  while (cells.length % 7 !== 0 || cells.length < 35)
    cells.push({ day: cells.length - (startOffset + daysInMonth) + 1, current: false });
  return cells;
}

function newTask() {
  return { id: uid(), title: "", details: "", completed: false, starred: false, date: null, repeat: null, list: "My Tasks" };
}

export default function TasksPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Starred recently");
  const menuRef = useRef(null);

  const [tasks, setTasks] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalForTask, setModalForTask] = useState<string | null>(null);
  const [dotMenuFor, setDotMenuFor] = useState<string | null>(null);

  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [repeatInterval, setRepeatInterval] = useState(1);
  const [repeatFreq, setRepeatFreq] = useState("day");
  const [repeatEnds, setRepeatEnds] = useState("never");

  const containerRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (activeModal) return;
      if (dotMenuFor) return;
      if (containerRef.current && !containerRef.current.contains(e.target)) setEditingId(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [activeModal, dotMenuFor]);

  const addTask = () => {
    const t = newTask();
    setTasks(prev => [...prev, t]);
    setEditingId(t.id);
  };

  const updateTask = (id, patch) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  const deleteTask = (id) => { setTasks(prev => prev.filter(t => t.id !== id)); if (editingId === id) setEditingId(null); };

  const cells = buildCalendar(viewYear, viewMonth);
  const goPrevMonth = () => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
  const goNextMonth = () => viewMonth === 11 ? (setViewMonth(0), setViewYear(y => y + 1)) : setViewMonth(m => m + 1);
  const closeModal = () => { setActiveModal(null); setModalForTask(null); };

  const sortOptions = ["Starred recently", "Date", "Deadline", "Title"];

  return (
    <div className="min-h-screen bg-white relative">
      <div className="bg-emerald-700 px-6 py-4">
        <h1 className="text-white text-xl font-semibold">Starred Tasks</h1>
        <p className="text-emerald-100 text-sm mt-1">Manage your Starred Tasks</p>
      </div>

      <div className="px-6 py-8">
        <div ref={containerRef} className="max-w-2xl rounded-xl border border-gray-200 shadow-sm bg-white overflow-visible">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 relative">
            <h2 className="text-gray-900 font-medium">Starred tasks</h2>
            <div ref={menuRef} className="relative">
              <button onClick={() => setMenuOpen(p => !p)} className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-xl bg-white border border-gray-200 shadow-xl py-3 z-50">
                  <p className="px-5 pb-2 text-gray-900 text-sm font-medium">Sort by</p>
                  {sortOptions.map(o => (
                    <button key={o} onClick={() => { setSortBy(o); setMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-5 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                      <span className="w-4 flex-shrink-0">{sortBy === o && <Check className="w-4 h-4 text-emerald-700" />}</span>{o}
                    </button>
                  ))}
                  <div className="my-2 border-t border-gray-200" />
                  <button onClick={() => setMenuOpen(false)} className="flex items-center w-full px-5 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">Print list</button>
                  <button disabled className="flex items-center w-full px-5 py-2 text-left text-sm text-gray-400 cursor-not-allowed">Clean up old tasks</button>
                </div>
              )}
            </div>
          </div>

          {/* Add task button */}
          <div className="px-6 pt-4">
            <button onClick={addTask} className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 text-sm font-medium">
              <CirclePlus className="w-4 h-4" />
              Add a starred task
            </button>
          </div>

          {/* Task list */}
          <div className="px-6 pt-3 pb-4 space-y-2">
            {tasks.map(task => {
              const isEditing = editingId === task.id;
              return (
                <div key={task.id}>
                  {/* Collapsed */}
                  {!isEditing && (
                    <div
                      onClick={() => setEditingId(task.id)}
                      className="group flex items-start gap-2.5 rounded-lg px-3 py-2.5 hover:bg-[#F0F2F5] cursor-pointer transition-colors"
                    >
                      <button onClick={e => { e.stopPropagation(); updateTask(task.id, { completed: !task.completed }); }}
                        className="text-gray-300 hover:text-emerald-500 transition-colors mt-0.5 flex-shrink-0">
                        {task.completed ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] leading-snug ${task.completed ? "text-gray-400 line-through" : "text-gray-800 font-medium"}`}>
                          {task.title || <span className="text-gray-400 font-normal">Title</span>}
                        </p>
                        {(task.details || task.date || task.repeat) && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {task.details && <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 flex items-center gap-1"><AlignLeft size={11} /> Details</span>}
                            {task.date && <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><Clock size={10} /> {task.date}</span>}
                            {task.repeat && <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-gray-600 border border-gray-300 flex items-center gap-1"><RefreshCw size={10} /></span>}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={e => { e.stopPropagation(); updateTask(task.id, { starred: !task.starred }); }}
                          className={`p-0.5 transition-opacity ${task.starred ? "opacity-100 text-amber-400" : "opacity-0 group-hover:opacity-100 text-gray-400 hover:text-amber-500"}`}>
                          <Star size={15} className={task.starred ? "fill-amber-400" : ""} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expanded */}
                  {isEditing && (
                    <div className="rounded-lg bg-[#F0F2F5] border border-[#E7F8F1] px-3 py-2.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-start gap-2">
                        <span className="mt-1.5 text-gray-300 flex-shrink-0"><GripVertical size={16} /></span>
                        <button onClick={() => updateTask(task.id, { completed: !task.completed })} className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-emerald-500">
                          {task.completed ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Circle size={20} />}
                        </button>
                        <input
                          autoFocus
                          value={task.title}
                          onChange={e => updateTask(task.id, { title: e.target.value })}
                          onKeyDown={e => { if (e.key === "Enter") setEditingId(null); }}
                          placeholder="Title"
                          className={`flex-1 text-sm bg-transparent focus:outline-none border-b border-emerald-500 pb-0.5 ${task.completed ? "text-gray-400 line-through" : "text-gray-800"}`}
                        />
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => updateTask(task.id, { starred: !task.starred })} className="text-gray-400 hover:text-amber-500">
                            <Star size={16} className={task.starred ? "fill-amber-400 text-amber-400" : ""} />
                          </button>
                          {/* Dot menu */}
                          <div className="relative">
                            <button onClick={e => { e.stopPropagation(); setDotMenuFor(dotMenuFor === task.id ? null : task.id); }}
                              className="text-gray-400 hover:text-gray-600 p-0.5">
                              <MoreVertical size={16} />
                            </button>
                            {dotMenuFor === task.id && (
                              <div className="absolute right-0 top-full mt-1 w-52 rounded-xl bg-neutral-800 shadow-2xl py-2 z-[200]" onClick={e => e.stopPropagation()}>
                                <button onClick={() => { setModalForTask(task.id); setActiveModal("date"); setDotMenuFor(null); }}
                                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700">
                                  <Target className="w-4 h-4 text-neutral-400" />Add deadline
                                </button>
                                <button onClick={() => { deleteTask(task.id); setDotMenuFor(null); }}
                                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-neutral-700">
                                  <Trash2 className="w-4 h-4" />Delete
                                </button>
                                <div className="my-1 border-t border-neutral-700" />
                                {TASK_LISTS.map(l => (
                                  <button key={l} onClick={() => { updateTask(task.id, { list: l }); setDotMenuFor(null); }}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700">
                                    <span className="w-4 flex-shrink-0">{task.list === l && <Check className="w-4 h-4 text-neutral-200" />}</span>{l}
                                  </button>
                                ))}
                                <div className="my-1 border-t border-neutral-700" />
                                <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700">
                                  <ListPlus className="w-4 h-4 text-neutral-400" />New list
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="ml-9 mt-2 space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            {task.date && (
                              <button onClick={() => updateTask(task.id, { date: null })}
                                className="px-2 py-1 rounded-full text-xs font-medium border transition-colors bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center gap-1">
                                <Clock size={12} /> {task.date} <X size={10} className="ml-0.5" />
                              </button>
                            )}
                            {!task.date && (
                              <>
                                <button onClick={() => updateTask(task.id, { date: "Today" })} className="px-3 py-1 rounded-full text-xs font-medium border bg-white text-gray-600 border-gray-200 hover:border-emerald-500 hover:text-emerald-500">Today</button>
                                <button onClick={() => updateTask(task.id, { date: "Tomorrow" })} className="px-3 py-1 rounded-full text-xs font-medium border bg-white text-gray-600 border-gray-200 hover:border-emerald-500 hover:text-emerald-500">Tomorrow</button>
                              </>
                            )}
                            <button onClick={() => { setModalForTask(task.id); setActiveModal("date"); }}
                              className="p-1.5 rounded-full border bg-white text-gray-500 border-gray-200 hover:border-emerald-500 hover:text-emerald-500 transition-colors" title="Pick a date">
                              <Clock size={14} />
                            </button>
                            <button onClick={() => { setModalForTask(task.id); setActiveModal("repeat"); }}
                              className={`p-1.5 rounded-full border transition-colors ${task.repeat ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-gray-500 border-gray-200 hover:border-emerald-500 hover:text-emerald-500"}`} title="Repeat">
                              <RefreshCw size={14} />
                            </button>
                          </div>
                        </div>
                        <input type="text" value={task.details} onChange={e => updateTask(task.id, { details: e.target.value })}
                          placeholder="Add details..."
                          className="w-full text-sm bg-transparent focus:outline-none border-b border-gray-200 focus:border-emerald-500 pb-0.5 text-gray-600 placeholder-gray-300" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <LayoutGrid className="w-4 h-4" />
                            <span className="text-gray-700 text-sm">{task.list}</span>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600"><LogOut className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="relative w-28 h-28 mb-4">
                <svg viewBox="0 0 120 120" className="w-full h-full">
                  <circle cx="48" cy="38" r="12" fill="#7B4B2A" />
                  <path d="M30 95 Q30 60 48 60 Q66 60 66 95 Z" fill="#4FA8E0" />
                  <path d="M58 70 Q80 70 80 50" stroke="#7B4B2A" strokeWidth="6" fill="none" strokeLinecap="round" />
                  <circle cx="33" cy="20" r="3" fill="#5b5b5b" />
                  <circle cx="38" cy="14" r="3" fill="#5b5b5b" />
                  <circle cx="44" cy="10" r="3" fill="#5b5b5b" />
                  <path d="M75 20 L82 38 L101 38 L86 49 L91 67 L75 56 L59 67 L64 49 L49 38 L68 38 Z" fill="#F4C77B" />
                </svg>
              </div>
              <h3 className="text-gray-900 font-medium text-base mb-2">No starred tasks</h3>
              <p className="text-gray-500 text-sm text-center leading-relaxed">
                Mark important tasks with a star so<br />that you can easily find them here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={closeModal}>
          <div onClick={e => e.stopPropagation()} className="w-80 rounded-2xl bg-neutral-800 shadow-2xl p-5">
            {activeModal === "date" && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white text-sm font-medium">{MONTH_NAMES[viewMonth]} {viewYear}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={goPrevMonth} className="text-neutral-400 hover:text-white p-1"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={goNextMonth} className="text-neutral-400 hover:text-white p-1"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 text-center text-xs text-neutral-400 mb-1">
                  {WEEKDAYS.map((d, i) => <span key={i}>{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-y-1 text-center text-sm mb-3">
                  {cells.map((cell, i) => {
                    const isSelected = cell.current && cell.day === selectedDay;
                    return (
                      <button key={i} disabled={!cell.current} onClick={() => cell.current && setSelectedDay(cell.day)}
                        className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full ${!cell.current ? "text-neutral-600" : "text-neutral-200 hover:bg-neutral-700"} ${isSelected ? "border border-blue-400 text-blue-400" : ""}`}>
                        {cell.day}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-end gap-4 mt-2">
                  <button onClick={closeModal} className="text-blue-400 text-sm font-medium hover:text-blue-300">Cancel</button>
                  <button onClick={() => {
                    if (modalForTask) updateTask(modalForTask, { date: `${selectedDay} ${MONTH_NAMES[viewMonth].slice(0, 3)}` });
                    closeModal();
                  }} className="px-4 py-1.5 rounded-full border border-blue-400 text-blue-400 text-sm font-medium hover:bg-blue-400/10">Done</button>
                </div>
              </>
            )}
            {activeModal === "repeat" && (
              <>
                <p className="text-white text-sm font-medium mb-2">Repeats every</p>
                <div className="flex items-center gap-2 mb-3">
                  <input type="number" min={1} value={repeatInterval} onChange={e => setRepeatInterval(Number(e.target.value) || 1)}
                    className="w-16 bg-neutral-700 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                  <select value={repeatFreq} onChange={e => setRepeatFreq(e.target.value)}
                    className="flex-1 bg-neutral-700 rounded-lg px-3 py-2 text-white text-sm outline-none appearance-none">
                    <option value="day">day</option>
                    <option value="week">week</option>
                    <option value="month">month</option>
                    <option value="year">year</option>
                  </select>
                </div>
                <p className="text-white text-sm font-medium mb-2">Ends</p>
                <div className="space-y-2 mb-4">
                  {["never", "on", "after"].map(opt => (
                    <label key={opt} className="flex items-center gap-2 text-sm text-neutral-200">
                      <input type="radio" checked={repeatEnds === opt} onChange={() => setRepeatEnds(opt)} className="accent-blue-500" />
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </label>
                  ))}
                </div>
                <div className="flex items-center justify-end gap-4">
                  <button onClick={closeModal} className="text-blue-400 text-sm font-medium hover:text-blue-300">Cancel</button>
                  <button onClick={() => {
                    if (modalForTask) updateTask(modalForTask, { repeat: { interval: repeatInterval, frequency: repeatFreq } });
                    closeModal();
                  }} className="px-4 py-1.5 rounded-full border border-blue-400 text-blue-400 text-sm font-medium hover:bg-blue-400/10">Done</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
