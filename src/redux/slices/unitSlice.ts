import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as unitApi from "../../services/unitService";

export const fetchUnits = createAsyncThunk("units/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await unitApi.getUnitsApi();
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to fetch units");
  }
});

export const addUnit = createAsyncThunk("units/add", async (data: any, { rejectWithValue }) => {
  try {
    const payload = {
      name: data.name,
      head_user_id: data.headId
    };
    const response = await unitApi.addUnitApi(payload);
    const d = response.data.data || response.data;
    return { ...d, id: d._id || d.id, headId: typeof d.head_user_id === "object" ? d.head_user_id?._id : d.head_user_id, headName: typeof d.head_user_id === "object" ? d.head_user_id?.fullName : undefined };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to add unit");
  }
});

export const updateUnit = createAsyncThunk("units/update", async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
  try {
    const payload = {
      name: data.name,
      head_user_id: data.headId
    };
    const response = await unitApi.updateUnitApi(id, payload);
    const d = response.data.data || response.data;
    return { ...d, id: d._id || d.id, headId: typeof d.head_user_id === "object" ? d.head_user_id?._id : d.head_user_id, headName: typeof d.head_user_id === "object" ? d.head_user_id?.fullName : undefined };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to update unit");
  }
});

export const deleteUnit = createAsyncThunk("units/delete", async (id: string, { rejectWithValue }) => {
  try {
    await unitApi.deleteUnitApi(id);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to delete unit");
  }
});

const unitSlice = createSlice({
  name: "units",
  initialState: {
    units: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // fetch
    builder.addCase(fetchUnits.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchUnits.fulfilled, (state, action) => { 
      state.loading = false; 
      const rawData = action.payload.data || action.payload;
      state.units = Array.isArray(rawData) ? rawData.map((u: any) => ({
        ...u,
        id: u._id || u.id,
        headId: typeof u.head_user_id === "object" ? u.head_user_id?._id : u.head_user_id,
        headName: typeof u.head_user_id === "object" ? u.head_user_id?.fullName : undefined
      })) : [];
    });
    builder.addCase(fetchUnits.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    // add
    builder.addCase(addUnit.fulfilled, (state, action) => { state.units.push(action.payload); });
    // update
    builder.addCase(updateUnit.fulfilled, (state, action) => {
      const index = state.units.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) state.units[index] = action.payload;
    });
    // delete
    builder.addCase(deleteUnit.fulfilled, (state, action) => {
      state.units = state.units.filter((u) => u.id !== action.payload);
    });
  },
});

export default unitSlice.reducer;
