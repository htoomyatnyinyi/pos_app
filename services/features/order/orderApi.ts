import { posApi } from "@/services/api/posApi";

import { Order, CreateOrderPayload } from "./orderTypes";

export const orderApi = posApi.injectEndpoints({
  overrideExisting: false,

  endpoints: (builder) => ({
    getOrders: builder.query<Order[], void>({
      query: () => "/orders",

      providesTags: ["Orders"],
    }),

    createOrder: builder.mutation<Order, CreateOrderPayload>({
      query: (body) => ({
        url: "/orders",
        method: "POST",
        body,
      }),

      invalidatesTags: ["Orders", "Products"],
    }),
  }),
});

export const { useGetOrdersQuery, useCreateOrderMutation } = orderApi;
