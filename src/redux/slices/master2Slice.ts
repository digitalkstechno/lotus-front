import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as master2Api from "../../services/master2Service";

export const fetchMaster2All = createAsyncThunk(
  "master2/fetchAll",
  async (params: { search: string }, { rejectWithValue }) => {
    try {
      const response = await master2Api.getMaster2AllApi(params.search);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to fetch master2");
    }
  }
);

export const fetchMaster2ByMaster1 = createAsyncThunk(
  "master2/fetchByMaster1",
  async (master1Id: string, { rejectWithValue }) => {
    try {
      const response = await master2Api.getMaster2ByMaster1Api(master1Id);
      return { master1Id, data: response.data.data || response.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to fetch master2 by parent");
    }
  }
);

export const addMaster2 = createAsyncThunk("master2/add", async (data: any, { rejectWithValue }) => {
  try {
    const payload = {
      master1_id: data.master1Id,
      particulars: data.name,
      category: data.category,
      max_score: data.maxScore,
      order: data.order
    };
    const response = await master2Api.addMaster2Api(payload);
    const d = response.data.data || response.data;
    return { ...d, id: d._id || d.id, name: d.particulars, maxScore: d.max_score, master1Id: d.master1_id };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to add master2");
  }
});

export const updateMaster2 = createAsyncThunk("master2/update", async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
  try {
    const payload: any = {};
    if (data.master1Id !== undefined) payload.master1_id = data.master1Id;
    if (data.name !== undefined) payload.particulars = data.name;
    if (data.category !== undefined) payload.category = data.category;
    if (data.maxScore !== undefined) payload.max_score = data.maxScore;
    if (data.order !== undefined) payload.order = data.order;

    const response = await master2Api.updateMaster2Api(id, payload);
    const d = response.data.data || response.data;
    return { ...d, id: d._id || d.id, name: d.particulars, maxScore: d.max_score, master1Id: d.master1_id };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to update master2");
  }
});

export const deleteMaster2 = createAsyncThunk("master2/delete", async (id: string, { rejectWithValue }) => {
  try {
    await master2Api.deleteMaster2Api(id);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to delete master2");
  }
});

const master2Slice = createSlice({
  name: "master2",
  initialState: {
    items: [] as any[],
    loading: false,
    error: null as string | null,
    pagination: { total: 0 },
  },
  reducers: {},
  extraReducers: (builder) => {
    // fetch
    builder.addCase(fetchMaster2All.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchMaster2All.fulfilled, (state, action) => {
      state.loading = false;
      const rawData = action.payload.data || action.payload;
      state.items = Array.isArray(rawData) ? rawData.map((d: any) => ({
        ...d,
        id: d._id || d.id,
        name: d.particulars,
        category: d.category,
        maxScore: d.max_score,
        master1Id: d.master1_id?._id || d.master1_id,
        master1Name: d.master1_id?.type || ""
      })) : [];
      if (action.payload.totalRecords !== undefined) state.pagination.total = action.payload.totalRecords;
    });
    builder.addCase(fetchMaster2All.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // fetch by master1
    builder.addCase(fetchMaster2ByMaster1.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchMaster2ByMaster1.fulfilled, (state, action) => {
      state.loading = false;
      const { master1Id, data } = action.payload;
      
      // Filter out existing items for this parent to replace them fresh
      const otherItems = state.items.filter(item => item.master1Id !== master1Id);
      
      const newItems = Array.isArray(data) ? data.map((d: any) => ({
        ...d,
        id: d._id || d.id,
        name: d.particulars,
        category: d.category,
        maxScore: d.max_score,
        master1Id: d.master1_id?._id || d.master1_id,
        master1Name: d.master1_id?.type || ""
      })) : [];

      state.items = [...otherItems, ...newItems];
    });
    builder.addCase(fetchMaster2ByMaster1.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // add
    builder.addCase(addMaster2.fulfilled, (state, action) => { state.items.push(action.payload); state.pagination.total += 1; });

    // update
    builder.addCase(updateMaster2.fulfilled, (state, action) => {
      const index = state.items.findIndex((i) => i.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
    });

    // delete
    builder.addCase(deleteMaster2.fulfilled, (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    });
  },
});

export default master2Slice.reducer;
