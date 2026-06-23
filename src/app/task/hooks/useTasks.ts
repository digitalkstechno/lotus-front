import { useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { uid, newTask } from "../lib/utils";
import { useOrgPeople } from "../hooks/useOrgPeople";
import {
  fetchTasksByUser,
  setTasksLocally,
  resetTasks,
} from "../../../redux/slices/taskSlice";
import { getRankBetween } from "../lib/lexoRank";
import * as uiActions from "../../../redux/slices/taskUISlice";
import { store } from "../../../redux/store";
import {
  createTaskApi,
  updateTaskApi,
  uploadTaskFilesApi,
  removeTaskAttachmentApi,
  deleteTaskApi,
  reorderTasksApi,
} from "../../../services/taskService";

export class MutableItem {
  id: string;
  _chosen: boolean = false;
  _selected: boolean = false;
  _filtered: boolean = false;
  [key: string]: any;

  constructor(data: any) {
    this.id = data.id;
    for (const key in data) {
      this[key] = data[key];
    }
  }

  get chosen() { return this._chosen; }
  set chosen(val) { this._chosen = val; }
  get selected() { return this._selected; }
  set selected(val) { this._selected = val; }
  get filtered() { return this._filtered; }
  set filtered(val) { this._filtered = val; }
}

export const makeMutable = (arr: any[]) => {
  if (!arr) return [];
  return JSON.parse(JSON.stringify(arr)).map(
    (item: any) => new MutableItem(item),
  );
};

export const unmakeMutable = (arr: any[]) => {
  if (!arr) return [];
  return JSON.parse(JSON.stringify(arr));
};

export const useTasks = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { people: orgPeople, fetchPeople, loading: loadingPeople } = useOrgPeople();

  const authUser = useSelector((state: any) => state.auth.user);
  let userId = authUser?._id;
  if (!userId && typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("token");
      if (token) userId = JSON.parse(atob(token.split(".")[1]))?.id;
    } catch (e) {}
  }

  const {
    tasks,
    loading: loadingTasks,
    hasMore,
    currentPage: page,
  } = useSelector((state: any) => state.tasks);
  
  const taskUI = useSelector((state: any) => state.taskUI);

  const {
    openAssignFor,
    openAttFor,
    collapsedCompleted,
    editingTaskId,
    openTaskMenu,
    calendarFor,
    editDeadlineFor,
    timeFor,
    repeatFor,
    tomorrowClickCount,
    dragData,
    dragOverTarget,
  } = taskUI;

  const setOpenAssignFor = (val: string | null) => dispatch(uiActions.setOpenAssignFor(val));
  const setOpenAttFor = (val: string | null) => dispatch(uiActions.setOpenAttFor(val));
  const setEditingTaskId = (val: string | null) => dispatch(uiActions.setEditingTaskId(val));
  const setOpenTaskMenu = (val: string | null) => dispatch(uiActions.setOpenTaskMenu(val));
  const setCalendarFor = (val: string | null) => dispatch(uiActions.setCalendarFor(val));
  const setEditDeadlineFor = (val: string | null) => dispatch(uiActions.setEditDeadlineFor(val));
  const setTimeFor = (val: string | null) => dispatch(uiActions.setTimeFor(val));
  const setRepeatFor = (val: string | null) => dispatch(uiActions.setRepeatFor(val));
  const setDragOverTarget = (val: any) => dispatch(uiActions.setDragOverTarget(val));
  const setNewSubtaskInputs = (updater: any) => {};
  const setTomorrowClickCount = (updater: any) => {};
  const setCollapsedCompleted = (updater: any) => {};

  const dragDataRef = useRef<any>(null);

  const fetchTasks = useCallback((page = 1, sortBy?: string, isStarred?: boolean) => {
    if (userId) {
      if (page === 1) {
         dispatch(resetTasks());
      }
      dispatch(fetchTasksByUser({ userId, page, limit: 20, sortBy, isStarred }) as any);
    }
  }, [userId, dispatch]);

  const loadMoreTasks = useCallback(() => {
    if (!loadingTasks && hasMore) {
      fetchTasks(page + 1, "my-order");
    }
  }, [loadingTasks, hasMore, page, fetchTasks]);

  const setTasks = (updater: any) => {
    const currentTasks = store.getState().tasks.tasks;
    const nextTasks = typeof updater === "function" ? updater(currentTasks) : updater;
    dispatch(setTasksLocally(nextTasks));
  };

  const findTaskEverywhere = (taskId: string, tasksData = tasks) => {
    for (const t of tasksData) {
      if (t.id === taskId) return { task: t, parentId: null };
      const s = t.subtasks?.find((sub: any) => sub.id === taskId);
      if (s) return { task: s, parentId: t.id };
    }
    return null;
  };

  const updateTaskEverywhere = (taskId: string, updater: (t: any) => any) => {
    setTasks((prev: any) =>
      prev.map((t: any) => {
        if (t.id === taskId) return updater(t);
        return {
          ...t,
          subtasks: t.subtasks?.map((s: any) => (s.id === taskId ? updater(s) : s)) || [],
        };
      })
    );
  };

  const removeTaskEverywhere = (taskId: string) => {
    setTasks((prev: any) =>
      prev.filter((t: any) => t.id !== taskId).map((t: any) => ({
        ...t,
        subtasks: t.subtasks?.filter((s: any) => s.id !== taskId) || [],
      }))
    );
  };

  const syncToBackend = (taskId: string, payload: any) => {
    if (taskId.length < 24) return;
    const currentTasks = store.getState().tasks.tasks;
    const found = findTaskEverywhere(taskId, currentTasks);
    if (found && !(found.task as any).isNew) {
      updateTaskApi(taskId, payload).catch(console.error);
    }
  };

  const parseDateString = (val: string | null | undefined) => {
    if (!val) return null;
    if (val === "today") return new Date().toISOString();
    if (val === "tomorrow") {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString();
    }
    return val;
  };

  const toggleComplete = (taskId: string) => {
    const currentTasks = store.getState().tasks.tasks;
    const found = findTaskEverywhere(taskId, currentTasks);
    if (!found) return;
    const wasCompleted = found.task.completed;
    if (!wasCompleted && !found.parentId) {
      setTasks((prev: any) =>
        prev.map((t: any) =>
          t.id === taskId
            ? { ...t, completed: true, subtasks: t.subtasks?.map((s: any) => ({ ...s, completed: true })) || [] }
            : t
        )
      );
    } else {
      updateTaskEverywhere(taskId, (t) => ({ ...t, completed: !t.completed }));
    }
    syncToBackend(taskId, { status: !wasCompleted ? "Completed" : "Pending" });
  };

  const toggleStar = (taskId: string) =>
    updateTaskEverywhere(taskId, (t) => {
      const newVal = !t.starred;
      syncToBackend(taskId, { isStarred: newVal });
      return { ...t, starred: newVal };
    });

  const setTitle = (taskId: string, title: string) =>
    updateTaskEverywhere(taskId, (t) => ({ ...t, title }));
  const setDetails = (taskId: string, details: string) =>
    updateTaskEverywhere(taskId, (t) => ({ ...t, details }));
  const setDate = (taskId: string, value: string | null) =>
    updateTaskEverywhere(taskId, (t) => {
      let dateStr = null;
      if (value === "today") dateStr = new Date().toISOString();
      else if (value === "tomorrow") {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        dateStr = d.toISOString();
      }
      syncToBackend(taskId, { date: dateStr });
      return { ...t, date: value };
    });

  const setDueDate = (taskId: string, dateStr: string | null) => {
    updateTaskEverywhere(taskId, (t) => {
      let finalDate = dateStr;
      if (dateStr && t.dueTime) {
        const [h, m] = t.dueTime.split(":");
        const d = new Date(dateStr);
        d.setHours(Number(h), Number(m), 0, 0);
        finalDate = d.toISOString();
      }
      syncToBackend(taskId, { deadline: finalDate });
      return { ...t, dueDate: finalDate };
    });
    dispatch(uiActions.resetTomorrowClick(taskId));
  };

  const setDueDateAndTime = (taskId: string, dateStr: string, timeStr: string | null | undefined) => {
    updateTaskEverywhere(taskId, (t) => {
      let finalDate = dateStr;
      const timeToUse = timeStr !== undefined ? timeStr : t.dueTime;
      if (dateStr && timeToUse) {
        const [h, m] = timeToUse.split(":");
        const d = new Date(dateStr);
        d.setHours(Number(h), Number(m), 0, 0);
        finalDate = d.toISOString();
      }
      syncToBackend(taskId, { deadline: finalDate, isTime: !!timeToUse });
      return { ...t, dueDate: finalDate, dueTime: timeToUse };
    });
    dispatch(uiActions.resetTomorrowClick(taskId));
  };

  const setDueTime = (taskId: string, time: string | null) =>
    updateTaskEverywhere(taskId, (t) => {
      let finalDate = t.dueDate || new Date().toISOString();
      if (time) {
        const [h, m] = time.split(":");
        const d = new Date(finalDate);
        d.setHours(Number(h), Number(m), 0, 0);
        finalDate = d.toISOString();
      }
      syncToBackend(taskId, { isTime: !!time, deadline: finalDate });
      return { ...t, dueTime: time, dueDate: finalDate };
    });

  const setRepeat = (taskId: string, repeat: any) =>
    updateTaskEverywhere(taskId, (t) => {
      syncToBackend(taskId, { repeat });
      return { ...t, repeat };
    });

  const clearDue = (taskId: string) =>
    updateTaskEverywhere(taskId, (t) => {
      syncToBackend(taskId, { deadline: null });
      return { ...t, dueDate: null, dueTime: null };
    });

  const setAssign = (taskId: string, assign: any) =>
    updateTaskEverywhere(taskId, (t) => {
      syncToBackend(taskId, { assigned_to_user: assign?.id || null });
      return { ...t, assign };
    });

  const deleteTaskById = async (taskId: string) => {
    if (taskId.length >= 24) {
      try {
        await deleteTaskApi(taskId);
      } catch (err) {
        console.error("Failed to delete task", err);
      }
    }
    removeTaskEverywhere(taskId);
  };

  const closeEditing = async () => {
    const currentTasks = store.getState().tasks.tasks;
    if (editingTaskId) {
      const found = findTaskEverywhere(editingTaskId, currentTasks);
      if (found) {
        if (!found.task.title.trim()) {
          deleteTaskById(editingTaskId);
        } else if ((found.task as any).isNew && authUser) {
          const payload = {
            title: found.task.title,
            description: found.task.details || "",
            date: parseDateString(found.task.date),
            deadline: found.task.dueDate || null,
            dueTime: found.task.dueTime || null,
            assigned_to_user: found.task.assign?.id || null,
            parent_id: found.parentId || null,
            assigned_by: authUser._id || authUser.id,
            isStarred: found.task.starred || false,
            repeat: found.task.repeat || { enabled: false },
            rank: found.task.rank || undefined,
          };
          updateTaskEverywhere(editingTaskId, (t) => ({ ...t, isNew: false }));
          try {
            const res = await createTaskApi(payload);
            const createdTask = res.data;
            if (createdTask && createdTask._id) {
              updateTaskEverywhere(editingTaskId, (t) => ({
                ...t,
                id: createdTask._id,
                _id: createdTask._id,
                rank: createdTask.rank || t.rank,
              }));
            }
          } catch (err) {
            console.error("Failed to create task", err);
          }
        } else {
          if (editingTaskId.length < 24) {
            dispatch(uiActions.closeAllEditing());
            return;
          }
          try {
            await updateTaskApi(editingTaskId, {
              title: found.task.title,
              description: found.task.details || "",
            });
          } catch (err) {
            console.error("Failed to update task text", err);
          }
        }
      }
    }
    dispatch(uiActions.closeAllEditing());
  };

  const uploadTaskAttachment = async (taskId: string, file: File, tempId: string) => {
    let finalTaskId = taskId;
    if (taskId.length < 24) {
      const currentTasks = store.getState().tasks.tasks;
      const found = findTaskEverywhere(taskId, currentTasks);
      if (found && (found.task as any).isNew && authUser) {
        const payload = {
          title: found.task.title || "",
          description: found.task.details || "",
          date: parseDateString(found.task.date),
          assigned_to_user: found.task.assign?.id || null,
          parent_id: found.parentId || null,
          assigned_by: authUser._id || authUser.id,
          isStarred: found.task.starred || false,
          repeat: found.task.repeat || { enabled: false },
          order: found.task.order || 0,
        };
        try {
          const res = await createTaskApi(payload);
          const createdTask = res.data;
          if (createdTask && createdTask._id) {
            finalTaskId = createdTask._id;
            updateTaskEverywhere(taskId, (t: any) => ({
              ...t, id: createdTask._id, _id: createdTask._id, isNew: false, rank: createdTask.rank || t.rank,
            }));
          } else {
            throw new Error("Failed to create task before uploading");
          }
        } catch (err) {
          console.error("Failed to auto-save task", err);
          updateTaskEverywhere(taskId, (t: any) => ({
            ...t, attachments: (t.attachments || []).filter((a: any) => a.id !== tempId),
          }));
          return;
        }
      } else {
        updateTaskEverywhere(taskId, (t: any) => ({
          ...t, attachments: (t.attachments || []).filter((a: any) => a.id !== tempId),
        }));
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("files", file);
      const res = await uploadTaskFilesApi(finalTaskId, formData);
      const updatedTask = res.data?.data;
      if (updatedTask && updatedTask.file) {
        const attachments = updatedTask.file.map((f: string, idx: number) => ({
          id: `att-${updatedTask._id || updatedTask.id}-${idx}`,
          name: f.split("/").pop() || f,
          url: `${process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:5000"}/${f}`,
          type: "unknown",
          rawPath: f,
        }));
        updateTaskEverywhere(finalTaskId, (t: any) => ({ ...t, attachments }));
      }
    } catch (err) {
      console.error("Failed to upload attachment", err);
      updateTaskEverywhere(finalTaskId, (t: any) => ({
        ...t, attachments: (t.attachments || []).filter((a: any) => a.id !== tempId),
      }));
    }
  };

  const removeTaskAttachment = async (taskId: string, att: any) => {
    updateTaskEverywhere(taskId, (t: any) => ({
      ...t, attachments: (t.attachments || []).filter((a: any) => a.id !== att.id),
    }));
    if (!att.rawPath) return;
    try {
      await removeTaskAttachmentApi(taskId, att.rawPath);
    } catch (err) {
      console.error("Failed to remove attachment", err);
    }
  };

  const addTask = () => {
    const title = "";
    const t = newTask(title) as any;
    (t as any).isNew = true;

    let maxOrder = -1;
    const currentTasks = store.getState().tasks.tasks;
    if (currentTasks.length > 0) {
      maxOrder = Math.max(...currentTasks.map((task: any) => task.order || 0));
    }
    t.order = maxOrder + 1;

    if (authUser) {
      const uRole = authUser.role ? authUser.role.toLowerCase() : "";
      t.assign = {
        id: authUser._id || authUser.id,
        name: authUser.fullName || authUser.name,
        role: uRole === "unit_head" ? "Unit Head" : uRole === "team_head" ? "Team Head" : uRole === "admin" ? "Admin" : "Staff",
      };
      t.assignBy = {
        id: authUser._id || authUser.id,
        name: authUser.fullName || authUser.name,
      };
    }

    setTasks((prev: any) => [t, ...prev]);
    setEditingTaskId(t.id);
    setEditDeadlineFor(null);
  };

  const addStarredTask = () => {
    const t = newTask("") as any;
    t.starred = true;
    t.isNew = true;

    let maxOrder = -1;
    const currentTasks = store.getState().tasks.tasks;
    if (currentTasks.length > 0) {
      maxOrder = Math.max(...currentTasks.map((task: any) => task.order || 0));
    }
    t.order = maxOrder + 1;

    if (authUser) {
      const uRole = authUser.role ? authUser.role.toLowerCase() : "";
      t.assign = {
        id: authUser._id || authUser.id,
        name: authUser.fullName || authUser.name,
        role: uRole === "unit_head" ? "Unit Head" : uRole === "team_head" ? "Team Head" : uRole === "admin" ? "Admin" : "Staff",
      };
      t.assignBy = {
        id: authUser._id || authUser.id,
        name: authUser.fullName || authUser.name,
      };
    }

    setTasks((prev: any) => [t, ...prev]);
    setEditingTaskId(t.id);
    setEditDeadlineFor(null);
    return t.id;
  };

  const addSubtask = async (parentId: string) => {
    const currentUI = store.getState().taskUI;
    const title = (currentUI.newSubtaskInputs[parentId] || "").trim();
    if (!title) return;

    const currentTasks = store.getState().tasks.tasks;
    const parentFound = findTaskEverywhere(parentId, currentTasks);
    if (!parentFound) return;

    const tempSubtask = newTask(title);
    updateTaskEverywhere(parentId, (t) => ({
      ...t, subtasks: [tempSubtask, ...(t.subtasks || [])],
    }));
    dispatch(uiActions.setNewSubtaskInput({ parentId, value: "" }));

    try {
      const payload = {
        title,
        parent_id: parentId,
        assigned_to_user: authUser?._id || authUser?.id || null,
      };
      const response = await createTaskApi(payload);
      const createdSubtask = response.data?.data || response.data;

      if (createdSubtask && createdSubtask._id) {
        updateTaskEverywhere(parentId, (t) => {
          const newSubtasks = t.subtasks.map((s: any) =>
            s.id === tempSubtask.id
              ? { ...s, id: createdSubtask._id, _id: createdSubtask._id, rank: createdSubtask.rank || s.rank }
              : s
          );
          return { ...t, subtasks: newSubtasks };
        });
      }
    } catch (err) {
      console.error("Failed to create subtask", err);
    }
  };

  const handleTomorrowClick = (taskId: string, currentTask: any) => {
    const count = store.getState().taskUI.tomorrowClickCount[taskId] || 0;
    if (count === 0) {
      setDate(taskId, "tomorrow");
      dispatch(uiActions.incrementTomorrowClick(taskId));
    } else {
      setCalendarFor(taskId);
      dispatch(uiActions.resetTomorrowClick(taskId));
    }
  };

  const handleTodayClick = (taskId: string, currentTask: any) => {
    if (currentTask.date === "today") {
      setDate(taskId, null);
    } else {
      setDate(taskId, "today");
      dispatch(uiActions.resetTomorrowClick(taskId));
    }
  };

  const deleteAllCompleted = () => {
    setTasks((prev: any) =>
      prev
        .filter((t: any) => !t.completed)
        .map((t: any) => ({
          ...t, subtasks: t.subtasks?.filter((s: any) => !s.completed) || [],
        }))
    );
    setOpenTaskMenu(null);
  };

  const toggleCompletedSection = () => dispatch(uiActions.toggleCollapsedCompleted("default"));

  const handleTaskGroupChange = (parentId: string | null, newItems: any[]) => {
    setTasks((prev: any) => {
      if (!parentId) {
        return newItems.map((item: any) => {
           let existingSubtasks = item.subtasks || [];
           for (const t of prev) {
             if (t.id === item.id) { existingSubtasks = t.subtasks; break; }
             const s = t.subtasks?.find((sub: any) => sub.id === item.id);
             if (s) { existingSubtasks = s.subtasks; break; }
           }
           return { ...item, subtasks: existingSubtasks };
        });
      } else {
        return prev.map((t: any) =>
          t.id === parentId ? { ...t, subtasks: newItems } : t
        );
      }
    });
  };

  const syncSortToBackend = async (taskId: string, payload: any) => {
    if (taskId.length < 24) return;
    try {
      await updateTaskApi(taskId, payload);
    } catch (err) {
      console.error("[DnD] syncSortToBackend FAILED", err);
    }
  };

  const onSortEnd = (evt: any) => {
    const taskId = evt.item?.dataset?.taskId;
    const toWrapper = evt.to?.closest?.("[data-parent-id]");
    const toParentId = toWrapper?.dataset?.parentId || null;

    if (!taskId || taskId.length < 24) return;

    setTimeout(() => {
      const currentTasks = store.getState().tasks.tasks;
      let items: any[];
      if (!toParentId) {
        items = currentTasks.filter((t: any) => !t.completed);
      } else {
        const parent = currentTasks.find((t: any) => t.id === toParentId);
        items = parent?.subtasks || [];
      }

      let newItems = [...items];
      const isAlreadyUpdated = newItems[evt.newIndex]?.id === taskId || newItems[evt.newIndex]?._id === taskId;

      if (!isAlreadyUpdated) {
        const [movedItem] = newItems.splice(evt.oldIndex, 1);
        newItems.splice(evt.newIndex, 0, movedItem);
      }

      const prevItem = newItems[evt.newIndex - 1];
      const nextItem = newItems[evt.newIndex + 1];

      const newRank = getRankBetween(prevItem?.rank, nextItem?.rank);

      syncSortToBackend(taskId, {
        parent_id: toParentId,
        rank: newRank,
      });
    }, 100);
  };

  const dropAssign = (e: any, taskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const d = dragDataRef.current;
    setDragOverTarget(null);
    if (!d || d.kind !== "assign") return;
    setAssign(taskId, { type: d.assignType, name: d.name });
    dragDataRef.current = null;
  };

  const promoteToMainTask = (taskId: string, parentId: string | null) => {
    if (!parentId) return;
    const currentTasks = store.getState().tasks.tasks;
    const found = findTaskEverywhere(taskId, currentTasks);
    if (!found) return;
    
    const task = { ...found.task, subtasks: found.task.subtasks || [] };
    setTasks((prev: any) => {
      // Remove from parent
      const next = prev.map((t: any) => 
        t.id === parentId ? { ...t, subtasks: t.subtasks?.filter((s: any) => s.id !== taskId) || [] } : t
      );
      // Add to root
      return [...next, task];
    });
    setEditingTaskId(null);
    syncToBackend(taskId, { parent_id: null });
  };

  const indentTask = (taskId: string) => {
    setTasks((prev: any) => {
      const idx = prev.findIndex((t: any) => t.id === taskId);
      if (idx <= 0) return prev;
      const prevTask = prev[idx - 1];
      const taskToIndent = prev[idx];
      const newTasks = [...prev];
      newTasks.splice(idx, 1);
      const newOrder = prevTask.subtasks?.length || 0;
      newTasks[idx - 1] = {
        ...prevTask,
        subtasks: [...(prevTask.subtasks || []), taskToIndent],
      };

      syncToBackend(taskId, {
        parent_id: prevTask.id || prevTask._id,
        order: newOrder,
      });
      return newTasks;
    });
    setEditingTaskId(null);
    setOpenTaskMenu(null);
  };

  const getTask = (taskId: string) =>
    findTaskEverywhere(taskId, store.getState().tasks.tasks)?.task;

  return {
    tasks,
    setTasks,
    orgPeople,
    loadingTasks,
    hasMore,
    openAssignFor,
    setOpenAssignFor,
    openAttFor,
    setOpenAttFor,
    collapsedCompleted,
    setCollapsedCompleted,
    editingTaskId,
    setEditingTaskId,
    openTaskMenu,
    setOpenTaskMenu,
    calendarFor,
    setCalendarFor,
    editDeadlineFor,
    setEditDeadlineFor,
    timeFor,
    setTimeFor,
    repeatFor,
    setRepeatFor,
    tomorrowClickCount,
    setTomorrowClickCount,
    dragData: dragDataRef,
    dragOverTarget,
    setDragOverTarget,
    findTaskEverywhere,
    updateTaskEverywhere,
    removeTaskEverywhere,
    toggleComplete,
    toggleStar,
    setTitle,
    setDetails,
    setDate,
    setDueDate,
    setDueTime,
    setDueDateAndTime,
    setRepeat,
    clearDue,
    setAssign,
    deleteTaskById,
    closeEditing,
    uploadTaskAttachment,
    removeTaskAttachment,
    addTask,
    addStarredTask,
    addSubtask,
    handleTomorrowClick,
    handleTodayClick,
    deleteAllCompleted,
    toggleCompletedSection,
    dropAssign,
    promoteToMainTask,
    indentTask,
    getTask,
    fetchTasks,
    loadMoreTasks,
    fetchPeople,
    loadingPeople,
    handleTaskGroupChange,
    onSortEnd,
    makeMutable,
    unmakeMutable,
  };
};
