import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: any | null; // Replace 'any' with your User type
  token: string | null;
  isAuthenticated: boolean;
}

const getUserFromStorage = () => {
  if (typeof window !== "undefined") {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) return JSON.parse(userStr);
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
  }
  return null;
};

const initialState: AuthState = {
  user: getUserFromStorage(),
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isAuthenticated: !!(typeof window !== "undefined" && localStorage.getItem("token")),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: any; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("fcm_token");
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
