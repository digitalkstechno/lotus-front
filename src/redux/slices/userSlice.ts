import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as userApi from "../../services/userService";

export const fetchUsersPaginated = createAsyncThunk("users/fetchPaginated", async ({ page, limit, search, unitId, teamId }: { page: number, limit: number, search: string, unitId?: string | null, teamId?: string | null }, { rejectWithValue }) => {
  try {
    const response = await userApi.getUsersPaginatedApi(page, limit, search, unitId, teamId);
    return response.data; // Expected format: { data: [...], total, page, limit }
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to fetch users");
  }
});

export const addUser = createAsyncThunk("users/add", async (data: any, { rejectWithValue }) => {
  try {
    const payload = {
      fullName: data.name,
      email: data.email,
      contactNo: data.phone ? data.phone.replace(/[^0-9]/g, "") : "0000000000",
      password: "Password123!", // default password required by backend
      role: data.designation,
      unit_id: data.unitId,
      team_id: data.teamId
    };
    const response = await userApi.addUserApi(payload);
    const u = response.data.data || response.data;
    return { ...u, id: u._id || u.id, name: u.fullName || u.name, designation: u.role || u.designation || "Staff" };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to add user");
  }
});

export const updateUser = createAsyncThunk("users/update", async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
  try {
    const payload = {
      fullName: data.name,
      email: data.email,
      contactNo: data.phone ? data.phone.replace(/[^0-9]/g, "") : undefined,
      role: data.designation,
      unit_id: data.unitId,
      team_id: data.teamId
    };
    const response = await userApi.updateUserApi(id, payload);
    const u = response.data.data || response.data;
    return { ...u, id: u._id || u.id, name: u.fullName || u.name, designation: u.role || u.designation || "Staff", unitId: typeof u.unit_id === "object" ? u.unit_id?._id : u.unit_id, teamId: typeof u.team_id === "object" ? u.team_id?._id : u.team_id };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to update user");
  }
});

export const deleteUser = createAsyncThunk("users/delete", async (id: string, { rejectWithValue }) => {
  try {
    await userApi.deleteUserApi(id);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to delete user");
  }
});

const userSlice = createSlice({
  name: "users",
  initialState: {
    users: [] as any[],
    loading: false,
    error: null as string | null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10
    }
  },
  reducers: {},
  extraReducers: (builder) => {
    // fetch
    builder.addCase(fetchUsersPaginated.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchUsersPaginated.fulfilled, (state, action) => { 
      state.loading = false; 
      const rawData = action.payload.data || action.payload;
      state.users = Array.isArray(rawData) ? rawData.map((u: any) => ({
        ...u,
        id: u._id || u.id,
        name: u.fullName || u.name || "Unknown",
        designation: u.role || u.designation || "Staff",
        unitId: typeof u.unit_id === "object" ? u.unit_id?._id : u.unit_id,
        teamId: typeof u.team_id === "object" ? u.team_id?._id : u.team_id
      })) : [];
      if (action.payload.pagination?.totalRecords !== undefined) state.pagination.total = action.payload.pagination.totalRecords;
      if (action.payload.pagination?.currentPage !== undefined) state.pagination.page = action.payload.pagination.currentPage;
    });
    builder.addCase(fetchUsersPaginated.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    
    // add
    builder.addCase(addUser.fulfilled, (state, action) => { state.users.push(action.payload); state.pagination.total += 1; });
    
    // update
    builder.addCase(updateUser.fulfilled, (state, action) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) state.users[index] = action.payload;
    });
    
    // delete
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
      state.pagination.total -= 1;
    });
  },
});

export default userSlice.reducer;
