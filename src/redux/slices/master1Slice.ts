import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as master1Api from "../../services/master1Service";

export const fetchMaster1All = createAsyncThunk(
  "master1/fetchAll",
  async (params: { search: string }, { rejectWithValue }) => {
    try {
      const response = await master1Api.getMaster1PaginatedApi(params.search);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to fetch master1");
    }
  }
);

export const addMaster1 = createAsyncThunk("master1/add", async (data: any, { rejectWithValue }) => {
  try {
    const payload = {
      type: data.name,
      weight: data.weightage,
      order: data.order
    };
    const response = await master1Api.addMaster1Api(payload);
    const d = response.data.data || response.data;
    return { ...d, id: d._id || d.id, name: d.type, weightage: d.weight };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to add master1");
  }
});

export const updateMaster1 = createAsyncThunk("master1/update", async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
  try {
    const payload: any = {};
    if (data.name !== undefined) payload.type = data.name;
    if (data.weightage !== undefined) payload.weight = data.weightage;
    if (data.order !== undefined) payload.order = data.order;

    const response = await master1Api.updateMaster1Api(id, payload);
    const d = response.data.data || response.data;
    return { ...d, id: d._id || d.id, name: d.type, weightage: d.weight };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to update master1");
  }
});

export const deleteMaster1 = createAsyncThunk("master1/delete", async (id: string, { rejectWithValue }) => {
  try {
    await master1Api.deleteMaster1Api(id);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to delete master1");
  }
});

const master1Slice = createSlice({
  name: "master1",
  initialState: {
    items: [] as any[],
    loading: false,
    error: null as string | null,
    pagination: { total: 0, page: 1, limit: 100 }, // Load a lot of records so drag drop order logic is easier on 1 page
  },
  reducers: {},
  extraReducers: (builder) => {
    // fetch
    builder.addCase(fetchMaster1All.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchMaster1All.fulfilled, (state, action) => {
      state.loading = false;
      const rawData = action.payload.data || action.payload;
      state.items = Array.isArray(rawData) ? rawData.map((d: any) => ({
        ...d,
        id: d._id || d.id,
        name: d.type,
        weightage: d.weight
      })) : [];
      if (action.payload.totalRecords !== undefined) state.pagination.total = action.payload.totalRecords;
    });
    builder.addCase(fetchMaster1All.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // add
    builder.addCase(addMaster1.fulfilled, (state, action) => { state.items.push(action.payload); state.pagination.total += 1; });

    // update
    builder.addCase(updateMaster1.fulfilled, (state, action) => {
      const index = state.items.findIndex((i) => i.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
    });

    // delete
    builder.addCase(deleteMaster1.fulfilled, (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    });
  },
});

export default master1Slice.reducer;
