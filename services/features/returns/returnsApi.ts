import { posApi } from "@/services/api/posApi";

export const returnsApi = posApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    processReturn: builder.mutation<any, { orderId: string; reason: string; customerId?: string }>({
      query: (body) => ({
        url: "/returns",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Orders", "Products"],
    }),
  }),
});

export const {
  useProcessReturnMutation,
} = returnsApi;
