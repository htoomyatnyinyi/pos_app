import { posApi } from "@/services/api/posApi";

import { Product } from "./productTypes";

export type CreateProductPayload = {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  brand?: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  categoryId: string;
  supplierId?: string;
};

export type UpdateProductPayload = {
  id: string;
  data: Partial<CreateProductPayload>;
};

export const productApi = posApi.injectEndpoints({
  overrideExisting: false,

  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => "/products",

      providesTags: ["Products"],
    }),

    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
    }),

    createProduct: builder.mutation<Product, CreateProductPayload>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),

      invalidatesTags: ["Products"],
    }),

    updateProduct: builder.mutation<Product, UpdateProductPayload>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Products"],
    }),

    deleteProduct: builder.mutation<Product, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;