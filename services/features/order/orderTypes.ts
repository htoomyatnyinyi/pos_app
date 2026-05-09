import { CartItem } from "../cart/cartTypes";

export interface Order {
  id: string; // Changed from number to string (cuid)
  totalAmount: number; // Changed from total to totalAmount
  status: string; // Added status
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  productId: string;
}

export interface CreateOrderPayload {
  items: {
    id: string;
    qty: number;
    price: number;
  }[];
  total: number;
  userId?: string; // Added userId requirement from new schema
}
