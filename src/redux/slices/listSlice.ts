import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as listApi from "../../services/listService";
import { getTasksByListAndUserApi } from "../../services/taskService";

export const fetchListsByUser = createAsyncThunk(
  "lists/fetchByUser",
  async ({ userId, page = 1, limit = 10, isChecked, sortBy = "rank" }: { userId: string, page?: number, limit?: number, isChecked?: boolean, sortBy?: string }, { rejectWithValue }) => {
    try {
      const response = await listApi.getListsByUserApi(userId, page, limit, isChecked, sortBy);
      // The backend returns: { status: "Success", pagination: {...}, data: [...] }
      const resData = response.data;
      let fetchedData = [];
      let pagination = { totalPages: 1, currentPage: 1 };

      if (resData && resData.data && Array.isArray(resData.data)) {
        fetchedData = resData.data;
        pagination = resData.pagination || pagination;
      } else if (Array.isArray(resData)) {
        fetchedData = resData;
      }

      console.log("listSlice - fetchListsByUser - resData:", resData);
      console.log("listSlice - fetchListsByUser - fetchedData:", fetchedData);

      return { data: fetchedData, page, totalPages: pagination.totalPages };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to fetch lists");
    }
  }
);

// Create new list
export const addList = createAsyncThunk(
  "lists/add",
  async (data: { name: string; user_id?: string; order?: number }, { rejectWithValue }) => {
    try {
      const response = await listApi.createListApi(data);
      const d = response.data?.data || response.data;
      return d;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to create list");
    }
  }
);

// Update list
export const updateList = createAsyncThunk(
  "lists/update",
  async ({ id, data }: { id: string; data: { name?: string; order?: number; is_active?: boolean } }, { rejectWithValue }) => {
    try {
      const response = await listApi.updateListApi(id, data);
      const d = response.data?.data || response.data;
      return d;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to update list");
    }
  }
);

// Delete list
export const deleteList = createAsyncThunk(
  "lists/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await listApi.deleteListApi(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to delete list");
    }
  }
);

// Fetch tasks for a specific list
export const fetchTasksForList = createAsyncThunk(
  "lists/fetchTasks",
  async ({ listId, userId, page = 1, limit = 20, sortBy }: { listId: string, userId: string, page?: number, limit?: number, sortBy?: string }, { rejectWithValue }) => {
    try {
      const response = await getTasksByListAndUserApi(listId, userId, page, limit, sortBy);
      const resData = response.data;
      let fetchedTasks: any[] = [];
      let pagination = { totalPages: 1, currentPage: page };

      if (resData && resData.data && Array.isArray(resData.data)) {
        fetchedTasks = resData.data;
        pagination = resData.pagination || pagination;
      } else if (Array.isArray(resData)) {
        fetchedTasks = resData;
      }

      // Map backend fields to frontend fields
      fetchedTasks = fetchedTasks.map((t: any) => ({
        ...t,
        id: t._id || t.id,
        completed: t.status === "Completed" || false,
        starred: t.isStarred || false,
        details: t.description || "",
        date: t.date || null,
        dueDate: t.deadline || null,
        attachments: Array.isArray(t.file) ? t.file.map((f: string, idx: number) => ({
          id: `att-${t._id || t.id}-${idx}`,
          name: f.split('/').pop() || f,
          url: `${process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:5000"}/${f}`,
          type: "unknown",
          rawPath: f
        })) : [],
        assign: t.assigned_to_user ? {
          id: t.assigned_to_user._id || t.assigned_to_user.id,
          name: t.assigned_to_user.name || t.assigned_to_user.fullName,
          role: t.assigned_to_user.role === "unit_head" ? "Unit Head" : t.assigned_to_user.role === "team_head" ? "Team Head" : t.assigned_to_user.role === "admin" ? "Admin" : "Staff"
        } : null,
        subtasks: Array.isArray(t.subtask) ? t.subtask.map((s: any) => ({
          ...s,
          id: s._id || s.id,
          completed: s.status === "Completed" || false,
          starred: s.isStarred || false,
          details: s.description || "",
          date: s.date || null,
          dueDate: s.deadline || null,
          attachments: Array.isArray(s.file) ? s.file.map((f: string, idx: number) => ({
            id: `att-sub-${s._id || s.id}-${idx}`,
            name: f.split('/').pop() || f,
            url: `${process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:5000"}/${f}`,
            type: "unknown",
            rawPath: f
          })) : []
        })) : []
      }));

      return { listId, data: fetchedTasks, page, totalPages: pagination.totalPages };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to fetch tasks");
    }
  }
);

const listSlice = createSlice({
  name: "lists",
  initialState: {
    lists: [] as any[],
    loading: false,
    error: null as string | null,
    currentPage: 1,
    totalPages: 1,
    hasMore: true,
  },
  reducers: {
    resetLists: (state) => {
      state.lists = [];
      state.currentPage = 1;
      state.totalPages = 1;
      state.hasMore = true;
    },
    setListsLocally: (state, action) => {
      state.lists = action.payload;
    }
  },
  extraReducers: (builder) => {
    // fetch by user
    builder.addCase(fetchListsByUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchListsByUser.fulfilled, (state, action) => {
      state.loading = false;
      const { data, page, totalPages } = action.payload;

      const formattedLists = data.map((l: any) => ({
        ...l,
        id: l._id || l.id,
        name: l.name || "Unnamed List",
        rank: l.rank || "", // Ensure rank exists
        sortBy: "my-order",
        tasks: [], // Prepare empty tasks array for UI
        taskPagination: { currentPage: 1, totalPages: 1, hasMore: true, loading: false }
      }));

      if (page === 1) {
        state.lists = formattedLists;
      } else {
        // filter out duplicates if any
        const existingIds = new Set(state.lists.map(l => l.id));
        const newLists = formattedLists.filter(l => !existingIds.has(l.id));
        state.lists = [...state.lists, ...newLists];
      }
      state.currentPage = page;
      state.totalPages = totalPages;
      state.hasMore = page < totalPages;
    });
    builder.addCase(fetchListsByUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // add
    builder.addCase(addList.fulfilled, (state, action) => {
      state.lists.push({
        ...action.payload,
        id: action.payload._id || action.payload.id,
        tasks: [],
        taskPagination: { currentPage: 1, totalPages: 1, hasMore: true, loading: false }
      });
    });

    // update
    builder.addCase(updateList.fulfilled, (state, action) => {
      const index = state.lists.findIndex((l) => l.id === (action.payload._id || action.payload.id));
      if (index !== -1) {
        state.lists[index] = { ...state.lists[index], ...action.payload };
      }
    });

    // delete
    builder.addCase(deleteList.fulfilled, (state, action) => {
      state.lists = state.lists.filter((l) => l.id !== action.payload);
    });

    // fetch tasks for list
    builder.addCase(fetchTasksForList.pending, (state, action) => {
      const listId = action.meta.arg.listId;
      const list = state.lists.find(l => l.id === listId);
      if (list && list.taskPagination) list.taskPagination.loading = true;
    });
    builder.addCase(fetchTasksForList.fulfilled, (state, action) => {
      const { listId, data, page, totalPages } = action.payload;
      const list = state.lists.find(l => l.id === listId);
      if (list) {
        if (page === 1) {
          list.tasks = data;
        } else {
          const existingIds = new Set(list.tasks.map((t: any) => t._id || t.id));
          const newTasks = data.filter((t: any) => !existingIds.has(t._id || t.id));
          list.tasks = [...list.tasks, ...newTasks];
        }
        list.taskPagination = {
          currentPage: page,
          totalPages: totalPages,
          hasMore: page < totalPages,
          loading: false
        };
      }
    });
    builder.addCase(fetchTasksForList.rejected, (state, action) => {
      const listId = action.meta.arg.listId;
      const list = state.lists.find(l => l.id === listId);
      if (list && list.taskPagination) list.taskPagination.loading = false;
    });
  },
});

export const { resetLists, setListsLocally } = listSlice.actions;
export default listSlice.reducer;