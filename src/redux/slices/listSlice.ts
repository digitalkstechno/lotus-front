import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as listApi from "../../services/listService";

// Fetch user na lists
export const fetchListsByUser = createAsyncThunk(
  "lists/fetchByUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await listApi.getListsByUserApi(userId);
      return response.data;
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

const listSlice = createSlice({
  name: "lists",
  initialState: {
    lists: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // fetch by user
    builder.addCase(fetchListsByUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchListsByUser.fulfilled, (state, action) => {
      state.loading = false;
      const rawData = action.payload.data || action.payload;
      state.lists = Array.isArray(rawData) ? rawData : [];
    });
    builder.addCase(fetchListsByUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // add
    builder.addCase(addList.fulfilled, (state, action) => {
      state.lists.push(action.payload);
    });

    // update
    builder.addCase(updateList.fulfilled, (state, action) => {
      const index = state.lists.findIndex((l) => l._id === action.payload._id);
      if (index !== -1) state.lists[index] = action.payload;
    });

    // delete
    builder.addCase(deleteList.fulfilled, (state, action) => {
      state.lists = state.lists.filter((l) => l._id !== action.payload);
    });
  },
});

export default listSlice.reducer;