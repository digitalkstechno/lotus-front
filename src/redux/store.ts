import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import unitReducer from "./slices/unitSlice";
import teamReducer from "./slices/teamSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    units: unitReducer,
    teams: teamReducer,
    users: userReducer,
    // Add other reducers here as you build your app
  },
  devTools: process.env.NODE_ENV !== "production",
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
