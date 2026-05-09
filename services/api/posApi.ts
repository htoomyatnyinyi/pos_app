import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const POS_URL = process.env.EXPO_PUBLIC_POS_URL || "http://localhost:3000/api";

export const posApi = createApi({
  reducerPath: "posApi",
  baseQuery: fetchBaseQuery({
    baseUrl: POS_URL,
  }),

  tagTypes: ["Auth", "Products", "Orders", "Customers"],

  endpoints: () => ({}),
});
