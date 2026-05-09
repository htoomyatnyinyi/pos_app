import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import authReducer from "@/services/features/auth/authSlice";
import cartReducer from "@/services/features/cart/cartSlice";

import { posApi } from "@/services/api/posApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,

    [posApi.reducerPath]: posApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(posApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
