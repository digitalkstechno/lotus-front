import React from "react";
import {
  Circle, CheckCircle2, ChevronDown, ChevronRight, GripVertical, Clock, Plus, X, Check,
  Building2, Users, User as UserIcon, ListChecks, MoreVertical, Star, ArrowLeftRight,
  AlignLeft, CirclePlus, Target, CornerDownRight, Paperclip, Trash2, ListPlus, Pencil, Printer, RefreshCw, Eye, Download
} from "lucide-react";
import { useTasks } from "../hooks/useTasks";
import { formatDueLabel, newTask, uid, formatDate, isPastDate } from "../lib/utils";
import { MONTHS, ASSIGN_COLORS } from "../lib/constants";
import { Overlay, MenuItem, ListPicker, AssignChip } from "./Shared";
import { ReactSortable } from "react-sortablejs";

// ── List picker used by the Starred page (rendered inside expanded TaskRow) ──
function StarredListPicker({ lists, currentListId, onSelect }: { lists: any[]; currentListId: string; onSelect: (id: string, name: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const current = lists.find((l: any) => l.id === currentListId);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(p => !p); }}
        className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 w-full cursor-pointer transition-colors ${open ? "border-emerald-500 bg-emerald-50" : "border-dashed border-gray-200 hover:border-emerald-400"}`}
      >
        <span className="text-xs text-gray-400 flex-shrink-0">List</span>
        <span className="flex-1 text-xs text-gray-700 truncate text-left">{current?.name || "Select list"}</span>
        <ChevronDown size={12} className={`text-gray-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute left-0 bottom-full mb-1 w-full bg-white rounded-xl border border-gray-200 shadow-xl py-1 z-[200] max-h-48 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {lists.map((l: any) => (
            <button
              key={l.id}
              onClick={() => { onSelect(l.id, l.name); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-emerald-50 transition-colors text-gray-700"
            >
              <span className="w-4 flex-shrink-0">
                {l.id === currentListId && <Check size={13} className="text-emerald-500" />}
              </span>
              <span className="truncate">{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const TaskRow = ({ list, task: taskProp, parentId, depth = 0, onListChange }: any) => {
  const {
    editingTaskId, setEditingTaskId, dragOverTarget, setDragOverTarget, tomorrowClickCount,
    setTomorrowClickCount, openTaskMenu, setOpenTaskMenu, openMovePicker, setOpenMovePicker,
    openAssignFor, setOpenAssignFor, openAttFor, setOpenAttFor, orgPeople, lists, setLists,
    findTaskEverywhere, toggleComplete, toggleStar, setTitle, setDetails, setCalendarFor,
    setEditDeadlineFor, setRepeatFor, setAssign, deleteTaskById, moveTaskToList, moveTaskToNewList,
    handleTomorrowClick, handleTodayClick,
    updateTaskEverywhere, indentTask, promoteToMainTask, dragData, fetchPeople, loadingPeople, setDate, clearDue, uploadTaskAttachment, removeTaskAttachment,
    handleTaskGroupChange, onSortEnd, makeMutable, unmakeMutable
  } = useTasks();

  const [menuCoords, setMenuCoords] = React.useState<any>(null);
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);

  const task = findTaskEverywhere(taskProp.id)?.task || taskProp;
  const isEditing = editingTaskId === task.id;
  const isDragOver = dragOverTarget?.kind === "task-target" && dragOverTarget.id === task.id;
  const tomorrowCount = tomorrowClickCount[task.id] || 0;
  const dueLabel = formatDueLabel(task);

  const renderPendingFileModal = () => {
    if (!pendingFile) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={(e) => { e.stopPropagation(); setPendingFile(null); }}>
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-[340px] space-y-5 transform transition-all" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold text-gray-900">Upload Attachment</h3>
            <button onClick={() => setPendingFile(null)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50/80 p-4 rounded-xl border border-gray-100">
             <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
               <Paperclip size={16} />
             </div>
             <span className="truncate flex-1 font-medium">{pendingFile.name}</span>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setPendingFile(null)} className="px-4 py-2 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
            <button onClick={() => {
               const tempId = uid();
               const url = URL.createObjectURL(pendingFile);
               const tempAttachment = { id: tempId, name: pendingFile.name, url, type: pendingFile.type };
               updateTaskEverywhere(task.id, (t: any) => ({ ...t, attachments: [...(t.attachments || []), tempAttachment] }));
               uploadTaskAttachment(task.id, pendingFile, tempId);
               setPendingFile(null);
            }} className="px-5 py-2 text-sm font-medium rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/20">Upload</button>
          </div>
        </div>
      </div>
    );
  };

  const renderAttachmentsModal = () => {
    if (openAttFor !== task.id) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={(e) => { e.stopPropagation(); setOpenAttFor(null); }}>
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-[400px] max-w-full space-y-4 transform transition-all" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold text-gray-900">Attachments ({task.attachments?.length || 0})</h3>
            <button onClick={() => setOpenAttFor(null)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
            {task.attachments?.map((att: any) => (
              <div key={att.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                   <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                     <Paperclip size={16} />
                   </div>
                   <span className="truncate text-sm font-medium text-gray-700">{att.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a href={att.url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View">
                    <Eye size={14} />
                  </a>
                  <a href={att.url} download={att.name} target="_blank" rel="noopener noreferrer" className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Download">
                    <Download size={14} />
                  </a>
                  <button onClick={() => removeTaskAttachment(task.id, att)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFileInput = () => (
    <input id={`att-input-${task.id}`} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0]; if (!file) return;
        setPendingFile(file);
        e.target.value = "";
      }}
    />
  );

  if (isEditing) {
    return (
      <div className={depth > 0 ? "ml-8 mt-0.5" : "mt-0.5"} onClick={(e) => e.stopPropagation()}>
        <div className="rounded-lg bg-[#F0F2F5] border border-[#E7F8F1] px-3 py-2.5">
          <div className="flex items-start gap-2">
            {depth === 0 && <span className="mt-1.5 text-gray-300 flex-shrink-0"><GripVertical size={16} /></span>}
            <button onClick={() => toggleComplete(task.id)} className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-emerald-500">
              {task.completed ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Circle size={20} />}
            </button>
            <input
              autoFocus
              onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
              value={task.title}
              onChange={(e) => setTitle(task.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { (e.target as HTMLInputElement).blur(); return; }
                if (e.key === "Tab") {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.shiftKey) {
                    setLists((prev: any) => {
                      const found = findTaskEverywhere(task.id, prev);
                      if (!found || !found.parentId) return prev;
                      return prev.map((l: any) => {
                        if (l.id !== found.listId) return l;
                        const pIdx = l.tasks.findIndex((t: any) => t.id === found.parentId);
                        if (pIdx === -1) return l;
                        const taskCopy = { ...found.task, subtasks: found.task.subtasks || [] };
                        const newTasks = [...l.tasks.map((t: any) => t.id === found.parentId ? { ...t, subtasks: t.subtasks.filter((s: any) => s.id !== task.id) } : t)];
                        newTasks.splice(pIdx + 1, 0, taskCopy);
                        return { ...l, tasks: newTasks };
                      });
                    });
                  } else {
                    setLists((prev: any) => {
                      const found = findTaskEverywhere(task.id, prev);
                      if (!found || found.parentId) return prev;
                      return prev.map((l: any) => {
                        if (l.id !== found.listId) return l;
                        const idx = l.tasks.findIndex((t: any) => t.id === task.id);
                        if (idx <= 0) return l;
                        const newParent = l.tasks[idx - 1];
                        if (newParent.completed) return l;
                        const taskCopy = { ...l.tasks[idx], subtasks: [] };
                        return { ...l, tasks: l.tasks.filter((_: any, i: number) => i !== idx).map((t: any) => t.id === newParent.id ? { ...t, subtasks: [...t.subtasks, taskCopy] } : t) };
                      });
                    });
                  }
                  setEditingTaskId(null);
                  return;
                }
              }}
              placeholder="Title"
              className={`flex-1 text-sm bg-transparent focus:outline-none border-b border-emerald-500 pb-0.5 ${task.completed ? "text-gray-400 line-through" : "text-gray-800"}`}
            />
            {depth === 0 && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleStar(task.id)} className="text-gray-400 hover:text-amber-500">
                  <Star size={16} className={task.starred ? "fill-amber-400 text-amber-400" : ""} />
                </button>
                <div className="relative">
                  <button onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const spaceBelow = window.innerHeight - rect.bottom;
                    const style: any = { right: window.innerWidth - rect.right, overflowY: "auto" };
                    if (spaceBelow < 350) {
                      style.bottom = window.innerHeight - rect.top + 4;
                      style.maxHeight = rect.top - 16;
                    } else {
                      style.top = rect.bottom + 4;
                      style.maxHeight = spaceBelow - 16;
                    }
                    setMenuCoords(style);
                    setOpenTaskMenu(openTaskMenu === task.id ? null : task.id);
                  }} className="text-gray-400 hover:text-gray-600 p-0.5">
                    <MoreVertical size={16} />
                  </button>
                  {openTaskMenu === task.id && (
                    <>
                      <Overlay onClose={() => setOpenTaskMenu(null)} />
                      <div className="fixed w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-[60]" style={menuCoords} onClick={(e) => e.stopPropagation()}>
                        <div className="py-1">
                          <MenuItem icon={Target} onClick={() => { setCalendarFor(task.id); setOpenTaskMenu(null); }}>Add deadline</MenuItem>
                          <MenuItem icon={CornerDownRight} onClick={() => indentTask(task.id, list.id)}>Indent</MenuItem>
                          <MenuItem icon={CornerDownRight} onClick={() => { const sub = newTask(""); updateTaskEverywhere(task.id, (t: any) => ({ ...t, subtasks: [...t.subtasks, sub] })); setEditingTaskId(sub.id); setOpenTaskMenu(null); }}>Add a subtask</MenuItem>
                          <MenuItem icon={Paperclip} onClick={() => { setOpenTaskMenu(null); document.getElementById(`att-input-${task.id}`)?.click(); }}>Add attachment</MenuItem>
                          <MenuItem icon={Trash2} danger onClick={() => { deleteTaskById(task.id); setOpenTaskMenu(null); }}>Delete</MenuItem>
                          <div className="border-t border-gray-100 my-1" />
                          <ListPicker lists={lists} currentListId={list.id} onPick={(toId: string) => moveTaskToList(task.id, parentId, toId)} onNewList={(name: string) => moveTaskToNewList(task.id, parentId, name)} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="ml-9 mt-2 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {task.date && (
                  <button onClick={() => setDate(task.id, null)} className="px-2 py-1 rounded-full text-xs font-medium border transition-colors bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center gap-1 capitalize">
                    <Clock size={12} /> {formatDate(task.date)} <X size={10} className="ml-0.5" />
                  </button>
                )}
                {!task.date && (
                  <>
                    <button onClick={() => handleTodayClick(task.id, task)} className="px-3 py-1 rounded-full text-xs font-medium border transition-colors bg-white text-gray-600 border-gray-200 hover:border-emerald-500 hover:text-emerald-500">Today</button>
                    <button onClick={() => handleTomorrowClick(task.id, task)} className="px-3 py-1 rounded-full text-xs font-medium border transition-colors bg-white text-gray-600 border-gray-200 hover:border-emerald-500 hover:text-emerald-500">Tomorrow</button>
                  </>
                )}
                {task.dueDate && (
                  <button onClick={() => setEditDeadlineFor(task.id)} className="px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 transition-colors bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400">
                    <Target size={12} className="text-gray-400" /> Due {dueLabel}{task.dueTime && ` · ${task.dueTime}`}
                    <span onClick={(e) => { e.stopPropagation(); clearDue(task.id); }} className="ml-0.5 rounded-full hover:bg-black/10 p-0.5"><X size={10} /></span>
                  </button>
                )}
                <button onClick={() => setCalendarFor(task.id)} className="p-1.5 rounded-full border bg-white text-gray-500 border-gray-200 hover:border-emerald-500 hover:text-emerald-500 transition-colors" title="Pick a date"><Clock size={14} /></button>
                <button onClick={() => setEditDeadlineFor(task.id)} className="p-1.5 rounded-full border bg-white text-gray-500 border-gray-200 hover:border-emerald-500 hover:text-emerald-500 transition-colors" title="Add deadline"><Target size={14} /></button>
                <button onClick={() => setRepeatFor(task.id)} className={`p-1.5 rounded-full border transition-colors ${task.repeat?.enabled ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-gray-500 border-gray-200 hover:border-emerald-500 hover:text-emerald-500"}`} title="Repeat"><RefreshCw size={14} /></button>
              </div>
              {depth === 0 && (
                <div className="relative">
                  {openMovePicker === task.id && (
                    <>
                      <Overlay onClose={() => setOpenMovePicker(null)} />
                      <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                        <p className="px-3 pt-2 pb-1 text-xs text-gray-400">Move to list</p>
                        <ListPicker lists={lists} currentListId={list.id} onPick={(toId: string) => moveTaskToList(task.id, parentId, toId)} onNewList={(name: string) => moveTaskToNewList(task.id, parentId, name)} />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <input type="text" value={task.details} onChange={(e) => setDetails(task.id, e.target.value)} placeholder="Add details..." className="w-full text-sm bg-transparent focus:outline-none border-b border-gray-200 focus:border-emerald-500 pb-0.5 text-gray-600 placeholder-gray-300" />
            <div className="relative">
              <div onClick={(e) => {
                if (openAssignFor !== task.id) fetchPeople();
                const rect = e.currentTarget.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const style: any = { left: rect.left, overflowY: "auto" };
                if (spaceBelow < 250) {
                  style.bottom = window.innerHeight - rect.top + 4;
                  style.maxHeight = rect.top - 16;
                } else {
                  style.top = rect.bottom + 4;
                  style.maxHeight = spaceBelow - 16;
                }
                setMenuCoords(style);
                setOpenAssignFor(openAssignFor === task.id ? null : task.id);
              }} className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 w-full cursor-pointer transition-colors ${openAssignFor === task.id ? "border-emerald-500 bg-emerald-50" : "border-dashed border-gray-200 hover:border-emerald-400"}`}>
                <span className="text-xs text-gray-400 flex-shrink-0">Assign to</span>
                {task.assign ? (
                  <span className={`inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-full text-xs font-medium border ${ASSIGN_COLORS[task.assign.role] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                    {task.assign.name}<span className="text-[10px] opacity-60">{task.assign.role}</span>
                    <button onClick={(e) => { e.stopPropagation(); setAssign(task.id, null); }} className="ml-0.5 rounded-full hover:bg-black/10 p-0.5"><X size={11} /></button>
                  </span>
                ) : <span className="text-xs text-gray-300">Select a person</span>}
              </div>
              {openAssignFor === task.id && (
                <>
                  <Overlay onClose={() => setOpenAssignFor(null)} />
                  <div className="fixed w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-[60] overflow-hidden flex flex-col" style={menuCoords}>
                    {loadingPeople ? (
                      <p className="px-3 py-3 text-xs text-gray-400 italic">Loading staff...</p>
                    ) : orgPeople.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-gray-400 italic">No staff found. Add staff first.</p>
                    ) : (
                      <div style={{ maxHeight: '150px', overflowY: 'auto' }} className="py-1">
                        {orgPeople.map((p: any) => (
                          <button key={p.id} onClick={() => { setAssign(task.id, { id: p.id, name: p.name, role: p.role }); setOpenAssignFor(null); }} className="w-full flex items-center justify-between px-3 py-2 hover:bg-emerald-50 transition-colors">
                            <span className="text-xs font-medium text-gray-800">{p.name}</span><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ASSIGN_COLORS[p.role]}`}>{p.role}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            {(task.attachments || []).length > 0 && (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={(e) => {
                  e.stopPropagation();
                  setOpenAttFor(openAttFor === task.id ? null : task.id);
                }} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors text-[11px] font-medium">
                  <Paperclip size={11} />{task.attachments.length} attachment{task.attachments.length > 1 ? "s" : ""}
                </button>
              </div>
            )}
          </div>
          {/* List picker — shown only in starred/special context when onListChange is provided */}
          {onListChange && (
            <div className="ml-9 mt-2">
              <StarredListPicker lists={lists} currentListId={list.id} onSelect={(id, name) => onListChange(id, name, task.id)} />
            </div>
          )}
        </div>
        {renderPendingFileModal()}
        {renderAttachmentsModal()}
        {renderFileInput()}
      </div>
    );
  }

  return (
    <div className={depth > 0 ? "ml-8 mt-0.5" : ""} data-task-id={task.id}>
      <div
        onClick={(e) => { e.stopPropagation(); setEditingTaskId(task.id); }}
        className={`task-drag-handle group flex items-start gap-2.5 rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${isDragOver ? "bg-emerald-50 ring-1 ring-emerald-500" : "hover:bg-[#F0F2F5]"}`}
      >
        <div className="w-[18px] h-[18px] shrink-0 mt-0.5">
          <button onClick={(e) => { e.stopPropagation(); toggleComplete(task.id); }} className="text-gray-300 hover:text-emerald-500 transition-colors">
            {task.completed ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} />}
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[13px] leading-snug ${task.completed ? "text-gray-400 line-through" : "text-gray-800 font-medium"}`}>{task.title}</p>
          {(task.date || task.dueDate || task.assign || task.subtasks?.length > 0 || task.details || task.attachments?.length > 0) && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {task.details && <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 flex items-center gap-1"><AlignLeft size={11} /> Details</span>}
              {task.date && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full capitalize flex items-center gap-1 border ${
                  isPastDate(task.date) 
                    ? "bg-red-50 text-red-600 border-red-200" 
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  <Clock size={10} /> {formatDate(task.date)}
                </span>
              )}
              {task.dueDate && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full capitalize flex items-center gap-1 border ${
                  isPastDate(task.dueDate)
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-white text-gray-600 border-gray-300"
                }`}>
                  <Target size={10} className={isPastDate(task.dueDate) ? "text-red-500" : "text-gray-400"} />
                  Due {dueLabel}{task.dueTime && ` · ${task.dueTime}`}
                </span>
              )}
              {task.repeat?.enabled && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-gray-600 border border-gray-300 flex items-center gap-1">
                  <RefreshCw size={10} className="text-gray-400" />
                </span>
              )}
              {task.attachments?.length > 0 && (
                <div className="relative">
                  <button onClick={(e) => {
                    e.stopPropagation();
                    setOpenAttFor(openAttFor === task.id ? null : task.id);
                  }} className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center gap-1 hover:bg-blue-100 transition-colors">
                    <Paperclip size={10} />{task.attachments.length}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {depth === 0 && (
            <button onClick={(e) => { e.stopPropagation(); toggleStar(task.id); }} className={`p-0.5 transition-opacity ${task.starred ? "opacity-100 text-amber-400" : "opacity-0 group-hover:opacity-100 text-gray-400 hover:text-amber-500"}`}>
              <Star size={15} className={task.starred ? "fill-amber-400" : ""} />
            </button>
          )}
          <div className="relative">
            <button onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const spaceBelow = window.innerHeight - rect.bottom;
              const style: any = { right: window.innerWidth - rect.right, overflowY: "auto" };
              if (spaceBelow < 350) {
                style.bottom = window.innerHeight - rect.top + 4;
                style.maxHeight = rect.top - 16;
              } else {
                style.top = rect.bottom + 4;
                style.maxHeight = spaceBelow - 16;
              }
              setMenuCoords(style);
              setOpenTaskMenu(openTaskMenu === task.id ? null : task.id);
            }} className="p-0.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity">
              <MoreVertical size={15} />
            </button>
            {openTaskMenu === task.id && (
              <>
                <Overlay onClose={() => setOpenTaskMenu(null)} />
                <div className="fixed w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-[60]" style={menuCoords} onClick={(e) => e.stopPropagation()}>
                  <div className="py-1">
                    {depth === 0 ? (
                      <>
                        <MenuItem icon={Target} onClick={() => { setCalendarFor(task.id); setOpenTaskMenu(null); }}>Add deadline</MenuItem>
                        <MenuItem icon={CornerDownRight} onClick={(e: any) => {
                          e.stopPropagation();
                          const sub = newTask("");
                          (sub as any).isNew = true;
                          sub.order = task.subtasks?.length || 0;
                          updateTaskEverywhere(task.id, (t: any) => ({ ...t, subtasks: [...t.subtasks, sub] }));
                          setEditingTaskId(sub.id);
                          setOpenTaskMenu(null);
                        }}>Add a subtask</MenuItem>
                        <MenuItem icon={CornerDownRight} onClick={() => { indentTask(task.id, list.id); setOpenTaskMenu(null); }}>Indent</MenuItem>
                        <MenuItem icon={Paperclip} onClick={() => { setOpenTaskMenu(null); document.getElementById(`att-input-${task.id}`)?.click(); }}>Add attachment</MenuItem>
                        <MenuItem icon={Trash2} danger onClick={() => { deleteTaskById(task.id); setOpenTaskMenu(null); }}>Delete</MenuItem>
                        <div className="border-t border-gray-100 my-1" />
                        <ListPicker lists={lists} currentListId={list.id} onPick={(toId: string) => moveTaskToList(task.id, parentId, toId)} onNewList={(name: string) => moveTaskToNewList(task.id, parentId, name)} />
                      </>
                    ) : (
                      <>
                        <MenuItem icon={ArrowLeftRight} onClick={() => { promoteToMainTask(task.id, parentId, list.id); setOpenTaskMenu(null); }}>Make main task</MenuItem>
                        <MenuItem icon={Paperclip} onClick={() => { setOpenTaskMenu(null); document.getElementById(`att-input-${task.id}`)?.click(); }}>Add attachment</MenuItem>
                        <MenuItem icon={Trash2} danger onClick={() => { deleteTaskById(task.id); setOpenTaskMenu(null); }}>Delete</MenuItem>
                        <div className="border-t border-gray-100 my-1" />
                        <ListPicker lists={lists} currentListId={list.id} onPick={(toId: string) => moveTaskToList(task.id, parentId, toId)} onNewList={(name: string) => moveTaskToNewList(task.id, parentId, name)} />
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {depth === 0 && (
        /* Wrapper div carries list/parent context for onSortEnd via closest() */
        /* Always rendered so tasks with 0 subtasks still have a droppable zone */
        <div data-list-id={list.id} data-parent-id={task.id}>
          <ReactSortable
            list={makeMutable((task.subtasks || []).filter((s: any) => task.completed ? s.completed : !s.completed))}
            setList={(newSubtasks) => {
               const plainSubtasks = unmakeMutable(newSubtasks);
               const otherSubtasks = (task.subtasks || []).filter((s: any) => task.completed ? !s.completed : s.completed);
               handleTaskGroupChange(list.id, task.id, [...plainSubtasks, ...otherSubtasks]);
            }}
            group="shared"
            onEnd={onSortEnd}
            handle=".task-drag-handle"
            animation={150}
            className={`space-y-0.5 ml-8 mt-0.5 transition-all duration-150 ${
              (task.subtasks || []).filter((s: any) => task.completed ? s.completed : !s.completed).length === 0
                ? "min-h-[12px] sortable-empty-zone"
                : "min-h-[4px]"
            }`}
          >
            {(task.subtasks || []).filter((s: any) => task.completed ? s.completed : !s.completed).map((sub: any) => (
              <TaskRow key={sub.id} list={list} task={sub} parentId={task.id} depth={1} />
            ))}
          </ReactSortable>
        </div>
      )}
      {renderPendingFileModal()}
      {renderAttachmentsModal()}
      {renderFileInput()}
    </div>
  );
};

