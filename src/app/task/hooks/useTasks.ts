import { useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { uid, newTask } from "../lib/utils";
import { useOrgPeople } from "../hooks/useOrgPeople";
import { fetchListsByUser, setListsLocally, fetchTasksForList, updateList as updateListThunk } from "../../../redux/slices/listSlice";
import * as uiActions from "../../../redux/slices/taskUISlice";
import { store } from "../../../redux/store";
import axiosInstance from "../../../utils/axios";
import { setCredentials } from "../../../redux/slices/authSlice";
import { createTaskApi, updateTaskApi, uploadTaskFilesApi, removeTaskAttachmentApi, deleteTaskApi } from "../../../services/taskService";

export const useTasks = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { people: orgPeople, fetchPeople, loading: loadingPeople } = useOrgPeople();

  // Redux Selectors
  const authUser = useSelector((state: any) => state.auth.user);

  // Try to get userId from Redux, fallback to token
  let userId = authUser?._id;
  if (!userId && typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("token");
      if (token) userId = JSON.parse(atob(token.split(".")[1]))?.id;
    } catch (e) { }
  }

  const { lists, loading: loadingLists, hasMore, currentPage: page } = useSelector((state: any) => state.lists);
  const taskUI = useSelector((state: any) => state.taskUI);

  // Expose UI state
  const {
    openAssignFor, openAttFor, collapsedCompleted, editingTaskId,
    openListMenu, openTaskMenu, openMovePicker, renamingListId,
    renameValue, newSubtaskInputs, addingList, newListName,
    calendarFor, editDeadlineFor, timeFor, repeatFor,
    tomorrowClickCount, dragData, dragOverTarget
  } = taskUI;

  // UI Dispatchers
  const setOpenAssignFor = (val: string | null) => dispatch(uiActions.setOpenAssignFor(val));
  const setOpenAttFor = (val: string | null) => dispatch(uiActions.setOpenAttFor(val));
  const setEditingTaskId = (val: string | null) => dispatch(uiActions.setEditingTaskId(val));
  const setOpenListMenu = (val: string | null) => dispatch(uiActions.setOpenListMenu(val));
  const setOpenTaskMenu = (val: string | null) => dispatch(uiActions.setOpenTaskMenu(val));
  const setOpenMovePicker = (val: string | null) => dispatch(uiActions.setOpenMovePicker(val));
  const setRenameValue = (val: string) => dispatch(uiActions.setRenameValue(val));
  const setAddingList = (val: boolean) => dispatch(uiActions.setAddingList(val));
  const setNewListName = (val: string) => dispatch(uiActions.setNewListName(val));
  const setCalendarFor = (val: string | null) => dispatch(uiActions.setCalendarFor(val));
  const setEditDeadlineFor = (val: string | null) => dispatch(uiActions.setEditDeadlineFor(val));
  const setTimeFor = (val: string | null) => dispatch(uiActions.setTimeFor(val));
  const setRepeatFor = (val: string | null) => dispatch(uiActions.setRepeatFor(val));
  const setDragOverTarget = (val: any) => dispatch(uiActions.setDragOverTarget(val));
  const setRenamingListId = (val: string | null) => {
    if (val) dispatch(uiActions.startRenameList({ id: val, name: "" }));
    else dispatch(uiActions.clearRenamingList());
  };
  const setNewSubtaskInputs = (updater: any) => {
    // simplified for the scope we need
  };
  const setTomorrowClickCount = (updater: any) => {
    // simplified
  };
  const setCollapsedCompleted = (updater: any) => {
    // simplified
  };

  // The custom dragData ref for instant access
  const dragDataRef = useRef<any>(null);

  const fetchLists = useCallback((pageToFetch: number) => {
    if (userId) dispatch(fetchListsByUser({ userId, page: pageToFetch, limit: 10, isChecked: true }) as any);
  }, [userId, dispatch]);

  const fetchTasksForCurrentList = useCallback((listId: string, pageToFetch: number) => {
    if (userId) {
      const targetList = store.getState().lists.lists.find((l: any) => l.id === listId);
      const sortBy = targetList ? targetList.sortBy : undefined;
      dispatch(fetchTasksForList({ listId, userId, page: pageToFetch, limit: 20, sortBy }) as any);
    }
  }, [userId, dispatch]);

  const loadMoreLists = useCallback(() => {
    if (!loadingLists && hasMore) {
      fetchLists(page + 1);
    }
  }, [loadingLists, hasMore, page, userId, dispatch]);

  // Hydrate authUser if missing but token is present
  useEffect(() => {
    if (!authUser && userId) {
      axiosInstance.get(`/user/${userId}`).then(res => {
        const fetchedUser = res.data?.data;
        if (fetchedUser) {
          dispatch(setCredentials({ user: fetchedUser, token: localStorage.getItem("token") || "" }));
        }
      }).catch(console.error);
    }
  }, [authUser, userId, dispatch]);

  useEffect(() => {
    if (searchParams.get("newList") === "1") {
      setAddingList(true);
      router.replace("/task");
    }
  }, [searchParams, router]);

  // Data Setter Wrapper to avoid stale closures
  const setLists = (updater: any) => {
    const currentLists = store.getState().lists.lists;
    const nextLists = typeof updater === "function" ? updater(currentLists) : updater;
    dispatch(setListsLocally(nextLists));
  };

  // --- generic deep helpers ---
  const findTaskEverywhere = (taskId: string, listsData = lists) => {
    for (const l of listsData) {
      for (const t of l.tasks) {
        if (t.id === taskId) return { task: t, listId: l.id, parentId: null };
        const s = t.subtasks?.find((s: any) => s.id === taskId);
        if (s) return { task: s, listId: l.id, parentId: t.id };
      }
    }
    return null;
  };

  const updateTaskEverywhere = (taskId: string, updater: (t: any) => any) => {
    setLists((prev: any) =>
      prev.map((l: any) => ({
        ...l,
        tasks: l.tasks.map((t: any) => {
          if (t.id === taskId) return updater(t);
          return { ...t, subtasks: t.subtasks?.map((s: any) => (s.id === taskId ? updater(s) : s)) || [] };
        }),
      }))
    );
  };

  const removeTaskEverywhere = (taskId: string) => {
    setLists((prev: any) =>
      prev.map((l: any) => ({
        ...l,
        tasks: l.tasks
          .filter((t: any) => t.id !== taskId)
          .map((t: any) => ({ ...t, subtasks: t.subtasks?.filter((s: any) => s.id !== taskId) || [] })),
      }))
    );
  };

  const removeTaskFromTree = (allLists: any[], listId: string, taskId: string, parentId: string | null) =>
    allLists.map((l) => {
      if (l.id !== listId) return l;
      if (!parentId) return { ...l, tasks: l.tasks.filter((t: any) => t.id !== taskId) };
      return {
        ...l,
        tasks: l.tasks.map((t: any) =>
          t.id === parentId ? { ...t, subtasks: t.subtasks?.filter((s: any) => s.id !== taskId) || [] } : t
        ),
      };
    });

  const syncToBackend = (taskId: string, payload: any) => {
    if (taskId.length < 24) return; // Skip temporary frontend-generated IDs
    const currentLists = store.getState().lists.lists;
    const found = findTaskEverywhere(taskId, currentLists);
    if (found && !(found.task as any).isNew) {
      updateTaskApi(taskId, payload).catch(console.error);
    }
  };

  // --- Actions ---
  const toggleComplete = (taskId: string) => {
    const currentLists = store.getState().lists.lists;
    const found = findTaskEverywhere(taskId, currentLists);
    if (!found) return;
    const wasCompleted = found.task.completed;
    if (!wasCompleted && !found.parentId) {
      const incompleteSubtasks = (found.task.subtasks || []).filter((s: any) => !s.completed);
      if (incompleteSubtasks.length > 0) {
        setLists((prev: any) =>
          prev.map((l: any) => {
            if (l.id !== found.listId) return l;
            return {
              ...l,
              tasks: [
                ...l.tasks.map((t: any) =>
                  t.id === taskId
                    ? { ...t, completed: true, subtasks: t.subtasks.filter((s: any) => s.completed) }
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
    syncToBackend(taskId, { status: !wasCompleted ? "Completed" : "Pending" });
    updateTaskEverywhere(taskId, (t) => ({ ...t, completed: !t.completed }));
  };

  const toggleStar = (taskId: string) => updateTaskEverywhere(taskId, (t) => {
    const newVal = !t.starred;
    syncToBackend(taskId, { isStarred: newVal });
    return { ...t, starred: newVal };
  });
  const setTitle = (taskId: string, title: string) => updateTaskEverywhere(taskId, (t) => ({ ...t, title }));
  const setDetails = (taskId: string, details: string) => updateTaskEverywhere(taskId, (t) => ({ ...t, details }));
  const setDate = (taskId: string, value: string | null) => updateTaskEverywhere(taskId, (t) => {
    let dateStr = null;
    if (value === "today") dateStr = new Date().toISOString();
    else if (value === "tomorrow") {
      const d = new Date(); d.setDate(d.getDate() + 1); dateStr = d.toISOString();
    }
    syncToBackend(taskId, { date: dateStr });
    return { ...t, date: value };
  });
  const setDueDate = (taskId: string, dateStr: string | null) => {
    updateTaskEverywhere(taskId, (t) => {
      let finalDate = dateStr;
      if (dateStr && t.dueTime) {
        const [h, m] = t.dueTime.split(':');
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
        const [h, m] = timeToUse.split(':');
        const d = new Date(dateStr);
        d.setHours(Number(h), Number(m), 0, 0);
        finalDate = d.toISOString();
      }
      syncToBackend(taskId, { deadline: finalDate, isTime: !!timeToUse });
      return { ...t, dueDate: finalDate, dueTime: timeToUse };
    });
    dispatch(uiActions.resetTomorrowClick(taskId));
  };
  const setDueTime = (taskId: string, time: string | null) => updateTaskEverywhere(taskId, (t) => {
    let finalDate = t.dueDate || new Date().toISOString();
    if (time) {
      const [h, m] = time.split(':');
      const d = new Date(finalDate);
      d.setHours(Number(h), Number(m), 0, 0);
      finalDate = d.toISOString();
    }
    syncToBackend(taskId, { isTime: !!time, deadline: finalDate });
    return { ...t, dueTime: time, dueDate: finalDate };
  });
  const setRepeat = (taskId: string, repeat: any) => updateTaskEverywhere(taskId, (t) => {
    syncToBackend(taskId, { repeat });
    return { ...t, repeat };
  });
  const clearDue = (taskId: string) => updateTaskEverywhere(taskId, (t) => {
    syncToBackend(taskId, { deadline: null });
    return { ...t, dueDate: null, dueTime: null };
  });
  const setAssign = (taskId: string, assign: any) => updateTaskEverywhere(taskId, (t) => {
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
    
    setLists((prev: any) => {
      const found = findTaskEverywhere(taskId, prev);
      if (!found) return prev;
      return prev.map((l: any) => {
        if (l.id !== found.listId) return l;
        if (!found.parentId) {
          // Deleting a main task
          const taskIndex = l.tasks.findIndex((t: any) => t.id === taskId);
          if (taskIndex === -1) return l;
          const subtasksToPromote = found.task.subtasks || [];
          const newTasks = [...l.tasks];
          newTasks.splice(taskIndex, 1, ...subtasksToPromote);
          return { ...l, tasks: newTasks };
        } else {
          // Deleting a subtask
          return {
            ...l,
            tasks: l.tasks.map((t: any) => 
              t.id === found.parentId 
                ? { ...t, subtasks: t.subtasks.filter((s: any) => s.id !== taskId) }
                : t
            )
          };
        }
      });
    });
  };

  const closeEditing = async () => {
    const currentLists = store.getState().lists.lists;
    if (editingTaskId) {
      const found = findTaskEverywhere(editingTaskId, currentLists);
      if (found) {
        if (!found.task.title.trim()) {
          deleteTaskById(editingTaskId);
        } else if ((found.task as any).isNew && authUser) {
          // Payload for backend (new task)
          const payload = {
            title: found.task.title,
            description: found.task.details || "",
            date: found.task.dueDate || new Date().toISOString(),
            assigned_to_user: found.task.assign?.id || null,
            list: found.listId,
            parent_id: found.parentId || null,
            assigned_by: authUser._id || authUser.id,
            isStarred: found.task.starred || false,
            repeat: found.task.repeat || { enabled: false },
            order: found.task.order || 0
          };

          // Optimistically remove isNew flag
          updateTaskEverywhere(editingTaskId, (t) => ({ ...t, isNew: false }));

          try {
            const res = await createTaskApi(payload);
            const createdTask = res.data;
            if (createdTask && createdTask._id) {
              // Replace temporary ID with MongoDB ID
              updateTaskEverywhere(editingTaskId, (t) => ({ ...t, id: createdTask._id, _id: createdTask._id }));
            }
          } catch (err) {
            console.error("Failed to create task", err);
          }
        } else {
          // For existing tasks, send title and details update on close
          if (editingTaskId.length < 24) {
            dispatch(uiActions.closeAllEditing());
            return;
          }
          try {
            await updateTaskApi(editingTaskId, {
              title: found.task.title,
              description: found.task.details || ""
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
      const currentLists = store.getState().lists.lists;
      const found = findTaskEverywhere(taskId, currentLists);
      if (found && (found.task as any).isNew && authUser) {
        const payload = {
          title: found.task.title || "New Task",
          description: found.task.details || "",
          date: found.task.dueDate || new Date().toISOString(),
          assigned_to_user: found.task.assign?.id || null,
          list: found.listId,
          parent_id: found.parentId || null,
          assigned_by: authUser._id || authUser.id,
          isStarred: found.task.starred || false,
          repeat: found.task.repeat || { enabled: false },
          order: found.task.order || 0
        };
        try {
          const res = await createTaskApi(payload);
          const createdTask = res.data;
          if (createdTask && createdTask._id) {
            finalTaskId = createdTask._id;
            updateTaskEverywhere(taskId, (t: any) => ({ ...t, id: createdTask._id, _id: createdTask._id, isNew: false }));
          } else {
            throw new Error("Failed to create task before uploading");
          }
        } catch (err) {
          console.error("Failed to auto-save task", err);
          updateTaskEverywhere(taskId, (t: any) => ({ ...t, attachments: (t.attachments || []).filter((a: any) => a.id !== tempId) }));
          return;
        }
      } else {
        // Not a new task or missing authUser, just cancel
        updateTaskEverywhere(taskId, (t: any) => ({ ...t, attachments: (t.attachments || []).filter((a: any) => a.id !== tempId) }));
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
          name: f.split('/').pop() || f,
          url: `${process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:5000"}/${f}`,
          type: "unknown",
          rawPath: f
        }));
        // Update everywhere using finalTaskId (since we replaced it in state)
        updateTaskEverywhere(finalTaskId, (t: any) => ({ ...t, attachments }));
      }
    } catch (err) {
      console.error("Failed to upload attachment", err);
      // Remove optimistic update
      updateTaskEverywhere(finalTaskId, (t: any) => ({ ...t, attachments: (t.attachments || []).filter((a: any) => a.id !== tempId) }));
    }
  };

  const removeTaskAttachment = async (taskId: string, att: any) => {
    // Optimistic remove
    updateTaskEverywhere(taskId, (t: any) => ({ ...t, attachments: (t.attachments || []).filter((a: any) => a.id !== att.id) }));
    if (!att.rawPath) return; // Cannot delete from backend if it doesn't have rawPath
    try {
      await removeTaskAttachmentApi(taskId, att.rawPath);
    } catch (err) {
      console.error("Failed to remove attachment", err);
    }
  };

  const addTaskToList = (listId: string) => {
    if (!listId) return;
    const title = "New Task";
    const t = newTask(title);
    t.listId = listId;
    (t as any).isNew = true;

    let maxOrder = -1;
    const currentLists = store.getState().lists.lists;
    const targetList = currentLists.find((l: any) => l.id === listId);
    if (targetList && targetList.tasks.length > 0) {
      maxOrder = Math.max(...targetList.tasks.map((task: any) => task.order || 0));
    }
    t.order = maxOrder + 1;

    if (authUser) {
      const uRole = authUser.role ? authUser.role.toLowerCase() : "";
      t.assign = {
        id: authUser._id || authUser.id,
        name: authUser.fullName || authUser.name,
        role: uRole === "unit_head" ? "Unit Head" : uRole === "team_head" ? "Team Head" : uRole === "admin" ? "Admin" : "Staff"
      };
    }

    setLists((prev: any) => prev.map((l: any) => (l.id === listId ? { ...l, tasks: [...l.tasks, t] } : l)));
    setEditingTaskId(t.id);
    setAddingList(false);
    setEditDeadlineFor(null);
  };

  const addSubtask = async (parentId: string) => {
    const currentUI = store.getState().taskUI;
    const title = (currentUI.newSubtaskInputs[parentId] || "").trim();
    if (!title) return;

    const currentLists = store.getState().lists.lists;
    const parentFound = findTaskEverywhere(parentId, currentLists);
    if (!parentFound) return;

    // Optimistic UI update
    const tempSubtask = newTask(title);
    updateTaskEverywhere(parentId, (t) => ({ ...t, subtasks: [...(t.subtasks || []), tempSubtask] }));
    dispatch(uiActions.setNewSubtaskInput({ parentId, value: "" }));

    // Backend creation
    try {
      const payload = {
        title,
        list: parentFound.listId,
        parent_id: parentId,
        assigned_to_user: authUser?._id || authUser?.id || null
      };
      const response = await createTaskApi(payload);
      const createdSubtask = response.data?.data || response.data;

      if (createdSubtask && createdSubtask._id) {
        updateTaskEverywhere(parentId, (t) => {
          const newSubtasks = t.subtasks.map((s: any) =>
            s.id === tempSubtask.id ? { ...s, id: createdSubtask._id, _id: createdSubtask._id } : s
          );
          return { ...t, subtasks: newSubtasks };
        });
      }
    } catch (err) {
      console.error("Failed to create subtask", err);
    }
  };

  const moveTaskToList = (taskId: string, parentId: string | null, targetListId: string) => {
    const currentLists = store.getState().lists.lists;
    const found = findTaskEverywhere(taskId, currentLists);
    if (!found) return;
    const task = { ...found.task, subtasks: found.task.subtasks || [] };
    setLists((prev: any) => {
      let next = removeTaskFromTree(prev, found.listId, taskId, found.parentId);
      next = next.map((l: any) => (l.id === targetListId ? { ...l, tasks: [...l.tasks, task] } : l));
      return next;
    });
    setOpenTaskMenu(null);
    setOpenMovePicker(null);
    
    // Sync backend: set new list_id, remove parent_id (since it moves to root of new list), update order
    const targetList = store.getState().lists.lists.find((l: any) => l.id === targetListId);
    const newOrder = targetList ? targetList.tasks.length : 0;
    syncToBackend(taskId, { list: targetListId, parent_id: null, order: newOrder });
  };

  const moveTaskToNewList = (taskId: string, parentId: string | null, newListNameVal: string) => {
    const id = uid();
    setLists((prev: any) => [...prev, { id, name: newListNameVal, sortBy: "deadline", tasks: [] }]);
    setTimeout(() => moveTaskToList(taskId, parentId, id), 0);
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

  const updateList = (listId: string, fn: (l: any) => any) => setLists((prev: any) => prev.map((l: any) => (l.id === listId ? fn(l) : l)));

  const setSortBy = (listId: string, value: string) => {
    updateList(listId, (l) => ({ ...l, sortBy: value }));
    dispatch(updateListThunk({ id: listId, data: { sortBy: value } }) as any);
    setOpenListMenu(null);
  };

  const startRename = (list: any) => {
    dispatch(uiActions.startRenameList({ id: list.id, name: list.name }));
    setOpenListMenu(null);
  };

  const commitRename = (listId: string) => {
    const currentUI = store.getState().taskUI;
    const name = currentUI.renameValue.trim();
    if (name) {
      updateList(listId, (l) => ({ ...l, name }));
      dispatch(updateListThunk({ id: listId, data: { name } }) as any);
    }
    setRenamingListId(null);
  };

  const deleteList = (listId: string) => {
    const currentLists = store.getState().lists.lists;
    if (currentLists[0]?.id === listId) return;
    setLists((prev: any) => prev.filter((l: any) => l.id !== listId));
    setOpenListMenu(null);
  };

  const deleteAllCompleted = (listId: string) => {
    updateList(listId, (l) => ({
      ...l,
      tasks: l.tasks
        .filter((t: any) => !t.completed)
        .map((t: any) => ({ ...t, subtasks: t.subtasks?.filter((s: any) => !s.completed) || [] })),
    }));
    setOpenListMenu(null);
  };

  const addList = () => {
    const currentUI = store.getState().taskUI;
    const name = currentUI.newListName.trim();
    if (!name) return;
    setLists((prev: any) => [...prev, { id: uid(), name, sortBy: "my-order", tasks: [] }]);
    setNewListName("");
    setAddingList(false);
  };

  const toggleCompletedSection = (listId: string) => dispatch(uiActions.toggleCollapsedCompleted(listId));

  // --- Drag operations ---
  const onDragStartTask = (e: any, listId: string, taskId: string, parentId: string | null) => {
    dragDataRef.current = { kind: "task", listId, taskId, parentId };
    e.dataTransfer.effectAllowed = "move";
    e.stopPropagation();
  };
  const onDragStartList = (e: any, listId: string) => {
    dragDataRef.current = { kind: "list", listId };
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragStartAssign = (e: any, assignType: string, name: string) => {
    dragDataRef.current = { kind: "assign", assignType, name };
    e.dataTransfer.effectAllowed = "copy";
  };
  const onDragEnd = () => {
    dragDataRef.current = null;
    setDragOverTarget(null);
  };

  const dropOnList = (e: any, listId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const d = dragDataRef.current;
    setDragOverTarget(null);
    if (!d || d.kind !== "task") return;
    const currentLists = store.getState().lists.lists;
    const found = findTaskEverywhere(d.taskId, currentLists);
    if (!found) return;
    if (!found.parentId && found.listId === listId) return;
    const task = { ...found.task, subtasks: found.parentId ? [] : (found.task.subtasks || []) };
    setLists((prev: any) => {
      let next = removeTaskFromTree(prev, found.listId, d.taskId, found.parentId);
      next = next.map((l: any) => (l.id === listId ? { ...l, tasks: [...l.tasks, task] } : l));
      return next;
    });
    dragDataRef.current = null;
    const targetList = store.getState().lists.lists.find((l: any) => l.id === listId);
    const newOrder = targetList ? targetList.tasks.length : 0;
    syncToBackend(d.taskId, { list_id: listId, parent_id: null, order: newOrder });
  };

  const dropOnTask = (e: any, listId: string, targetTaskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const d = dragDataRef.current;
    setDragOverTarget(null);
    if (!d || d.kind !== "task" || d.taskId === targetTaskId) return;
    const currentLists = store.getState().lists.lists;
    const found = findTaskEverywhere(d.taskId, currentLists);
    if (!found) return;
    const targetFound = findTaskEverywhere(targetTaskId, currentLists);
    if (!targetFound) return;
    const task = { ...found.task, subtasks: [] };
    setLists((prev: any) => {
      let next = removeTaskFromTree(prev, found.listId, d.taskId, found.parentId);
      next = next.map((l: any) =>
        l.id === listId
          ? { ...l, tasks: l.tasks.map((t: any) => t.id === targetTaskId ? { ...t, subtasks: [...(t.subtasks || []), task] } : t) }
          : l
      );
      return next;
    });
    dragDataRef.current = null;
    const targetTask = store.getState().lists.lists.flatMap((l: any) => l.tasks).find((t: any) => t.id === targetTaskId);
    const newOrder = targetTask ? (targetTask.subtasks?.length || 0) : 0;
    syncToBackend(d.taskId, { parent_id: targetTaskId, order: newOrder });
  };

  const dropOnListHeader = (e: any, targetListId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const d = dragDataRef.current;
    setDragOverTarget(null);
    if (!d || d.kind !== "list" || d.listId === targetListId) return;
    setLists((prev: any) => {
      const next = [...prev];
      const fromIdx = next.findIndex((l: any) => l.id === d.listId);
      const toIdx = next.findIndex((l: any) => l.id === targetListId);
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    dragDataRef.current = null;
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

  const promoteToMainTask = (taskId: string, parentId: string | null, listId: string) => {
    const currentLists = store.getState().lists.lists;
    const found = findTaskEverywhere(taskId, currentLists);
    if (!found) return;
    const task = { ...found.task, subtasks: found.task.subtasks || [] };
    setLists((prev: any) => {
      let next = removeTaskFromTree(prev, listId, taskId, parentId);
      next = next.map((l: any) => (l.id === listId ? { ...l, tasks: [...l.tasks, task] } : l));
      return next;
    });
    setEditingTaskId(null);
    const targetList = store.getState().lists.lists.find((l: any) => l.id === listId);
    const newOrder = targetList ? targetList.tasks.length : 0;
    syncToBackend(taskId, { parent_id: null, order: newOrder });
  };

  const indentTask = (taskId: string, listId: string) => {
    setLists((prev: any) =>
      prev.map((l: any) => {
        if (l.id !== listId) return l;
        const idx = l.tasks.findIndex((t: any) => t.id === taskId);
        if (idx <= 0) return l;
        const prevTask = l.tasks[idx - 1];
        const taskToIndent = l.tasks[idx];
        const newTasks = [...l.tasks];
        newTasks.splice(idx, 1);
        const newOrder = prevTask.subtasks?.length || 0;
        newTasks[idx - 1] = { ...prevTask, subtasks: [...(prevTask.subtasks || []), taskToIndent] };

        syncToBackend(taskId, { parent_id: prevTask.id || prevTask._id, order: newOrder });
        return { ...l, tasks: newTasks };
      })
    );
    setEditingTaskId(null);
    setOpenTaskMenu(null);
  };

  const getTask = (taskId: string) => findTaskEverywhere(taskId, store.getState().lists.lists)?.task;

  return {
    lists, setLists, orgPeople, loadMoreLists, loadingLists, hasMore,
    openAssignFor, setOpenAssignFor, openAttFor, setOpenAttFor,
    collapsedCompleted, setCollapsedCompleted, editingTaskId, setEditingTaskId,
    openListMenu, setOpenListMenu, openTaskMenu, setOpenTaskMenu, openMovePicker, setOpenMovePicker,
    renamingListId, setRenamingListId, renameValue, setRenameValue,
    newSubtaskInputs, setNewSubtaskInputs, addingList, setAddingList, newListName, setNewListName,
    calendarFor, setCalendarFor, editDeadlineFor, setEditDeadlineFor, timeFor, setTimeFor, repeatFor, setRepeatFor,
    tomorrowClickCount, setTomorrowClickCount, dragData: dragDataRef, dragOverTarget, setDragOverTarget,
    findTaskEverywhere, updateTaskEverywhere, removeTaskEverywhere, removeTaskFromTree,
    toggleComplete, toggleStar, setTitle, setDetails, setDate, setDueDate, setDueTime, setDueDateAndTime, setRepeat, clearDue,
    setAssign, deleteTaskById, closeEditing, uploadTaskAttachment, removeTaskAttachment, addTaskToList, addSubtask, moveTaskToList, moveTaskToNewList,
    handleTomorrowClick, handleTodayClick, updateList, setSortBy, startRename, commitRename, deleteList,
    deleteAllCompleted, addList, toggleCompletedSection, onDragStartTask, onDragStartList, onDragStartAssign,
    onDragEnd, dropOnList, dropOnTask, dropOnListHeader, dropAssign, promoteToMainTask, indentTask, getTask,
    fetchTasksForCurrentList, fetchPeople, loadingPeople
  };
};
