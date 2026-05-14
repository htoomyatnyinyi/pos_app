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

    getOrderById: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: ["Orders"],
    }),

    updateOrderStatus: builder.mutation<Order, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Orders"],
    }),

    deleteOrder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} = orderApi;
