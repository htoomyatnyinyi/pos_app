import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import authReducer from "@/services/features/auth/authSlice";
import cartReducer from "@/services/features/cart/cartSlice";
import { posApi } from "@/services/api/posApi";

const persistConfig = {
  key: "root",
  version: 1,
  storage:
    Platform.OS === "web"
      ? {
          getItem: (key: string) => {
            if (typeof window === "undefined") return Promise.resolve(null);
            return Promise.resolve(localStorage.getItem(key));
          },
          setItem: (key: string, value: string) => {
            if (typeof window === "undefined") return Promise.resolve();
            return Promise.resolve(localStorage.setItem(key, value));
          },
          removeItem: (key: string) => {
            if (typeof window === "undefined") return Promise.resolve();
            return Promise.resolve(localStorage.removeItem(key));
          },
        }
      : AsyncStorage,
  whitelist: ["auth"], // Only persist auth slice
};

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  [posApi.reducerPath]: posApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(posApi.middleware),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
