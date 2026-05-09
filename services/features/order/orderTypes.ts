import { CartItem } from "../cart/cartTypes";

export interface Order {
  id: number;
  total: number;
  items: CartItem[];
  createdAt: string;
}

export interface CreateOrderPayload {
  items: CartItem[];
  total: number;
}
