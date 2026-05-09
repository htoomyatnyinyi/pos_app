import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { User } from "./authTypes";

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: {
    id: "test-user-001",
    name: "Test Admin",
    email: "admin@test.com",
    token: "mock-token-for-testing",
  },
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },

    logout: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, logout } = authSlice.actions;

export default authSlice.reducer;
