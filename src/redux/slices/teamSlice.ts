import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as teamApi from "../../services/teamService";

export const fetchTeams = createAsyncThunk("teams/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await teamApi.getTeamsApi();
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to fetch teams");
  }
});

export const fetchTeamsByDepartment = createAsyncThunk("teams/fetchByDept", async (unitId: string, { rejectWithValue }) => {
  try {
    const response = await teamApi.getTeamsByDepartmentApi(unitId);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to fetch teams by department");
  }
});

export const addTeam = createAsyncThunk("teams/add", async (data: any, { rejectWithValue }) => {
  try {
    const payload = {
      name: data.name,
      unit_id: data.unitId,
      head_user_id: data.headId
    };
    const response = await teamApi.addTeamApi(payload);
    const d = response.data.data || response.data;
    return { ...d, id: d._id || d.id, unitId: typeof d.unit_id === "object" && d.unit_id ? d.unit_id?._id : d.unit_id, headId: typeof d.head_user_id === "object" && d.head_user_id ? d.head_user_id?._id : d.head_user_id, headName: typeof d.head_user_id === "object" && d.head_user_id ? d.head_user_id?.fullName : undefined };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to add team");
  }
});

export const updateTeam = createAsyncThunk("teams/update", async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
  try {
    const payload = {
      name: data.name,
      unit_id: data.unitId,
      head_user_id: data.headId
    };
    const response = await teamApi.updateTeamApi(id, payload);
    const d = response.data.data || response.data;
    return { ...d, id: d._id || d.id, unitId: typeof d.unit_id === "object" && d.unit_id ? d.unit_id?._id : d.unit_id, headId: typeof d.head_user_id === "object" && d.head_user_id ? d.head_user_id?._id : d.head_user_id, headName: typeof d.head_user_id === "object" && d.head_user_id ? d.head_user_id?.fullName : undefined };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to update team");
  }
});

export const deleteTeam = createAsyncThunk("teams/delete", async (id: string, { rejectWithValue }) => {
  try {
    await teamApi.deleteTeamApi(id);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to delete team");
  }
});

const teamSlice = createSlice({
  name: "teams",
  initialState: {
    teams: [] as any[],
    departmentTeams: [] as any[], // for the dropdowns
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // fetch all
    builder.addCase(fetchTeams.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchTeams.fulfilled, (state, action) => { 
      state.loading = false; 
      const rawData = action.payload.data || action.payload;
      state.teams = Array.isArray(rawData) ? rawData.map((t: any) => ({
        ...t,
        id: t._id || t.id,
        unitId: typeof t.unit_id === "object" && t.unit_id ? t.unit_id?._id : t.unit_id,
        headId: typeof t.head_user_id === "object" && t.head_user_id ? t.head_user_id?._id : t.head_user_id,
        headName: typeof t.head_user_id === "object" && t.head_user_id ? t.head_user_id?.fullName : undefined
      })) : [];
    });
    builder.addCase(fetchTeams.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    
    // fetch by dept
    builder.addCase(fetchTeamsByDepartment.fulfilled, (state, action) => { state.departmentTeams = action.payload; });

    // add
    builder.addCase(addTeam.fulfilled, (state, action) => { state.teams.push(action.payload); });
    
    // update
    builder.addCase(updateTeam.fulfilled, (state, action) => {
      const index = state.teams.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) state.teams[index] = action.payload;
    });
    
    // delete
    builder.addCase(deleteTeam.fulfilled, (state, action) => {
      state.teams = state.teams.filter((t) => t.id !== action.payload);
    });
  },
});

export default teamSlice.reducer;
