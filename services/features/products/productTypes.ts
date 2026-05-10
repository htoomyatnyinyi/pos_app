export interface Product {
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
  createdAt: string;
}
