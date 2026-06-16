"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Circle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Clock,
  Plus,
  X,
  Check,
  Building2,
  Users,
  User as UserIcon,
  ListChecks,
  MoreVertical,
  Star,
  ArrowLeftRight,
  AlignLeft,
  CirclePlus,
  Target,
  CornerDownRight,
  Paperclip,
  Trash2,
  ListPlus,
  Pencil,
  Printer,
  RefreshCw,
} from "lucide-react";

/* ---------------------------------------------------------
   Utility / initial data
--------------------------------------------------------- */
const uid = () => Math.random().toString(36).slice(2, 9);

const newTask = (title = "") => ({
  id: uid(),
  title,
  completed: false,
  starred: false,
  details: "",
  due: null,
  dueDate: null,
  dueTime: null,
  repeat: null,
  assign: null,
  attachments: [],
  subtasks: [],
  createdAt: Date.now(),
});

const initialLists = [
  {
    id: "l1",
    name: "My Tasks",
    sortBy: "deadline",
    tasks: [{ ...newTask("demo22") }],
  },
  { id: "l2", name: "demo", sortBy: "deadline", tasks: [] },
  { id: "l3", name: "test", sortBy: "deadline", tasks: [] },
  { id: "l4", name: "demo2", sortBy: "deadline", tasks: [] },
];

const ASSIGN_PALETTE = [
  { type: "Unit", icon: Building2, items: ["Sales Unit", "Marketing Unit"] },
  { type: "Team", icon: Users, items: ["Design Team", "Dev Team"] },
  { type: "User", icon: UserIcon, items: ["Riya Shah", "Aman Patel"] },
];

const ASSIGN_COLORS = {
  Unit: "bg-blue-50 text-blue-700 border-blue-200",
  Team: "bg-purple-50 text-purple-700 border-purple-200",
  Staff: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Unit Head": "bg-amber-50 text-amber-700 border-amber-200",
  "Team Head": "bg-orange-50 text-orange-700 border-orange-200",
};

function useOrgPeople() {
  const [people, setPeople] = useState([]);
  useEffect(() => {
    try {
      const staff = JSON.parse(localStorage.getItem("org_staff") || "[]");
      const units = JSON.parse(localStorage.getItem("org_units") || "[]");
      const teams = JSON.parse(localStorage.getItem("org_teams") || "[]");
      const unitHeadIds = new Set(units.map(u => u.headId).filter(Boolean));
      const teamHeadIds = new Set(teams.map(t => t.headId).filter(Boolean));
      setPeople(staff.map(s => ({
        id: s.id,
        name: s.name,
        role: unitHeadIds.has(s.id) ? "Unit Head" : teamHeadIds.has(s.id) ? "Team Head" : "Staff",
      })));
    } catch { }
  }, []);
  return people;
}

const SORT_LABELS = {
  "my-order": "My order",
  date: "Date",
  deadline: "Deadline",
  starred: "Starred recently",
  title: "Title",
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

/* ---------------------------------------------------------
   Calendar Component (dark theme, like images)
--------------------------------------------------------- */
const CalendarPicker = ({
  value,
  onChange,
  onClose,
  showTimeRepeat = false,
  onSetTime,
  onSetRepeat,
  onDelete
}: {
  value: any;
  onChange: any;
  onClose: any;
  showTimeRepeat?: boolean;
  onSetTime?: any;
  onSetRepeat?: any;
  onDelete?: any;
}) => {
  const today = new Date();
  const initDate = value ? new Date(value) : today;
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const [selected, setSelected] = useState(value || null);

  const getDays = () => {
    const first = new Date(viewYear, viewMonth, 1);
    const last = new Date(viewYear, viewMonth + 1, 0);
    const startDay = (first.getDay() + 6) % 7; // Monday start
    const days = [];
    for (let i = 0; i < startDay; i++) {
      const d = new Date(viewYear, viewMonth, -startDay + i + 1);
      days.push({ date: d, current: false });
    }
    for (let i = 1; i <= last.getDate(); i++) {
      days.push({ date: new Date(viewYear, viewMonth, i), current: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(viewYear, viewMonth + 1, i), current: false });
    }
    return days;
  };

  const isToday = (d) => {
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  const isSelected = (d) => {
    if (!selected) return false;
    const s = new Date(selected);
    return d.getDate() === s.getDate() && d.getMonth() === s.getMonth() && d.getFullYear() === s.getFullYear();
  };

  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="bg-[#1E2228] rounded-2xl p-4 w-72 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-white text-sm font-medium">{MONTHS[viewMonth]} {viewYear}</span>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="text-gray-400 hover:text-white p-1">
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <button onClick={nextMonth} className="text-gray-400 hover:text-white p-1">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-xs text-gray-500 py-1">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-y-1">
        {getDays().map((item, i) => {
          const sel = isSelected(item.date);
          const tod = isToday(item.date);
          return (
            <button
              key={i}
              onClick={() => {
                if (!item.current) return;
                const f = fmt(item.date);
                setSelected(f);
              }}
              className={`text-xs py-1.5 rounded-full transition-colors mx-auto w-8 h-8 flex items-center justify-center
                ${!item.current ? 'text-gray-600 cursor-default' : 'cursor-pointer'}
                ${sel ? 'bg-white/20 text-white ring-1 ring-white/40' : ''}
                ${tod && !sel ? 'ring-1 ring-blue-400 text-blue-300' : ''}
                ${item.current && !sel && !tod ? 'text-gray-200 hover:bg-white/10' : ''}
              `}
            >
              {item.date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Optional: Set time / Repeat */}
      {showTimeRepeat && (
        <div className="mt-4 space-y-0.5 border-t border-white/10 pt-3">
          <button onClick={onSetTime} className="w-full flex items-center gap-3 px-1 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5">
            <Clock size={16} className="text-gray-500" />
            Set time
          </button>
          <button onClick={onSetRepeat} className="w-full flex items-center gap-3 px-1 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5">
            <RefreshCw size={16} className="text-gray-500" />
            Repeat
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-2 border-t border-white/10">
        {onDelete ? (
          <button onClick={onDelete} className="text-gray-500 hover:text-red-400 p-1">
            <Trash2 size={16} />
          </button>
        ) : <div />}
        <div className="flex gap-3">
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5">Cancel</button>
          <button
            onClick={() => { if (selected) onChange(selected); onClose(); }}
            className="text-sm text-[#1E2228] bg-blue-300 hover:bg-blue-200 px-4 py-1.5 rounded-full font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------
   Time Picker Modal
--------------------------------------------------------- */
const TimePickerModal = ({ value, onChange, onClose }) => {
  const [time, setTime] = useState(value || "09:00");
  return (
    <div className="bg-[#1E2228] rounded-2xl p-5 w-64 shadow-2xl">
      <h3 className="text-white text-sm font-medium mb-4">Set time</h3>
      <input
        type="time"
        value={time}
        onChange={e => setTime(e.target.value)}
        className="w-full bg-white/10 text-white text-center text-xl rounded-lg py-3 focus:outline-none focus:ring-1 focus:ring-blue-400 border border-white/10"
      />
      <div className="flex gap-3 mt-4 justify-end">
        <button onClick={onClose} className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5">Cancel</button>
        <button onClick={() => { onChange(time); onClose(); }} className="text-sm text-[#1E2228] bg-blue-300 hover:bg-blue-200 px-4 py-1.5 rounded-full font-medium">Done</button>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------
   Repeat Modal (image 3 style)
--------------------------------------------------------- */
const RepeatModal = ({ value, onClose, onChange }) => {
  const [interval, setInterval] = useState(value?.interval || 1);
  const [unit, setUnit] = useState(value?.unit || "day");
  const [endsType, setEndsType] = useState(value?.endsType || "never");
  const [endsOnDate, setEndsOnDate] = useState(value?.endsOnDate || "13 July");
  const [endsAfter, setEndsAfter] = useState(value?.endsAfter || 30);
  const [showEndCal, setShowEndCal] = useState(false);

  const today = new Date();
  const startLabel = `${today.getDate()} ${MONTHS[today.getMonth()]}`;

  return (
    <div className="bg-[#1E2228] rounded-2xl p-5 w-72 shadow-2xl">
      <h3 className="text-white text-sm font-semibold mb-4">Repeats every</h3>

      <div className="flex gap-2 mb-4">
        <input
          type="number"
          min={1}
          value={interval}
          onChange={e => setInterval(Number(e.target.value))}
          className="w-16 bg-white/10 text-white text-center rounded-lg py-2 text-sm focus:outline-none border border-white/10"
        />
        <select
          value={unit}
          onChange={e => setUnit(e.target.value)}
          className="flex-1 bg-white/10 text-white rounded-lg py-2 px-3 text-sm focus:outline-none border border-white/10 appearance-none"
        >
          <option value="day" className="bg-[#1E2228]">day</option>
          <option value="week" className="bg-[#1E2228]">week</option>
          <option value="month" className="bg-[#1E2228]">month</option>
          <option value="year" className="bg-[#1E2228]">year</option>
        </select>
      </div>

      <button className="w-full bg-white/10 text-gray-300 text-sm rounded-lg py-2.5 px-3 text-left mb-4 hover:bg-white/15 border border-white/5">
        Set time
      </button>

      <div className="mb-1">
        <p className="text-gray-400 text-xs mb-2">Starts</p>
        <div className="bg-white/10 text-gray-200 text-sm rounded-lg py-2.5 px-3 border border-white/5">{startLabel}</div>
      </div>

      <div className="mt-4">
        <p className="text-gray-400 text-xs mb-2">Ends</p>
        <div className="space-y-2">
          {/* Never */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setEndsType("never")}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${endsType === "never" ? "border-blue-400 bg-blue-400" : "border-gray-500"}`}
            >
              {endsType === "never" && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <span className="text-gray-200 text-sm">Never</span>
          </label>

          {/* On date */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setEndsType("on")}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${endsType === "on" ? "border-blue-400 bg-blue-400" : "border-gray-500"}`}
            >
              {endsType === "on" && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <span className="text-gray-200 text-sm">On</span>
            {endsType === "on" && (
              <button
                onClick={() => setShowEndCal(!showEndCal)}
                className="ml-auto bg-white/10 text-gray-300 text-sm rounded-lg py-1 px-3 hover:bg-white/15"
              >
                {endsOnDate}
              </button>
            )}
            {endsType !== "on" && (
              <span className="ml-auto text-gray-600 text-sm">13 July</span>
            )}
          </label>

          {/* After occurrences */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setEndsType("after")}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${endsType === "after" ? "border-blue-400 bg-blue-400" : "border-gray-500"}`}
            >
              {endsType === "after" && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <span className="text-gray-200 text-sm">After</span>
            {endsType === "after" ? (
              <>
                <input
                  type="number"
                  min={1}
                  value={endsAfter}
                  onChange={e => setEndsAfter(Number(e.target.value))}
                  className="w-16 bg-white/10 text-white text-center rounded-lg py-1 text-sm focus:outline-none border border-white/10 ml-auto"
                />
                <span className="text-gray-400 text-sm">occurrences</span>
              </>
            ) : (
              <span className="ml-auto text-gray-600 text-sm">30 occurrences</span>
            )}
          </label>
        </div>
      </div>

      <div className="flex gap-3 mt-5 justify-end">
        <button onClick={onClose} className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5">Cancel</button>
        <button
          onClick={() => {
            onChange({ interval, unit, endsType, endsOnDate, endsAfter });
            onClose();
          }}
          className="text-sm text-[#1E2228] bg-blue-300 hover:bg-blue-200 px-4 py-1.5 rounded-full font-medium"
        >
          Done
        </button>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------
   Small shared pieces
--------------------------------------------------------- */
const Overlay = ({ onClose }) => (
  <div className="fixed inset-0 z-40" onClick={onClose} />
);

const MenuItem = ({
  icon: Icon,
  children,
  onClick,
  danger,
  disabled,
  sub
}: {
  icon?: any;
  children: React.ReactNode;
  onClick?: (e: any) => void;
  danger?: boolean;
  disabled?: boolean;
  sub?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-start gap-3 px-3 py-2 text-sm text-left transition-colors ${disabled
      ? "text-gray-300 cursor-not-allowed"
      : danger
        ? "text-red-600 hover:bg-red-50"
        : "text-gray-700 hover:bg-gray-50"
      }`}
  >
    {Icon && <Icon size={16} className="mt-0.5 flex-shrink-0" />}
    <span className="flex-1">
      {children}
      {sub && <span className="block text-[11px] text-gray-300 mt-0.5">{sub}</span>}
    </span>
  </button>
);

const ListPicker = ({ lists, currentListId, onPick, onNewList }) => {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  return (
    <div className="py-1">
      {lists.map((l) => (
        <button
          key={l.id}
          onClick={() => onPick(l.id)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 text-left text-gray-700"
        >
          <span className="w-4 flex-shrink-0">
            {l.id === currentListId && <Check size={14} className="text-emerald-500" />}
          </span>
          <span className="truncate">{l.name}</span>
        </button>
      ))}
      <div className="border-t border-gray-100 mt-1 pt-1">
        {creating ? (
          <div className="px-3 py-1.5">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  onNewList(name.trim());
                  setName("");
                  setCreating(false);
                }
              }}
              placeholder="List name"
              className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 text-left text-gray-600"
          >
            <ListPlus size={15} /> New list
          </button>
        )}
      </div>
    </div>
  );
};

const AssignChip = ({ assign, onRemove }) => {
  if (!assign) return null;
  const cfg = ASSIGN_PALETTE.find((a) => a.type === assign.type);
  const Icon = cfg?.icon || UserIcon;
  return (
    <span className={`inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full text-xs font-medium border ${ASSIGN_COLORS[assign.type]}`}>
      <Icon size={12} />
      {assign.name}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 rounded-full hover:bg-black/10 p-0.5">
          <X size={11} />
        </button>
      )}
    </span>
  );
};

/* Format due label for display */
const formatDueLabel = (task) => {
  if (!task.dueDate && !task.due) return null;
  if (task.due === "today") return "Today";
  if (task.due === "tomorrow") return "Tomorrow";
  if (task.dueDate) {
    const d = new Date(task.dueDate);
    return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  }
  return null;
};

/* ---------------------------------------------------------
   App
--------------------------------------------------------- */
function App() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orgPeople = useOrgPeople();
  const [openAssignFor, setOpenAssignFor] = useState(null);
  const [openAttFor, setOpenAttFor] = useState(null);
  const [attachmentPreviews, setAttachmentPreviews] = useState({});
  const [lists, setLists] = useState(initialLists);
  const [collapsedCompleted, setCollapsedCompleted] = useState({});
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [openListMenu, setOpenListMenu] = useState(null);
  const [openTaskMenu, setOpenTaskMenu] = useState(null);
  const [openMovePicker, setOpenMovePicker] = useState(null);
  const [renamingListId, setRenamingListId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [newSubtaskInputs, setNewSubtaskInputs] = useState({});
  const [addingList, setAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");

  useEffect(() => {
    if (searchParams.get("newList") === "1") {
      setAddingList(true);
      router.replace("/task");
    }
  }, [searchParams]);

  // Modal states
  const [calendarFor, setCalendarFor] = useState(null); // taskId
  const [editDeadlineFor, setEditDeadlineFor] = useState(null);
  const [timeFor, setTimeFor] = useState(null);
  const [repeatFor, setRepeatFor] = useState(null);
  // Tomorrow double-click tracking
  const [tomorrowClickCount, setTomorrowClickCount] = useState({}); // taskId -> count

  const dragData = (() => {
    if (typeof window === "undefined") return { current: null };
    if (!(window as any).__taskDrag) (window as any).__taskDrag = { current: null };
    return (window as any).__taskDrag;
  })();
  const [dragOverTarget, setDragOverTarget] = useState(null);

  /* ----------------- generic deep helpers ----------------- */
  const findTaskEverywhere = (taskId) => {
    for (const l of lists) {
      for (const t of l.tasks) {
        if (t.id === taskId) return { task: t, listId: l.id, parentId: null };
        const s = t.subtasks.find((s) => s.id === taskId);
        if (s) return { task: s, listId: l.id, parentId: t.id };
      }
    }
    return null;
  };

  const updateTaskEverywhere = (taskId, updater) => {
    setLists((prev) =>
      prev.map((l) => ({
        ...l,
        tasks: l.tasks.map((t) => {
          if (t.id === taskId) return updater(t);
          return { ...t, subtasks: t.subtasks.map((s) => (s.id === taskId ? updater(s) : s)) };
        }),
      }))
    );
  };

  const removeTaskEverywhere = (taskId) => {
    setLists((prev) =>
      prev.map((l) => ({
        ...l,
        tasks: l.tasks
          .filter((t) => t.id !== taskId)
          .map((t) => ({ ...t, subtasks: t.subtasks.filter((s) => s.id !== taskId) })),
      }))
    );
  };

  const removeTaskFromTree = (allLists, listId, taskId, parentId) =>
    allLists.map((l) => {
      if (l.id !== listId) return l;
      if (!parentId) return { ...l, tasks: l.tasks.filter((t) => t.id !== taskId) };
      return {
        ...l,
        tasks: l.tasks.map((t) =>
          t.id === parentId ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== taskId) } : t
        ),
      };
    });

  /* ----------------- task actions ----------------- */
  const toggleComplete = (taskId) => {
    const found = findTaskEverywhere(taskId);
    if (!found) return;
    const wasCompleted = found.task.completed;
    // If completing a main task that has incomplete subtasks, promote them
    if (!wasCompleted && !found.parentId) {
      const incompleteSubtasks = (found.task.subtasks || []).filter((s) => !s.completed);
      if (incompleteSubtasks.length > 0) {
        setLists((prev) =>
          prev.map((l) => {
            if (l.id !== found.listId) return l;
            return {
              ...l,
              tasks: [
                ...l.tasks.map((t) =>
                  t.id === taskId
                    ? { ...t, completed: true, subtasks: t.subtasks.filter((s) => s.completed) }
                    : t
                ),
                ...incompleteSubtasks,
              ],
            };
          })
        );
        return;
      }
    }
    updateTaskEverywhere(taskId, (t) => ({ ...t, completed: !t.completed }));
  };

  const toggleStar = (taskId) =>
    updateTaskEverywhere(taskId, (t) => ({ ...t, starred: !t.starred }));

  const setTitle = (taskId, title) =>
    updateTaskEverywhere(taskId, (t) => ({ ...t, title }));

  const setDetails = (taskId, details) =>
    updateTaskEverywhere(taskId, (t) => ({ ...t, details }));

  const setDue = (taskId, value) =>
    updateTaskEverywhere(taskId, (t) => ({ ...t, due: value }));

  const setDueDate = (taskId, dateStr) => {
    updateTaskEverywhere(taskId, (t) => ({ ...t, dueDate: dateStr }));
    setTomorrowClickCount(p => ({ ...p, [taskId]: 0 }));
  };

  const setDueTime = (taskId, time) =>
    updateTaskEverywhere(taskId, (t) => ({ ...t, dueTime: time }));

  const setRepeat = (taskId, repeat) =>
    updateTaskEverywhere(taskId, (t) => ({ ...t, repeat }));

  const clearDue = (taskId) =>
    updateTaskEverywhere(taskId, (t) => ({ ...t, due: null, dueDate: null, dueTime: null, repeat: null }));

  const setAssign = (taskId, assign) =>
    updateTaskEverywhere(taskId, (t) => ({ ...t, assign }));

  const deleteTaskById = (taskId) => removeTaskEverywhere(taskId);

  const closeEditing = () => {
    if (editingTaskId) {
      const found = findTaskEverywhere(editingTaskId);
      if (found && !found.task.title.trim()) deleteTaskById(editingTaskId);
    }
    setEditingTaskId(null);
    setCalendarFor(null);
    setEditDeadlineFor(null);
    setTimeFor(null);
    setRepeatFor(null);
  };

  const addTaskToList = (listId) => {
    const t = newTask("");
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, tasks: [...l.tasks, t] } : l))
    );
    setEditingTaskId(t.id);
  };

  const addSubtask = (parentId) => {
    const title = (newSubtaskInputs[parentId] || "").trim();
    if (!title) return;
    updateTaskEverywhere(parentId, (t) => ({ ...t, subtasks: [...t.subtasks, newTask(title)] }));
    setNewSubtaskInputs((p) => ({ ...p, [parentId]: "" }));
  };

  const moveTaskToList = (taskId, parentId, targetListId) => {
    const found = findTaskEverywhere(taskId);
    if (!found) return;
    const task = { ...found.task, subtasks: found.task.subtasks || [] };
    setLists((prev) => {
      let next = removeTaskFromTree(prev, found.listId, taskId, found.parentId);
      next = next.map((l) => (l.id === targetListId ? { ...l, tasks: [...l.tasks, task] } : l));
      return next;
    });
    setOpenTaskMenu(null);
    setOpenMovePicker(null);
  };

  const moveTaskToNewList = (taskId, parentId, newListNameVal) => {
    const id = uid();
    setLists((prev) => [...prev, { id, name: newListNameVal, sortBy: "deadline", tasks: [] }]);
    setTimeout(() => moveTaskToList(taskId, parentId, id), 0);
  };

  /* Handle Tomorrow pill logic */
  const handleTomorrowClick = (taskId, currentTask) => {
    const count = tomorrowClickCount[taskId] || 0;
    if (count === 0) {
      // First click: set tomorrow, hide today
      setDue(taskId, "tomorrow");
      setTomorrowClickCount(p => ({ ...p, [taskId]: 1 }));
    } else {
      // Second click: open calendar like image 4 shows repeat cycle
      setCalendarFor(taskId);
      setTomorrowClickCount(p => ({ ...p, [taskId]: 0 }));
    }
  };

  const handleTodayClick = (taskId, currentTask) => {
    if (currentTask.due === "today") {
      // Clear
      setDue(taskId, null);
    } else {
      setDue(taskId, "today");
      setTomorrowClickCount(p => ({ ...p, [taskId]: 0 }));
    }
  };

  /* ----------------- list actions ----------------- */
  const updateList = (listId, fn) =>
    setLists((prev) => prev.map((l) => (l.id === listId ? fn(l) : l)));

  const setSortBy = (listId, value) => {
    updateList(listId, (l) => ({ ...l, sortBy: value }));
    setOpenListMenu(null);
  };

  const startRename = (list) => {
    setRenamingListId(list.id);
    setRenameValue(list.name);
    setOpenListMenu(null);
  };

  const commitRename = (listId) => {
    const name = renameValue.trim();
    if (name) updateList(listId, (l) => ({ ...l, name }));
    setRenamingListId(null);
  };

  const deleteList = (listId) => {
    if (lists[0]?.id === listId) return;
    setLists((prev) => prev.filter((l) => l.id !== listId));
    setOpenListMenu(null);
  };

  const deleteAllCompleted = (listId) => {
    updateList(listId, (l) => ({
      ...l,
      tasks: l.tasks
        .filter((t) => !t.completed)
        .map((t) => ({ ...t, subtasks: t.subtasks.filter((s) => !s.completed) })),
    }));
    setOpenListMenu(null);
  };

  const addList = () => {
    const name = newListName.trim();
    if (!name) return;
    setLists((prev) => [...prev, { id: uid(), name, sortBy: "deadline", tasks: [] }]);
    setNewListName("");
    setAddingList(false);
  };

  const toggleCompletedSection = (listId) =>
    setCollapsedCompleted((p) => ({ ...p, [listId]: !p[listId] }));

  /* ----------------- drag & drop ----------------- */
  const onDragStartTask = (e, listId, taskId, parentId) => {
    dragData.current = { kind: "task", listId, taskId, parentId };
    e.dataTransfer.effectAllowed = "move";
    e.stopPropagation();
  };
  const onDragStartList = (e, listId) => {
    dragData.current = { kind: "list", listId };
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragStartAssign = (e, assignType, name) => {
    dragData.current = { kind: "assign", assignType, name };
    e.dataTransfer.effectAllowed = "copy";
  };
  const onDragEnd = () => {
    dragData.current = null;
    setDragOverTarget(null);
  };

  const dropOnList = (e, listId) => {
    e.preventDefault();
    e.stopPropagation();
    const d = dragData.current;
    setDragOverTarget(null);
    if (!d || d.kind !== "task") return;
    const found = findTaskEverywhere(d.taskId);
    if (!found) return;
    // no-op: already a top-level task in this same list
    if (!found.parentId && found.listId === listId) return;
    const task = { ...found.task, subtasks: found.parentId ? [] : (found.task.subtasks || []) };
    setLists((prev) => {
      let next = removeTaskFromTree(prev, found.listId, d.taskId, found.parentId);
      next = next.map((l) => (l.id === listId ? { ...l, tasks: [...l.tasks, task] } : l));
      return next;
    });
    dragData.current = null;
  };

  const dropOnTask = (e, listId, targetTaskId) => {
    e.preventDefault();
    e.stopPropagation();
    const d = dragData.current;
    setDragOverTarget(null);
    if (!d || d.kind !== "task" || d.taskId === targetTaskId) return;
    const found = findTaskEverywhere(d.taskId);
    if (!found) return;
    // don't make a task its own subtask via circular drop
    const targetFound = findTaskEverywhere(targetTaskId);
    if (!targetFound) return;
    const task = { ...found.task, subtasks: [] };
    setLists((prev) => {
      let next = removeTaskFromTree(prev, found.listId, d.taskId, found.parentId);
      next = next.map((l) =>
        l.id === listId
          ? { ...l, tasks: l.tasks.map((t) => t.id === targetTaskId ? { ...t, subtasks: [...t.subtasks, task] } : t) }
          : l
      );
      return next;
    });
    dragData.current = null;
  };

  const dropOnListHeader = (e, targetListId) => {
    e.preventDefault();
    e.stopPropagation();
    const d = dragData.current;
    setDragOverTarget(null);
    if (!d || d.kind !== "list" || d.listId === targetListId) return;
    setLists((prev) => {
      const next = [...prev];
      const fromIdx = next.findIndex((l) => l.id === d.listId);
      const toIdx = next.findIndex((l) => l.id === targetListId);
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    dragData.current = null;
  };

  const dropAssign = (e, taskId) => {
    e.preventDefault();
    e.stopPropagation();
    const d = dragData.current;
    setDragOverTarget(null);
    if (!d || d.kind !== "assign") return;
    setAssign(taskId, { type: d.assignType, name: d.name });
    dragData.current = null;
  };

  /* promote subtask to main task in same list */
  const promoteToMainTask = (taskId, parentId, listId) => {
    const found = findTaskEverywhere(taskId);
    if (!found) return;
    const task = { ...found.task, subtasks: found.task.subtasks || [] };
    setLists((prev) => {
      let next = removeTaskFromTree(prev, listId, taskId, parentId);
      next = next.map((l) => (l.id === listId ? { ...l, tasks: [...l.tasks, task] } : l));
      return next;
    });
  };

  const indentTask = (taskId, listId) => {
    setLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l;
        const idx = l.tasks.findIndex((t) => t.id === taskId);
        if (idx <= 0) return l;
        const taskToIndent = l.tasks[idx];
        const newParent = l.tasks[idx - 1];
        if (newParent.completed) return l;
        const updatedTasks = l.tasks
          .filter((_, i) => i !== idx)
          .map((t) =>
            t.id === newParent.id
              ? { ...t, subtasks: [...t.subtasks, { ...taskToIndent, subtasks: [] }] }
              : t
          );
        return { ...l, tasks: updatedTasks };
      })
    );
    setOpenTaskMenu(null);
  };

  /* Get task for modal operations */
  const getTask = (taskId) => findTaskEverywhere(taskId)?.task;

  /* ----------------- render task row ----------------- */
  const TaskRow = ({ list, task: taskProp, parentId, depth = 0 }) => {
    const task = findTaskEverywhere(taskProp.id)?.task || taskProp;
    const isEditing = editingTaskId === task.id;
    const isDragOver = dragOverTarget?.kind === "task-target" && dragOverTarget.id === task.id;
    const tomorrowCount = tomorrowClickCount[task.id] || 0;
    const hasDue = task.due || task.dueDate;
    const dueLabel = formatDueLabel(task);

    /* Due pills logic:
       - If tomorrow clicked once: show only Tomorrow (Today hidden)
       - Otherwise show both Today and Tomorrow
    */
    const showTodayPill = tomorrowCount === 0;
    const showDueBadge = task.dueDate || (task.due !== "today" && task.due !== "tomorrow" && task.due);

    if (isEditing) {
      return (
        <div className={depth > 0 ? "ml-8 mt-0.5" : "mt-0.5"} onClick={(e) => e.stopPropagation()}>
          <div className="rounded-lg bg-[#F0F2F5] border border-[#E7F8F1] px-3 py-2.5">
            <div className="flex items-start gap-2">
              {depth === 0 && (
                <span className="mt-1.5 text-gray-300 flex-shrink-0">
                  <GripVertical size={16} />
                </span>
              )}
              <button onClick={() => toggleComplete(task.id)} className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-emerald-500">
                {task.completed ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Circle size={20} />}
              </button>
              <input
                autoFocus
                onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
                value={task.title}
                onChange={(e) => setTitle(task.id, e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                placeholder="Title"
                className={`flex-1 text-sm bg-transparent focus:outline-none border-b border-emerald-500 pb-0.5 ${task.completed ? "text-gray-400 line-through" : "text-gray-800"
                  }`}
              />
              {depth === 0 && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleStar(task.id)} className="text-gray-400 hover:text-amber-500">
                    <Star size={16} className={task.starred ? "fill-amber-400 text-amber-400" : ""} />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setOpenTaskMenu(openTaskMenu === task.id ? null : task.id)}
                      className="text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openTaskMenu === task.id && (
                      <>
                        <Overlay onClose={() => setOpenTaskMenu(null)} />
                        <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1">
                          <MenuItem icon={Target} onClick={() => { setCalendarFor(task.id); setOpenTaskMenu(null); }}>
                            Add deadline
                          </MenuItem>
                          <MenuItem icon={CornerDownRight} onClick={() => indentTask(task.id, list.id)}>
                            Indent
                          </MenuItem>
                          <MenuItem icon={CornerDownRight} onClick={() => {
                            setOpenTaskMenu(null);
                            setNewSubtaskInputs(p => ({ ...p, [task.id]: "" }));
                          }}>
                            Add a subtask
                          </MenuItem>
                          <MenuItem icon={Paperclip} onClick={() => { setOpenTaskMenu(null); document.getElementById(`att-input-${task.id}`)?.click(); }}>
                            Add attachment
                          </MenuItem>
                          <input id={`att-input-${task.id}`} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const url = URL.createObjectURL(file);
                              const attachment = { id: uid(), name: file.name, url, type: file.type };
                              const tid = task.id;
                              updateTaskEverywhere(tid, (t) => ({ ...t, attachments: [...(t.attachments || []), attachment] }));
                              setEditingTaskId(tid);
                              e.target.value = "";
                            }}
                          />
                          <MenuItem icon={Trash2} danger onClick={() => { deleteTaskById(task.id); setOpenTaskMenu(null); }}>
                            Delete
                          </MenuItem>
                          <div className="border-t border-gray-100 my-1" />
                          <ListPicker
                            lists={lists}
                            currentListId={list.id}
                            onPick={(toId) => moveTaskToList(task.id, parentId, toId)}
                            onNewList={(name) => moveTaskToNewList(task.id, parentId, name)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="ml-9 mt-2 space-y-3">

              {/* Due date row */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Today pill - show only if today is selected OR neither is selected */}
                  {(task.due === "today" || !task.due) && (
                    <button
                      onClick={() => handleTodayClick(task.id, task)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${task.due === "today"
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-emerald-500 hover:text-emerald-500"
                        }`}
                    >
                      Today
                    </button>
                  )}

                  {/* Tomorrow pill - show only if tomorrow is selected OR neither is selected */}
                  {(task.due === "tomorrow" || !task.due) && (
                    <button
                      onClick={() => handleTomorrowClick(task.id, task)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${task.due === "tomorrow"
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-emerald-500 hover:text-emerald-500"
                        }`}
                    >
                      Tomorrow
                    </button>
                  )}

                  {/* Deadline date badge (only when specific date picked from calendar) */}
                  {task.dueDate ? (
                    <button
                      onClick={() => setEditDeadlineFor(task.id)}
                      className="px-2 py-1 rounded-full text-xs font-medium border bg-emerald-500 text-white border-emerald-500 flex items-center gap-1"
                    >
                      <Clock size={12} />
                      {(() => { const d = new Date(task.dueDate); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; })()}
                      {task.dueTime && ` · ${task.dueTime}`}
                    </button>
                  ) : (
                    <button
                      onClick={() => setCalendarFor(task.id)}
                      className="p-1.5 rounded-full border bg-white text-gray-500 border-gray-200 hover:border-emerald-500 hover:text-emerald-500 transition-colors"
                      title="Pick a date"
                    >
                      <Clock size={14} />
                    </button>
                  )}

                  {/* Repeat button (next to clock) */}
                  <button
                    onClick={() => setRepeatFor(task.id)}
                    className={`p-1.5 rounded-full border transition-colors ${task.repeat
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-white text-gray-500 border-gray-200 hover:border-emerald-500 hover:text-emerald-500"
                      }`}
                    title="Repeat"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

                {depth === 0 && (
                  <div className="relative">

                    {openMovePicker === task.id && (
                      <>
                        <Overlay onClose={() => setOpenMovePicker(null)} />
                        <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                          <p className="px-3 pt-2 pb-1 text-xs text-gray-400">Move to list</p>
                          <ListPicker
                            lists={lists}
                            currentListId={list.id}
                            onPick={(toId) => moveTaskToList(task.id, parentId, toId)}
                            onNewList={(name) => moveTaskToNewList(task.id, parentId, name)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Details editable field */}
              <input
                type="text"
                value={task.details}
                onChange={(e) => setDetails(task.id, e.target.value)}
                placeholder="Add details..."
                className="w-full text-sm bg-transparent focus:outline-none border-b border-gray-200 focus:border-emerald-500 pb-0.5 text-gray-600 placeholder-gray-300"
              />

              {/* Assign dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenAssignFor(openAssignFor === task.id ? null : task.id)}
                  className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 w-full transition-colors ${openAssignFor === task.id ? "border-emerald-500 bg-emerald-50" : "border-dashed border-gray-200 hover:border-emerald-400"
                    }`}
                >
                  <span className="text-xs text-gray-400 flex-shrink-0">Assign to</span>
                  {task.assign ? (
                    <span className={`inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-full text-xs font-medium border ${ASSIGN_COLORS[task.assign.role] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                      {task.assign.name}
                      <span className="text-[10px] opacity-60">{task.assign.role}</span>
                      <button onClick={(e) => { e.stopPropagation(); setAssign(task.id, null); }} className="ml-0.5 rounded-full hover:bg-black/10 p-0.5"><X size={11} /></button>
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">Select a person</span>
                  )}
                </button>

                {openAssignFor === task.id && (
                  <>
                    <Overlay onClose={() => setOpenAssignFor(null)} />
                    <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                      {orgPeople.length === 0 ? (
                        <p className="px-3 py-3 text-xs text-gray-400 italic">No staff found. Add staff first.</p>
                      ) : (
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }} className="py-1">
                          {orgPeople.map(p => (
                            <button key={p.id}
                              onClick={() => { setAssign(task.id, { name: p.name, role: p.role }); setOpenAssignFor(null); }}
                              className="w-full flex items-center justify-between px-3 py-2 hover:bg-emerald-50 transition-colors"
                            >
                              <span className="text-xs font-medium text-gray-800">{p.name}</span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ASSIGN_COLORS[p.role]}`}>{p.role}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Attachments badge below assign */}
              {(task.attachments || []).length > 0 && (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenAttFor(openAttFor === task.id ? null : task.id); }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors text-[11px] font-medium"
                  >
                    <Paperclip size={11} />
                    {task.attachments.length} attachment{task.attachments.length > 1 ? "s" : ""}
                  </button>
                  {openAttFor === task.id && (
                    <>
                      <Overlay onClose={() => setOpenAttFor(null)} />
                      <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                        <div className="max-h-40 overflow-y-auto py-1">
                          {task.attachments.map(att => (
                            <div key={att.id} className="relative group/att">
                              <a href={att.url} target="_blank" rel="noreferrer"
                                className="flex items-center gap-2 px-3 py-2 pr-7 hover:bg-emerald-50 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Paperclip size={11} className="text-gray-400 shrink-0" />
                                <span className="text-xs text-gray-700 truncate">{att.name}</span>
                              </a>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateTaskEverywhere(task.id, (t) => ({ ...t, attachments: (t.attachments || []).filter(a => a.id !== att.id) }));
                                }}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 text-white rounded-full hidden group-hover/att:flex items-center justify-center"
                              >
                                <X size={9} />
                              </button>
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

    /* Non-editing row */
    return (
      <div className={depth > 0 ? "ml-8 mt-0.5" : ""}>
        <div
          draggable={!task.completed}
          onDragStart={(e) => onDragStartTask(e, list.id, task.id, parentId)}
          onDragEnd={onDragEnd}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (dragData.current?.kind === "task" && depth === 0)
              setDragOverTarget({ kind: "task-target", id: task.id });
          }}
          onDrop={(e) => {
            const d = dragData.current;
            if (d?.kind === "assign") dropAssign(e, task.id);
            else if (depth === 0) dropOnTask(e, list.id, task.id);
          }}
          onClick={(e) => {
            e.stopPropagation();
            setEditingTaskId(task.id);
          }}
          className={`group flex items-start gap-2.5 rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${isDragOver ? "bg-emerald-50 ring-1 ring-emerald-500" : "hover:bg-[#F0F2F5]"
            }`}
        >
          <div className="w-[18px] h-[18px] shrink-0 mt-0.5">
            <button
              onClick={(e) => { e.stopPropagation(); toggleComplete(task.id); }}
              className="text-gray-300 hover:text-emerald-500 transition-colors"
            >
              {task.completed
                ? <CheckCircle2 size={18} className="text-emerald-500" />
                : <Circle size={18} />}
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <p className={`text-[13px] leading-snug ${task.completed ? "text-gray-400 line-through" : "text-gray-800 font-medium"}`}>
              {task.title}
            </p>
            {(task.due || task.dueDate || task.assign || task.subtasks?.length > 0 || task.details || task.attachments?.length > 0) && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {task.details && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 flex items-center gap-1">
                    <AlignLeft size={11} /> Details
                  </span>
                )}
                {(task.due || task.dueDate) && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize flex items-center gap-1">
                    <Clock size={10} />
                    {dueLabel}
                    {task.dueTime && ` · ${task.dueTime}`}
                    {task.repeat && <RefreshCw size={10} />}
                  </span>
                )}
                {task.attachments?.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenAttFor(openAttFor === task.id ? null : task.id); }}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center gap-1 hover:bg-blue-100 transition-colors"
                    >
                      <Paperclip size={10} />
                      {task.attachments.length}
                    </button>
                    {openAttFor === task.id && (
                      <>
                        <Overlay onClose={() => setOpenAttFor(null)} />
                        <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                          {task.attachments.map(att => (
                            <a key={att.id} href={att.url} target="_blank" rel="noreferrer"
                              className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Paperclip size={11} className="text-gray-400 shrink-0" />
                              <span className="text-xs text-gray-700 truncate">{att.name}</span>
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
              <button
                onClick={(e) => { e.stopPropagation(); toggleStar(task.id); }}
                className={`p-0.5 transition-opacity ${task.starred ? "opacity-100 text-amber-400" : "opacity-0 group-hover:opacity-100 text-gray-400 hover:text-amber-500"
                  }`}
              >
                <Star size={15} className={task.starred ? "fill-amber-400" : ""} />
              </button>
            )}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setOpenTaskMenu(openTaskMenu === task.id ? null : task.id); }}
                className="p-0.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity"
              >
                <MoreVertical size={15} />
              </button>
              {openTaskMenu === task.id && (
                <>
                  <Overlay onClose={() => setOpenTaskMenu(null)} />
                  <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1" onClick={(e) => e.stopPropagation()}>
                    {depth === 0 ? (
                      <>
                        <MenuItem icon={Target} onClick={() => { setCalendarFor(task.id); setOpenTaskMenu(null); }}>
                          Add deadline
                        </MenuItem>
                        <MenuItem icon={CornerDownRight} onClick={(e) => {
                          e.stopPropagation();
                          const sub = newTask("");
                          updateTaskEverywhere(task.id, (t) => ({ ...t, subtasks: [...t.subtasks, sub] }));
                          setEditingTaskId(sub.id);
                          setOpenTaskMenu(null);
                        }}>
                          Add a subtask
                        </MenuItem>
                        <MenuItem icon={Paperclip} onClick={() => { setOpenTaskMenu(null); document.getElementById(`att-input-non-${task.id}`)?.click(); }}>
                          Add attachment
                        </MenuItem>
                        <input id={`att-input-non-${task.id}`} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = URL.createObjectURL(file);
                            const attachment = { id: uid(), name: file.name, url, type: file.type };
                            updateTaskEverywhere(task.id, (t) => ({ ...t, attachments: [...(t.attachments || []), attachment] }));
                            e.target.value = "";
                          }}
                        />
                        <MenuItem icon={Trash2} danger onClick={() => { deleteTaskById(task.id); setOpenTaskMenu(null); }}>
                          Delete
                        </MenuItem>
                        <div className="border-t border-gray-100 my-1" />
                        <ListPicker
                          lists={lists}
                          currentListId={list.id}
                          onPick={(toId) => moveTaskToList(task.id, parentId, toId)}
                          onNewList={(name) => moveTaskToNewList(task.id, parentId, name)}
                        />
                      </>
                    ) : (
                      <>
                        <MenuItem icon={ArrowLeftRight} onClick={() => { promoteToMainTask(task.id, parentId, list.id); setOpenTaskMenu(null); }}>
                          Make main task
                        </MenuItem>
                        <MenuItem icon={Trash2} danger onClick={() => { deleteTaskById(task.id); setOpenTaskMenu(null); }}>
                          Delete
                        </MenuItem>
                        <div className="border-t border-gray-100 my-1" />
                        <ListPicker
                          lists={lists}
                          currentListId={list.id}
                          onPick={(toId) => moveTaskToList(task.id, parentId, toId)}
                          onNewList={(name) => moveTaskToNewList(task.id, parentId, name)}
                        />
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
            {task.subtasks
              .filter((s) => task.completed ? s.completed : !s.completed)
              .map((sub) => (
                <TaskRow key={sub.id} list={list} task={sub} parentId={task.id} depth={1} />
              ))}
          </div>
        )}
      </div>
    );
  };

  /* ----------------- grouping & sorting ----------------- */
  const getActiveGroups = (list) => {
    const active = list.tasks.filter((t) => !t.completed);
    if (list.sortBy === "title") {
      return [{ label: null, tasks: [...active].sort((a, b) => a.title.localeCompare(b.title)) }];
    }
    if (list.sortBy === "date") {
      return [{ label: null, tasks: [...active].sort((a, b) => a.createdAt - b.createdAt) }];
    }
    if (list.sortBy === "starred") {
      return [{ label: null, tasks: [...active].sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0)) }];
    }
    if (list.sortBy === "my-order") {
      return [{ label: null, tasks: active }];
    }
    const today = active.filter((t) => t.due === "today");
    const tomorrow = active.filter((t) => t.due === "tomorrow");
    const later = active.filter((t) => t.dueDate && t.due !== "today" && t.due !== "tomorrow");
    const none = active.filter((t) => !t.due && !t.dueDate);
    const groups = [];
    if (today.length) groups.push({ label: "Today", tasks: today });
    if (tomorrow.length) groups.push({ label: "Tomorrow", tasks: tomorrow });
    if (later.length) groups.push({ label: "Later", tasks: later });
    if (none.length || groups.length === 0) groups.push({ tasks: none });
    return groups;
  };

  const completedTasks = (list) => list.tasks.filter((t) => t.completed);

  /* Get task currently in calendar modal */
  const calTask = calendarFor ? getTask(calendarFor) : null;
  const editTask = editDeadlineFor ? getTask(editDeadlineFor) : null;

  /* ----------------- main render ----------------- */
  return (
    <div className="min-h-screen w-full bg-[#f8fafc]" onClick={closeEditing}>
      {/* Header */}
      <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between shadow-md sticky top-0 z-20">
        <div>
          <h1 className="text-sm font-semibold">Tasks</h1>
          <p className="text-[11px] opacity-80 mt-0.5">Manage your lists, tasks and subtasks</p>
        </div>
      </div>

      <div className="p-5 flex gap-4 overflow-x-auto items-start min-h-[calc(100vh-72px)]">
        {lists.map((list) => (
          <div
            key={list.id}
            onClick={closeEditing}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragData.current?.kind === "task") setDragOverTarget({ kind: "list-target", id: list.id });
            }}
            onDrop={(e) => dropOnList(e, list.id)}
            className={`w-[300px] flex-shrink-0 rounded-xl flex flex-col shadow-sm transition-all ${dragOverTarget?.kind === "list-target" && dragOverTarget.id === list.id
              ? "ring-2 ring-emerald-500 bg-emerald-50"
              : "bg-white"
              }`}
          >
            {/* List header */}
            <div
              draggable
              onDragStart={(e) => onDragStartList(e, list.id)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => dropOnListHeader(e, list.id)}
              className="flex items-center gap-2 px-4 py-3 bg-emerald-50 rounded-t-xl cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={15} className="text-white/50" />
              {renamingListId === list.id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => commitRename(list.id)}
                  onKeyDown={(e) => e.key === "Enter" && commitRename(list.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 text-sm font-semibold text-emerald-700 bg-transparent border-b border-white/50 focus:outline-none placeholder-white/50"
                />
              ) : (
                <h2 className="text-sm font-semibold  text-emerald-700 flex-1 truncate">{list.name}</h2>
              )}
              <span className="text-xs text-emerald-700 px-1.5 py-0.5 rounded-full">
                {list.tasks.filter((t) => !t.completed).length}
              </span>
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenListMenu(openListMenu === list.id ? null : list.id); }}
                  className=" text-emerald-700 hover:text-white p-0.5 transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
                {openListMenu === list.id && (
                  <>
                    <Overlay onClose={() => setOpenListMenu(null)} />
                    <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                      <p className="px-3 pt-2 pb-1 text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Sort by</p>
                      {Object.entries(SORT_LABELS).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setSortBy(list.id, key)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-[#F0F2F5] text-left text-gray-700"
                        >
                          <span className="w-4">{list.sortBy === key && <Check size={13} className="text-emerald-500" />}</span>
                          {label}
                        </button>
                      ))}
                      <div className="border-t border-gray-100 my-1" />
                      <MenuItem icon={Pencil} onClick={() => startRename(list)}>Rename list</MenuItem>
                      <div className="border-t border-gray-100 my-1" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Add task button */}
            <button
              onClick={(e) => { e.stopPropagation(); addTaskToList(list.id); }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-500 hover:bg-[#F0F2F5] transition-colors border-b border-gray-100"
            >
              <CirclePlus size={17} />
              Add a task
            </button>

            {/* Task list */}
            <div className="px-2 pb-2 pt-1 space-y-1">
              {getActiveGroups(list).map(
                (group, gi) =>
                  (group.tasks.length > 0 || group.label) && (
                    <div key={gi}>
                      {group.label && (
                        <p className="px-2 pt-2 pb-1 text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">{group.label}</p>
                      )}
                      <div className="space-y-1">
                        {group.tasks.map((task) => (
                          <TaskRow key={task.id} list={list} task={task} parentId={null} />
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>

            {/* Completed */}
            {completedTasks(list).length > 0 && (
              <div className="px-2 pb-3 border-t border-gray-100 pt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleCompletedSection(list.id); }}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-400 w-full hover:text-emerald-600 transition-colors"
                >
                  {collapsedCompleted[list.id] ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                  Completed ({completedTasks(list).length})
                </button>
                {!collapsedCompleted[list.id] && (
                  <div className="space-y-1">
                    {completedTasks(list).map((task) => (
                      <TaskRow key={task.id} list={list} task={task} parentId={null} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New list modal */}
      {addingList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setAddingList(false); setNewListName(""); }}>
          <div className="bg-white rounded-xl shadow-xl p-5 w-80 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-gray-800">Create new list</h3>
            <input
              autoFocus
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addList()}
              placeholder="List name"
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setAddingList(false); setNewListName(""); }} className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={addList} className="px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-500 text-white hover:bg-[#008f72] transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ MODALS ============ */}

      {/* Add deadline calendar (image 6 style) */}
      {calendarFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setCalendarFor(null)}>
          <div onClick={e => e.stopPropagation()}>
            <CalendarPicker
              value={calTask?.dueDate || null}
              showTimeRepeat={true}
              onSetTime={() => { setTimeFor(calendarFor); setCalendarFor(null); }}
              onSetRepeat={() => { setRepeatFor(calendarFor); setCalendarFor(null); }}
              onChange={(dateStr) => {
                setDueDate(calendarFor, dateStr);
                setTomorrowClickCount(p => ({ ...p, [calendarFor]: 0 }));
              }}
              onClose={() => setCalendarFor(null)}
            />
          </div>
        </div>
      )}

      {/* Edit deadline calendar */}
      {editDeadlineFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditDeadlineFor(null)}>
          <div onClick={e => e.stopPropagation()}>
            <CalendarPicker
              value={editTask?.dueDate || null}
              showTimeRepeat={true}
              onSetTime={() => { setTimeFor(editDeadlineFor); setEditDeadlineFor(null); }}
              onSetRepeat={() => { setRepeatFor(editDeadlineFor); setEditDeadlineFor(null); }}
              onChange={(dateStr) => setDueDate(editDeadlineFor, dateStr)}
              onDelete={() => { clearDue(editDeadlineFor); setEditDeadlineFor(null); }}
              onClose={() => setEditDeadlineFor(null)}
            />
          </div>
        </div>
      )}

      {/* Time picker modal */}
      {timeFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setTimeFor(null)}>
          <div onClick={e => e.stopPropagation()}>
            <TimePickerModal
              value={getTask(timeFor)?.dueTime}
              onChange={(t) => setDueTime(timeFor, t)}
              onClose={() => setTimeFor(null)}
            />
          </div>
        </div>
      )}

      {/* Repeat modal (image 3) */}
      {repeatFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setRepeatFor(null)}>
          <div onClick={e => e.stopPropagation()}>
            <RepeatModal
              value={getTask(repeatFor)?.repeat}
              onChange={(r) => setRepeat(repeatFor, r)}
              onClose={() => setRepeatFor(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function TaskPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#1E2228] text-white">Loading...</div>}>
      <App />
    </Suspense>
  );
}