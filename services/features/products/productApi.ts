import { posApi } from "@/services/api/posApi";

import { Product } from "./productTypes";

export const productApi = posApi.injectEndpoints({
  overrideExisting: false,

  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => "/products",

      providesTags: ["Products"],
    }),

    getProductById: builder.query<Product, number>({
      query: (id) => `/products/${id}`,
    }),

    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),

      invalidatesTags: ["Products"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
} = productApi;
