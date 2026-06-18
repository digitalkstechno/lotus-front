"use client";

import React, { Suspense, useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTasks } from "../task/hooks/useTasks";
import { TaskRow } from "../task/components/TaskRow";
import { CalendarPicker, TimePickerModal, RepeatModal } from "../task/components/Modals";
import { fetchListsByUser, resetLists } from "../../redux/slices/listSlice";
import { getStarredTasksByUserApi } from "../../services/taskService";
import { Star, CirclePlus } from "lucide-react";
import { store } from "../../redux/store";

// ── Helper: map backend task → frontend task shape ────────────────────────────
function mapTask(t: any) {
  return {
    ...t,
    id: t._id || t.id,
    completed: t.status === "Completed" || false,
    starred: t.isStarred || false,
    details: t.description || "",
    date: t.date || null,
    dueDate: t.deadline || null,
    dueTime: t.dueTime || null,
    attachments: Array.isArray(t.file) ? t.file.map((f: string, idx: number) => ({
      id: `att-${t._id}-${idx}`,
      name: f.split("/").pop() || f,
      url: `${process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:5000"}/${f}`,
      type: "unknown",
      rawPath: f,
    })) : [],
    assign: t.assigned_to_user ? {
      id: t.assigned_to_user._id || t.assigned_to_user.id,
      name: t.assigned_to_user.name || t.assigned_to_user.fullName,
      role: t.assigned_to_user.role === "unit_head" ? "Unit Head"
        : t.assigned_to_user.role === "team_head" ? "Team Head"
        : t.assigned_to_user.role === "admin" ? "Admin" : "Staff",
    } : null,
    subtasks: Array.isArray(t.subtask) ? t.subtask.map((s: any) => ({
      ...s,
      id: s._id || s.id,
      completed: s.status === "Completed" || false,
      starred: s.isStarred || false,
      details: s.description || "",
      date: s.date || null,
      dueDate: s.deadline || null,
      attachments: [],
    })) : [],
    // keep original list info
    listId: t.list?._id || t.list?.id || t.list || null,
    listName: t.list?.name || null,
  };
}

// ── Starred page content ──────────────────────────────────────────────────────
function StarredContent() {
  const dispatch = useDispatch();
  const authUser = useSelector((state: any) => state.auth.user);

  let userId = authUser?._id;
  if (!userId && typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("token");
      if (token) userId = JSON.parse(atob(token.split(".")[1]))?.id;
    } catch (e) {}
  }

  // ── useTasks for all interactive controls (modals, toggles, etc.) ──────────
  const {
    lists,
    calendarFor, setCalendarFor,
    editDeadlineFor, setEditDeadlineFor,
    timeFor, setTimeFor,
    repeatFor, setRepeatFor,
    setDueDateAndTime, setDueTime, setRepeat, clearDue,
    getTask, setTomorrowClickCount, setDate,
    addStarredTaskToList,
    closeEditing, editingTaskId, setLists, findTaskEverywhere,
    fetchTasksForCurrentList, moveTaskToList,
    loadMoreLists, hasMore, loadingLists,
  } = useTasks() as any;

  // ── Fetch all lists (for list picker in the task card) ────────────────────
  useEffect(() => {
    if (userId) {
      dispatch(resetLists());
      dispatch(fetchListsByUser({ userId, page: 1, limit: 50, isChecked: true }) as any);
    }
  }, [userId, dispatch]);

  // ── Local starred tasks state (flat, from dedicated API) ──────────────────
  const [starredTasks, setStarredTasks] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingStarred, setLoadingStarred] = useState(false);
  const LIMIT = 20;

  const loadStarredPage = useCallback(async (p: number) => {
    if (!userId) return;
    setLoadingStarred(true);
    try {
      const res = await getStarredTasksByUserApi(userId, p, LIMIT);
      const resData = res.data;
      const raw: any[] = resData?.data || resData || [];
      const mapped = raw.map(mapTask);

      // Inject fetched tasks into Redux lists so useTasks functions (like setTitle, toggleComplete) work on them
      setLists((prevLists: any[]) => {
        const newLists = [...prevLists];
        mapped.forEach(t => {
          const listIdx = newLists.findIndex(l => l.id === t.listId);
          if (listIdx !== -1) {
            const exists = newLists[listIdx].tasks.find((xt: any) => xt.id === t.id);
            if (!exists) {
              newLists[listIdx] = {
                ...newLists[listIdx],
                tasks: [...newLists[listIdx].tasks, t]
              };
            } else {
              // Update existing
              newLists[listIdx] = {
                ...newLists[listIdx],
                tasks: newLists[listIdx].tasks.map((xt: any) => xt.id === t.id ? t : xt)
              };
            }
          }
        });
        return newLists;
      });

      setStarredTasks(prev => p === 1 ? mapped : [...prev, ...mapped]);
      const pg = resData?.pagination || {};
      setTotalPages(pg.totalPages || 1);
      setPage(p);
    } catch (e) {
      console.error("Failed to fetch starred tasks", e);
    } finally {
      setLoadingStarred(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    if (userId) loadStarredPage(1);
  }, [userId]);

  // ── When a task is updated via useTasks hooks (toggle star, toggle complete,
  //    etc.), reflect it in our local starredTasks list ──────────────────────
  // We watch lists in redux — if a task changes isStarred, refresh.
  const prevListsRef = useRef<any[]>([]);
  useEffect(() => {
    // If redux list tasks changed, sync our local tasks
    const currentListsStr = JSON.stringify(lists.map((l: any) => l.tasks));
    const prevStr = JSON.stringify(prevListsRef.current.map((l: any) => l.tasks));
    if (currentListsStr !== prevStr) {
      prevListsRef.current = lists;
      
      // Get all valid starred tasks from Redux
      const allReduxStarredTasks = lists.flatMap((l: any) => 
        l.tasks.filter((t: any) => (t.starred || t.isStarred) && t.id.length >= 24)
        .map((t: any) => ({ ...t, listId: l.id, listName: l.name }))
      );

      setStarredTasks(prev => {
        // Update existing tasks with any changes from Redux
        const next = prev.map(t => {
           const found = allReduxStarredTasks.find((rt: any) => rt.id === t.id || rt._id === t.id);
           return found ? { ...t, ...found } : t;
        });
        
        // Find tasks in Redux that are NOT in local starredTasks (i.e., newly created)
        const newTasks = allReduxStarredTasks.filter((rt: any) => !next.some(t => t.id === rt.id || t.id === rt._id));
        
        // Remove un-starred tasks, prepend newly created tasks
        return [...newTasks, ...next].filter(t => t.starred || t.isStarred);
      });
    }
  }, [lists]);

  // Build a "virtual" list object per task (so TaskRow works properly)
  // TaskRow expects { id, name, tasks, taskPagination } as `list`
  const getVirtualList = (task: any) => {
    // Find the real redux list if it exists (for move-to-list etc.)
    const realList = lists.find((l: any) => l.id === task.listId);
    return realList || {
      id: task.listId || "__starred__",
      name: task.listName || "Unknown List",
      tasks: starredTasks,
      taskPagination: { currentPage: 1, totalPages: 1, hasMore: false, loading: false },
    };
  };

  // ── Track pending new starred task ────────────────────────────────────────
  const [pendingStarredTaskId, setPendingStarredTaskId] = useState<string | null>(null);
  const [pendingListId, setPendingListId] = useState<string | null>(null);

  const handleAddStarred = () => {
    const listId = lists[0]?.id;
    if (!listId) return;
    const taskId = addStarredTaskToList(listId);
    if (taskId) {
      setPendingStarredTaskId(taskId);
      setPendingListId(listId);
    }
  };

  // When editingTaskId clears, reset pending state
  useEffect(() => {
    if (!editingTaskId && pendingStarredTaskId) {
      setPendingStarredTaskId(null);
      setPendingListId(null);
    }
  }, [editingTaskId]);

  // ── List change from within the task card (pending task & existing tasks) ────
  const handleListChange = (newListId: string, newListName: string, taskId: string) => {
    // 1. If it's the pending task, track its new list
    if (taskId === pendingStarredTaskId) {
      setPendingListId(newListId);
    }

    // 2. Delegate Redux moving and API call to useTasks
    moveTaskToList(taskId, null, newListId);

    // 3. Update local state immediately so UI re-renders correctly without waiting for useEffect
    setStarredTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, listId: newListId, listName: newListName } : t
    ));
  };

  // ── Infinite scroll for starred tasks ────────────────────────────────────
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && page < totalPages && !loadingStarred) {
        loadStarredPage(page + 1);
      }
    });
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [page, totalPages, loadingStarred, loadStarredPage]);

  // ── Get pending task from redux (to render in the panel) ──────────────────
  const getPendingTask = () => {
    if (!pendingStarredTaskId || !pendingListId) return null;
    const pList = lists.find((l: any) => l.id === pendingListId);
    if (!pList) return null;
    const pTask = pList.tasks.find((t: any) => t.id === pendingStarredTaskId);
    return pTask ? { task: pTask, list: pList } : null;
  };
  const pendingEntry = getPendingTask();

  return (
    <div className="min-h-screen w-full bg-[#f8fafc]" onClick={closeEditing}>
      {/* ── Header ── */}
      <div className="bg-emerald-700 text-white px-6 py-4 flex items-center gap-3 shadow-md sticky top-0 z-20">
        <Star size={16} className="fill-amber-300 text-amber-300 flex-shrink-0" />
        <div>
          <h1 className="text-sm font-semibold">Starred Tasks</h1>
          <p className="text-[11px] opacity-80 mt-0.5">All your starred tasks in one place</p>
        </div>
      </div>

      <div className="p-5 max-w-2xl mx-auto">
        {/* ── Main card (flat task list, like Google Tasks) ── */}
        <div
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Card header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-gray-700">Starred tasks</span>
            <span className="ml-auto text-[11px] text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 font-medium">
              {starredTasks.length}
            </span>
          </div>

          {/* Add button */}
          <div className="px-4 py-3 border-b border-gray-100">
            <button
              onClick={handleAddStarred}
              disabled={lists.length === 0}
              className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <CirclePlus size={16} />
              Add a starred task
            </button>
          </div>

          {/* Pending new task — inline in the main card with list picker at bottom */}
          {pendingEntry && (
            <div className="px-2 pt-1">
              <TaskRow
                list={pendingEntry.list}
                task={pendingEntry.task}
                parentId={null}
                onListChange={handleListChange}
              />
            </div>
          )}

          {/* Loading */}
          {loadingStarred && starredTasks.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-emerald-500 text-sm">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                Loading...
              </div>
            </div>
          )}

          {/* Starred recently label */}
          {starredTasks.length > 0 && (
            <div className="px-4 py-2">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Starred recently
              </span>
            </div>
          )}

          {/* Flat task list — each TaskRow knows its list via virtual list object */}
          <div className="px-2 pb-2 space-y-0.5">
            {starredTasks
              .filter(t => t.id !== pendingStarredTaskId) // don't double-render pending
              .map((task: any) => {
                const vList = getVirtualList(task);
                return (
                  <TaskRow
                    key={task.id}
                    list={vList}
                    task={task}
                    parentId={null}
                    onListChange={handleListChange}
                  />
                );
              })}
          </div>

          {/* Load more spinner */}
          {loadingStarred && starredTasks.length > 0 && (
            <div className="flex justify-center py-3">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* ── Empty state ── */}
        {!loadingStarred && starredTasks.length === 0 && !pendingEntry && (
          <div className="flex flex-col items-center justify-center py-16 px-6 mt-4">
            <div className="w-24 h-24 mb-5">
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
            <h3 className="text-gray-800 font-semibold text-base mb-2">No starred tasks</h3>
            <p className="text-gray-400 text-sm text-center leading-relaxed">
              Mark tasks with ★ to find them here,
              <br />
              or click &ldquo;Add a starred task&rdquo; above.
            </p>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-2" />
      </div>

      {/* ── MODALS (same as /task) ── */}
      {calendarFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setCalendarFor(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <CalendarPicker
              value={getTask(calendarFor)?.date || null}
              showTimeRepeat={false}
              onChange={(dateStr: string) => {
                setDate(calendarFor, dateStr);
                setTomorrowClickCount((p: any) => ({ ...p, [calendarFor]: 0 }));
              }}
              onClose={() => setCalendarFor(null)}
            />
          </div>
        </div>
      )}

      {editDeadlineFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditDeadlineFor(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <CalendarPicker
              value={getTask(editDeadlineFor)?.dueDate || null}
              showTimeRepeat={false}
              onChange={(dateStr: string, timeStr?: string | null) => {
                setDueDateAndTime(editDeadlineFor, dateStr, timeStr);
              }}
              onDelete={() => { clearDue(editDeadlineFor); setEditDeadlineFor(null); }}
              onClose={() => setEditDeadlineFor(null)}
            />
          </div>
        </div>
      )}

      {timeFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setTimeFor(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <TimePickerModal
              value={getTask(timeFor)?.dueTime}
              onChange={(t: string) => setDueTime(timeFor, t)}
              onClose={() => setTimeFor(null)}
            />
          </div>
        </div>
      )}

      {repeatFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setRepeatFor(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <RepeatModal
              value={getTask(repeatFor)?.repeat}
              onChange={(repeatData: any) => {
                setRepeat(repeatFor, { enabled: true, ...repeatData });
              }}
              onClose={() => setRepeatFor(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function StarredPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        </div>
      }
    >
      <StarredContent />
    </Suspense>
  );
}
