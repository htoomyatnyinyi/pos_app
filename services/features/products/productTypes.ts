export interface Product {
  id: string; // Changed from number to string (cuid)
  name: string;
  price: number;
  stock: number;
  imageUrl?: string; // Changed from image to imageUrl to match schema
}
