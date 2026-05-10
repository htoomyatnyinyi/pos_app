import { useGetOrdersQuery } from "@/services/features/order/orderApi";
import { useGetProductsQuery } from "@/services/features/products/productApi";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const { data: productsData = [] } = useGetProductsQuery();
  const { data: ordersData = [] } = useGetOrdersQuery();
  const [products, setProducts] = useState(productsData);

  const [cart, setCart] = useState<
    {
      id: string;
      name: string;
      price: number;
      quantity: number;
    }[]
  >([]);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setProducts(productsData);
  }, [productsData]);

  const totalRevenue = ordersData.reduce(
    (sum, order) => sum + (order.grandTotal ?? 0),
    0,
  );

  const totalExpenses = 0;

  const totalOrders = ordersData.length;

  const lowStockCount = products.filter(
    (product) => product.stockQuantity < 5,
  ).length;

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [products, searchQuery],
  );

  const addToCart = (product: any) => {
    if (product.stockQuantity <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.sellingPrice,
          quantity: 1,
        },
      ];
    });

    setProducts((prev) =>
      prev.map((item) =>
        item.id === product.id
          ? {
              ...item,
              stockQuantity: item.stockQuantity - 1,
            }
          : item,
      ),
    );
  };

  const productList =
    filteredProducts.length === 0 ? (
      <Text className="text-slate-500 text-center py-4">
        No products found matching your search.
      </Text>
    ) : (
      filteredProducts.map((product) => (
        <View
          key={product.id}
          className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="font-semibold text-slate-900">
                {product.name}
              </Text>

              <Text className="text-slate-500 mt-1">
                Stock: {product.stockQuantity}
              </Text>
            </View>

            <View className="items-end">
              <Text className="font-bold text-slate-900">
                ${product.sellingPrice.toFixed(2)}
              </Text>

              <TouchableOpacity
                disabled={product.stockQuantity <= 0}
                onPress={() => addToCart(product)}
                className={`mt-2 rounded-2xl px-4 py-2 ${
                  product.stockQuantity <= 0 ? "bg-slate-300" : "bg-blue-600"
                }`}>
                <Text className="text-white font-semibold">
                  {product.stockQuantity <= 0 ? "Out of stock" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))
    );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar style="dark" />

      <View className="px-6 py-5 bg-white border-b border-slate-200">
        <Text className="text-3xl font-bold text-slate-900">Mini Shop POS</Text>

        <Text className="text-slate-500 mt-2">
          A simple point of sale dashboard with stock, product CRUD, order
          history, and finance.
        </Text>
      </View>

      <ScrollView className="px-6 pt-4 pb-24">
        {/* Dashboard Cards */}
        <View className="grid-cols-2 gap-4">
          <View className="mb-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
            <Text className="text-slate-500">Revenue</Text>

            <Text className="mt-4 text-3xl font-bold text-slate-900">
              ${totalRevenue.toFixed(2)}
            </Text>
          </View>

          <View className="mb-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
            <Text className="text-slate-500">Expenses</Text>

            <Text className="mt-4 text-3xl font-bold text-slate-900">
              ${totalExpenses.toFixed(2)}
            </Text>
          </View>

          <View className="mb-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
            <Text className="text-slate-500">Orders</Text>

            <Text className="mt-4 text-3xl font-bold text-slate-900">
              {totalOrders}
            </Text>
          </View>

          <View className="mb-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
            <Text className="text-slate-500">Low stock</Text>

            <Text className="mt-4 text-3xl font-bold text-slate-900">
              {lowStockCount}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mt-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
          <Text className="text-xl font-bold text-slate-900">
            Quick actions
          </Text>

          <View className="mt-4 flex-row flex-wrap gap-3">
            <TouchableOpacity
              onPress={() => router.push("/stock")}
              className="rounded-2xl bg-blue-600 px-4 py-3">
              <Text className="text-white font-semibold">View stock</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/add")}
              className="rounded-2xl bg-slate-900 px-4 py-3">
              <Text className="text-white font-semibold">Add product</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/notification")}
              className="rounded-2xl bg-slate-100 px-4 py-3">
              <Text className="font-semibold text-slate-900">
                Order history
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/finance")}
              className="rounded-2xl bg-slate-100 px-4 py-3">
              <Text className="font-semibold text-slate-900">Finance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* POS Panel */}
        <View className="mt-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
          <Text className="text-xl font-bold text-slate-900">
            POS Selling Panel
          </Text>

          {/* Search Bar */}
          <View className="mt-4">
            <TextInput
              className="rounded-2xl bg-slate-100 px-4 py-3 border border-slate-200"
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View className="mt-4 space-y-4">{productList}</View>

          {/* Cart */}
          <View className="mt-6 border-t border-slate-200 pt-4">
            <Text className="text-xl font-bold text-slate-900">
              Current Order
            </Text>

            {cart.length === 0 ? (
              <Text className="text-slate-500 mt-2">No products selected.</Text>
            ) : (
              <>
                {cart.map((item) => (
                  <View key={item.id} className="flex-row justify-between mt-3">
                    <Text className="text-slate-700">
                      {item.name} x {item.quantity}
                    </Text>

                    <Text className="font-semibold text-slate-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}

                <View className="flex-row justify-between mt-5 border-t border-slate-200 pt-4">
                  <Text className="text-2xl font-bold text-slate-900">
                    Total
                  </Text>

                  <Text className="text-2xl font-bold text-blue-600">
                    ${cartTotal.toFixed(2)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
