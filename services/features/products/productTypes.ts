export type Product = {
  id: string;

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

  createdAt?: string;
  updatedAt?: string;

  // frontend-only optional fields
  originalPrice?: number;
  price?: number;
  stock?: number;
  imageUrl?: string;
};
