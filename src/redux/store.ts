import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import unitReducer from "./slices/unitSlice";
import teamReducer from "./slices/teamSlice";
import userReducer from "./slices/userSlice";
import master1Reducer from "./slices/master1Slice";
import master2Reducer from "./slices/master2Slice";

import listReducer from "./slices/listSlice";
import taskUIReducer from "./slices/taskUISlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    units: unitReducer,
    teams: teamReducer,
    users: userReducer,
    master1: master1Reducer,
    master2: master2Reducer,
    lists: listReducer,
    taskUI: taskUIReducer,
    // Add other reducers here as you build your app
  },
  devTools: process.env.NODE_ENV !== "production",
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
