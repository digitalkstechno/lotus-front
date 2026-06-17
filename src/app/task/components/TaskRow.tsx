import React from "react";
import {
  Circle, CheckCircle2, ChevronDown, ChevronRight, GripVertical, Clock, Plus, X, Check,
  Building2, Users, User as UserIcon, ListChecks, MoreVertical, Star, ArrowLeftRight,
  AlignLeft, CirclePlus, Target, CornerDownRight, Paperclip, Trash2, ListPlus, Pencil, Printer, RefreshCw
} from "lucide-react";
import { useTasks } from "../hooks/useTasks";
import { formatDueLabel, newTask, uid } from "../lib/utils";
import { MONTHS, ASSIGN_COLORS } from "../lib/constants";
import { Overlay, MenuItem, ListPicker, AssignChip } from "./Shared";

export const TaskRow = ({ list, task: taskProp, parentId, depth = 0 }: any) => {
  const {
    editingTaskId, setEditingTaskId, dragOverTarget, setDragOverTarget, tomorrowClickCount,
    setTomorrowClickCount, openTaskMenu, setOpenTaskMenu, openMovePicker, setOpenMovePicker,
    openAssignFor, setOpenAssignFor, openAttFor, setOpenAttFor, orgPeople, lists, setLists,
    findTaskEverywhere, toggleComplete, toggleStar, setTitle, setDetails, setCalendarFor,
    setEditDeadlineFor, setRepeatFor, setAssign, deleteTaskById, moveTaskToList, moveTaskToNewList,
    handleTomorrowClick, handleTodayClick, onDragStartTask, onDragEnd, dropAssign, dropOnTask,
    updateTaskEverywhere, indentTask, promoteToMainTask, dragData, fetchPeople, loadingPeople
  } = useTasks();

  const task = findTaskEverywhere(taskProp.id)?.task || taskProp;
  const isEditing = editingTaskId === task.id;
  const isDragOver = dragOverTarget?.kind === "task-target" && dragOverTarget.id === task.id;
  const tomorrowCount = tomorrowClickCount[task.id] || 0;
  const dueLabel = formatDueLabel(task);

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
                  <button onClick={() => setOpenTaskMenu(openTaskMenu === task.id ? null : task.id)} className="text-gray-400 hover:text-gray-600 p-0.5">
                    <MoreVertical size={16} />
                  </button>
                  {openTaskMenu === task.id && (
                    <>
                      <Overlay onClose={() => setOpenTaskMenu(null)} />
                      <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1">
                        <MenuItem icon={Target} onClick={() => { setCalendarFor(task.id); setOpenTaskMenu(null); }}>Add deadline</MenuItem>
                        <MenuItem icon={CornerDownRight} onClick={() => indentTask(task.id, list.id)}>Indent</MenuItem>
                        <MenuItem icon={CornerDownRight} onClick={() => { const sub = newTask(""); updateTaskEverywhere(task.id, (t: any) => ({ ...t, subtasks: [...t.subtasks, sub] })); setEditingTaskId(sub.id); setOpenTaskMenu(null); }}>Add a subtask</MenuItem>
                        <MenuItem icon={Paperclip} onClick={() => { setOpenTaskMenu(null); document.getElementById(`att-input-${task.id}`)?.click(); }}>Add attachment</MenuItem>
                        <input id={`att-input-${task.id}`} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]; if (!file) return;
                            const url = URL.createObjectURL(file);
                            const attachment = { id: uid(), name: file.name, url, type: file.type };
                            updateTaskEverywhere(task.id, (t: any) => ({ ...t, attachments: [...(t.attachments || []), attachment] }));
                            setEditingTaskId(task.id);
                            e.target.value = "";
                          }}
                        />
                        <MenuItem icon={Trash2} danger onClick={() => { deleteTaskById(task.id); setOpenTaskMenu(null); }}>Delete</MenuItem>
                        <div className="border-t border-gray-100 my-1" />
                        <ListPicker lists={lists} currentListId={list.id} onPick={(toId: string) => moveTaskToList(task.id, parentId, toId)} onNewList={(name: string) => moveTaskToNewList(task.id, parentId, name)} />
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
                {(task.due === "today" || !task.due) && (
                  <button onClick={() => handleTodayClick(task.id, task)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${task.due === "today" ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-500 hover:text-emerald-500"}`}>Today</button>
                )}
                {(task.due === "tomorrow" || !task.due) && (
                  <button onClick={() => handleTomorrowClick(task.id, task)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${task.due === "tomorrow" ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-500 hover:text-emerald-500"}`}>Tomorrow</button>
                )}
                {task.dueDate ? (
                  <button onClick={() => setEditDeadlineFor(task.id)} className="px-2 py-1 rounded-full text-xs font-medium border bg-emerald-500 text-white border-emerald-500 flex items-center gap-1">
                    <Clock size={12} />{(() => { const d = new Date(task.dueDate); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; })()}{task.dueTime && ` · ${task.dueTime}`}
                  </button>
                ) : (
                  <button onClick={() => setCalendarFor(task.id)} className="p-1.5 rounded-full border bg-white text-gray-500 border-gray-200 hover:border-emerald-500 hover:text-emerald-500 transition-colors" title="Pick a date"><Clock size={14} /></button>
                )}
                <button onClick={() => setRepeatFor(task.id)} className={`p-1.5 rounded-full border transition-colors ${task.repeat ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-gray-500 border-gray-200 hover:border-emerald-500 hover:text-emerald-500"}`} title="Repeat"><RefreshCw size={14} /></button>
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
              <div onClick={() => {
                if (openAssignFor !== task.id) fetchPeople();
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
                  <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
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
                <button onClick={(e) => { e.stopPropagation(); setOpenAttFor(openAttFor === task.id ? null : task.id); }} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors text-[11px] font-medium">
                  <Paperclip size={11} />{task.attachments.length} attachment{task.attachments.length > 1 ? "s" : ""}
                </button>
                {openAttFor === task.id && (
                  <>
                    <Overlay onClose={() => setOpenAttFor(null)} />
                    <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                      <div className="max-h-40 overflow-y-auto py-1">
                        {task.attachments.map((att: any) => (
                          <div key={att.id} className="relative group/att">
                            <a href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 pr-7 hover:bg-emerald-50 transition-colors" onClick={(e) => e.stopPropagation()}>
                              <Paperclip size={11} className="text-gray-400 shrink-0" /><span className="text-xs text-gray-700 truncate">{att.name}</span>
                            </a>
                            <button onClick={(e) => { e.stopPropagation(); updateTaskEverywhere(task.id, (t: any) => ({ ...t, attachments: (t.attachments || []).filter((a: any) => a.id !== att.id) })); }} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 text-white rounded-full hidden group-hover/att:flex items-center justify-center"><X size={9} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={depth > 0 ? "ml-8 mt-0.5" : ""}>
      <div
        draggable={!task.completed}
        onDragStart={(e) => onDragStartTask(e, list.id, task.id, parentId)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); if (dragData.current?.kind === "task" && depth === 0) setDragOverTarget({ kind: "task-target", id: task.id }); }}
        onDrop={(e) => { const d = dragData.current; if (d?.kind === "assign") dropAssign(e, task.id); else if (depth === 0) dropOnTask(e, list.id, task.id); }}
        onClick={(e) => { e.stopPropagation(); setEditingTaskId(task.id); }}
        className={`group flex items-start gap-2.5 rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${isDragOver ? "bg-emerald-50 ring-1 ring-emerald-500" : "hover:bg-[#F0F2F5]"}`}
      >
        <div className="w-[18px] h-[18px] shrink-0 mt-0.5">
          <button onClick={(e) => { e.stopPropagation(); toggleComplete(task.id); }} className="text-gray-300 hover:text-emerald-500 transition-colors">
            {task.completed ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} />}
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[13px] leading-snug ${task.completed ? "text-gray-400 line-through" : "text-gray-800 font-medium"}`}>{task.title}</p>
          {(task.due || task.dueDate || task.assign || task.subtasks?.length > 0 || task.details || task.attachments?.length > 0) && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {task.details && <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 flex items-center gap-1"><AlignLeft size={11} /> Details</span>}
              {(task.due || task.dueDate) && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize flex items-center gap-1">
                  <Clock size={10} />{dueLabel}{task.dueTime && ` · ${task.dueTime}`}{task.repeat && <RefreshCw size={10} />}
                </span>
              )}
              {task.attachments?.length > 0 && (
                <div className="relative">
                  <button onClick={(e) => { e.stopPropagation(); setOpenAttFor(openAttFor === task.id ? null : task.id); }} className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center gap-1 hover:bg-blue-100 transition-colors">
                    <Paperclip size={10} />{task.attachments.length}
                  </button>
                  {openAttFor === task.id && (
                    <>
                      <Overlay onClose={() => setOpenAttFor(null)} />
                      <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                        {task.attachments.map((att: any) => (
                          <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 transition-colors" onClick={(e) => e.stopPropagation()}>
                            <Paperclip size={11} className="text-gray-400 shrink-0" /><span className="text-xs text-gray-700 truncate">{att.name}</span>
                          </a>
                        ))}
                      </div>
                    </>
                  )}
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
            <button onClick={(e) => { e.stopPropagation(); setOpenTaskMenu(openTaskMenu === task.id ? null : task.id); }} className="p-0.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity">
              <MoreVertical size={15} />
            </button>
            {openTaskMenu === task.id && (
              <>
                <Overlay onClose={() => setOpenTaskMenu(null)} />
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1" onClick={(e) => e.stopPropagation()}>
                  {depth === 0 ? (
                    <>
                      <MenuItem icon={Target} onClick={() => { setCalendarFor(task.id); setOpenTaskMenu(null); }}>Add deadline</MenuItem>
                      <MenuItem icon={CornerDownRight} onClick={(e: any) => { e.stopPropagation(); const sub = newTask(""); updateTaskEverywhere(task.id, (t: any) => ({ ...t, subtasks: [...t.subtasks, sub] })); setEditingTaskId(sub.id); setOpenTaskMenu(null); }}>Add a subtask</MenuItem>
                      <MenuItem icon={CornerDownRight} onClick={() => { indentTask(task.id, list.id); setOpenTaskMenu(null); }}>Indent</MenuItem>
                      <MenuItem icon={Paperclip} onClick={() => { setOpenTaskMenu(null); document.getElementById(`att-input-non-${task.id}`)?.click(); }}>Add attachment</MenuItem>
                      <input id={`att-input-non-${task.id}`} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]; if (!file) return;
                          const url = URL.createObjectURL(file);
                          const attachment = { id: uid(), name: file.name, url, type: file.type };
                          updateTaskEverywhere(task.id, (t: any) => ({ ...t, attachments: [...(t.attachments || []), attachment] }));
                          e.target.value = "";
                        }}
                      />
                      <MenuItem icon={Trash2} danger onClick={() => { deleteTaskById(task.id); setOpenTaskMenu(null); }}>Delete</MenuItem>
                      <div className="border-t border-gray-100 my-1" />
                      <ListPicker lists={lists} currentListId={list.id} onPick={(toId: string) => moveTaskToList(task.id, parentId, toId)} onNewList={(name: string) => moveTaskToNewList(task.id, parentId, name)} />
                    </>
                  ) : (
                    <>
                      <MenuItem icon={ArrowLeftRight} onClick={() => { promoteToMainTask(task.id, parentId, list.id); setOpenTaskMenu(null); }}>Make main task</MenuItem>
                      <MenuItem icon={Trash2} danger onClick={() => { deleteTaskById(task.id); setOpenTaskMenu(null); }}>Delete</MenuItem>
                      <div className="border-t border-gray-100 my-1" />
                      <ListPicker lists={lists} currentListId={list.id} onPick={(toId: string) => moveTaskToList(task.id, parentId, toId)} onNewList={(name: string) => moveTaskToNewList(task.id, parentId, name)} />
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {depth === 0 && task.subtasks?.length > 0 && (
        <div className="space-y-0.5 ml-8 mt-0.5">
          {task.subtasks.filter((s: any) => task.completed ? s.completed : !s.completed).map((sub: any) => (
            <TaskRow key={sub.id} list={list} task={sub} parentId={task.id} depth={1} />
          ))}
        </div>
      )}
    </div>
  );
};
