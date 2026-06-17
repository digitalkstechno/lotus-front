import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as checklistApi from "../../services/checklistService";

// Fetch all checklists
export const fetchChecklists = createAsyncThunk(
  "checklists/fetchAll",
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await checklistApi.getChecklistsApi(page, limit);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to fetch checklists");
    }
  }
);

// Fetch single checklist by id
export const fetchChecklistById = createAsyncThunk(
  "checklists/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await checklistApi.getChecklistByIdApi(id);
      return response.data?.data || response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to fetch checklist");
    }
  }
);

// Create checklist
export const addChecklist = createAsyncThunk(
  "checklists/add",
  async (data: checklistApi.CreateChecklistPayload, { rejectWithValue }) => {
    try {
      const response = await checklistApi.createChecklistApi(data);
      const d = response.data?.data || response.data;
      return d;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to create checklist");
    }
  }
);

// Update checklist
export const updateChecklist = createAsyncThunk(
  "checklists/update",
  async ({ id, data }: { id: string; data: checklistApi.UpdateChecklistPayload }, { rejectWithValue }) => {
    try {
      const response = await checklistApi.updateChecklistApi(id, data);
      const d = response.data?.data || response.data;
      return d;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to update checklist");
    }
  }
);

// Delete checklist
export const deleteChecklist = createAsyncThunk(
  "checklists/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await checklistApi.deleteChecklistApi(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to delete checklist");
    }
  }
);

const checklistSlice = createSlice({
  name: "checklists",
  initialState: {
    checklists: [] as any[],
    activeChecklist: null as any,
    loading: false,
    error: null as string | null,
    pagination: {
      totalRecords: 0,
      currentPage: 1,
      totalPages: 1,
      limit: 10,
    },
  },
  reducers: {
    clearActiveChecklist: (state) => {
      state.activeChecklist = null;
    },
  },
  extraReducers: (builder) => {
    // fetch all
    builder.addCase(fetchChecklists.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchChecklists.fulfilled, (state, action) => {
      state.loading = false;
      const rawData = action.payload.data || action.payload;
      state.checklists = Array.isArray(rawData) ? rawData : [];
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
    });
    builder.addCase(fetchChecklists.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // fetch by id
    builder.addCase(fetchChecklistById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchChecklistById.fulfilled, (state, action) => {
      state.loading = false;
      state.activeChecklist = action.payload;
    });
    builder.addCase(fetchChecklistById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // add
    builder.addCase(addChecklist.fulfilled, (state, action) => {
      state.checklists.unshift(action.payload);
    });

    // update
    builder.addCase(updateChecklist.fulfilled, (state, action) => {
      const index = state.checklists.findIndex((c) => c._id === action.payload._id);
      if (index !== -1) state.checklists[index] = action.payload;
      if (state.activeChecklist?._id === action.payload._id) {
        state.activeChecklist = action.payload;
      }
    });

    // delete
    builder.addCase(deleteChecklist.fulfilled, (state, action) => {
      state.checklists = state.checklists.filter((c) => c._id !== action.payload);
    });
  },
});

export const { clearActiveChecklist } = checklistSlice.actions;
export default checklistSlice.reducer;