export type ShopProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
};

export type ShopNotification = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "order" | "stock" | "finance";
};

export type FinanceRecord = {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: "income" | "expense";
  category: string;
};

export const MOCK_PRODUCTS: ShopProduct[] = [
  {
    id: "p-1001",
    name: "Espresso Shot",
    category: "Beverages",
    price: 3.0,
    stock: 18,
    sold: 128,
  },
  {
    id: "p-1002",
    name: "Iced Latte",
    category: "Beverages",
    price: 4.5,
    stock: 8,
    sold: 96,
  },
  {
    id: "p-1003",
    name: "Croissant",
    category: "Bakery",
    price: 3.5,
    stock: 4,
    sold: 72,
  },
  {
    id: "p-1004",
    name: "Blueberry Muffin",
    category: "Bakery",
    price: 2.75,
    stock: 10,
    sold: 48,
  },
  {
    id: "p-1005",
    name: "Bottle Water",
    category: "Retail",
    price: 1.5,
    stock: 24,
    sold: 140,
  },
];

export const MOCK_NOTIFICATIONS: ShopNotification[] = [
  {
    id: "n-2001",
    title: "New order received",
    description: "Order #453 was paid successfully.",
    time: "2m ago",
    type: "order",
  },
  {
    id: "n-2002",
    title: "Low stock alert",
    description: "Croissant stock is below 5 units.",
    time: "25m ago",
    type: "stock",
  },
  {
    id: "n-2003",
    title: "Expense recorded",
    description: "Supplier payment of $120 has been logged.",
    time: "1h ago",
    type: "finance",
  },
  {
    id: "n-2004",
    title: "Daily sales summary",
    description: "Yesterday sales reached $480.",
    time: "3h ago",
    type: "finance",
  },
  {
    id: "n-2005",
    title: "New product added",
    description: '"Apricot Jam" was added to the inventory.',
    time: "5h ago",
    type: "order",
  },
];

export const MOCK_FINANCE_HISTORY: FinanceRecord[] = [
  {
    id: "f-3001",
    title: "Credit card sales",
    amount: 420.0,
    date: "May 8",
    type: "income",
    category: "Sales",
  },
  {
    id: "f-3002",
    title: "Coffee bean restock",
    amount: -95.0,
    date: "May 8",
    type: "expense",
    category: "Inventory",
  },
  {
    id: "f-3003",
    title: "Cash register deposit",
    amount: 330.0,
    date: "May 7",
    type: "income",
    category: "Sales",
  },
  {
    id: "f-3004",
    title: "Electricity bill",
    amount: -45.0,
    date: "May 6",
    type: "expense",
    category: "Utilities",
  },
  {
    id: "f-3005",
    title: "Mobile order payment",
    amount: 220.0,
    date: "May 6",
    type: "income",
    category: "Sales",
  },
];
