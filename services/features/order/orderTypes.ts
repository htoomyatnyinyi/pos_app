export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  subTotal: number;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentMethod: string;
  paidAmount: number;
  changeAmount: number;
  paymentStatus: string;
  status: string;
  items: OrderItem[];
  createdAt: string;
  userId?: string;
  customerId?: string;
}

export interface CreateOrderPayload {
  subTotal: number;
  taxAmount?: number;
  discountAmount?: number;
  grandTotal: number;
  paymentMethod:
    | "CASH"
    | "KBZ_PAY"
    | "CB_PAY"
    | "WAVE_PAY"
    | "CARD"
    | "MIXED_PAYMENT";
  paidAmount: number;
  changeAmount: number;
  paymentStatus?: string;
  userId: string;
  customerId?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discountAmount?: number;
    subTotal: number;
  }[];
}
