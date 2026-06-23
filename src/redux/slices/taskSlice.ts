import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getTasksByUserApi } from "../../services/taskService";

export const fetchTasksByUser = createAsyncThunk(
  "tasks/fetchByUser",
  async ({ userId, page = 1, limit = 20, sortBy, isStarred }: { userId: string, page?: number, limit?: number, sortBy?: string, isStarred?: boolean }, { rejectWithValue }) => {
    try {
      const response = await getTasksByUserApi(userId, page, limit, sortBy, isStarred);
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
        assignBy: t.assigned_by ? {
          id: t.assigned_by._id || t.assigned_by.id,
          name: t.assigned_by.name || t.assigned_by.fullName,
        } : null,
        subtasks: Array.isArray(t.subtask) ? t.subtask.map((s: any) => ({
          ...s,
          id: s._id || s.id,
          completed: s.status === "Completed" || false,
          starred: s.isStarred || false,
          details: s.description || "",
          date: s.date || null,
          dueDate: s.deadline || null,
          assign: s.assigned_to_user ? {
            id: s.assigned_to_user._id || s.assigned_to_user.id,
            name: s.assigned_to_user.name || s.assigned_to_user.fullName,
            role: s.assigned_to_user.role === "unit_head" ? "Unit Head" : s.assigned_to_user.role === "team_head" ? "Team Head" : s.assigned_to_user.role === "admin" ? "Admin" : "Staff"
          } : null,
          assignBy: s.assigned_by ? {
            id: s.assigned_by._id || s.assigned_by.id,
            name: s.assigned_by.name || s.assigned_by.fullName,
          } : null,
          attachments: Array.isArray(s.file) ? s.file.map((f: string, idx: number) => ({
            id: `att-sub-${s._id || s.id}-${idx}`,
            name: f.split('/').pop() || f,
            url: `${process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:5000"}/${f}`,
            type: "unknown",
            rawPath: f
          })) : []
        })) : []
      }));

      return { data: fetchedTasks, page, totalPages: pagination.totalPages };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to fetch tasks");
    }
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    tasks: [] as any[],
    loading: false,
    error: null as string | null,
    currentPage: 1,
    totalPages: 1,
    hasMore: true,
  },
  reducers: {
    resetTasks: (state) => {
      state.tasks = [];
      state.currentPage = 1;
      state.totalPages = 1;
      state.hasMore = true;
    },
    setTasksLocally: (state, action) => {
      state.tasks = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTasksByUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTasksByUser.fulfilled, (state, action) => {
      state.loading = false;
      const { data, page, totalPages } = action.payload;

      if (page === 1) {
        state.tasks = data;
      } else {
        const existingIds = new Set(state.tasks.map(t => t.id));
        const newTasks = data.filter((t: any) => !existingIds.has(t.id));
        state.tasks = [...state.tasks, ...newTasks];
      }
      state.currentPage = page;
      state.totalPages = totalPages;
      state.hasMore = page < totalPages;
    });
    builder.addCase(fetchTasksByUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { resetTasks, setTasksLocally } = taskSlice.actions;
export default taskSlice.reducer;
