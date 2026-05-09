import { MOCK_PRODUCTS } from "@/services/mock/mockData";
import { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";

export default function StockScreen() {
  const [query, setQuery] = useState("");

  const products = useMemo(
    () =>
      MOCK_PRODUCTS.filter((product) =>
        [product.name, product.category]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 py-5 bg-white border-b border-slate-200">
        <Text className="text-3xl font-bold text-slate-900">Stock</Text>
        <Text className="text-slate-500 mt-1">
          Monitor inventory levels and identify low-stock items.
        </Text>
      </View>

      <View className="px-6 py-4 bg-white border-b border-slate-200">
        <TextInput
          placeholder="Search by name or category"
          value={query}
          onChangeText={setQuery}
          className="bg-slate-100 rounded-2xl px-4 py-3 text-slate-900"
        />
      </View>

      <ScrollView className="px-6 pt-4">
        {products.map((product) => (
          <View
            key={product.id}
            className="mb-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
            <View className="flex-row justify-between items-start gap-4">
              <View className="flex-1">
                <Text className="text-xl font-bold text-slate-900">
                  {product.name}
                </Text>
                <Text className="text-slate-500 mt-1">{product.category}</Text>
              </View>
              <View className="rounded-2xl px-3 py-2 bg-slate-100">
                <Text className="font-semibold text-slate-800">
                  ${product.price.toFixed(2)}
                </Text>
              </View>
            </View>

            <View className="mt-5 flex-row justify-between items-center">
              <View>
                <Text className="text-slate-500">Stock</Text>
                <Text className="text-2xl font-bold text-slate-900">
                  {product.stock}
                </Text>
              </View>
              <View
                className={`rounded-full px-4 py-2 ${
                  product.stock < 5 ? "bg-rose-100" : "bg-emerald-100"
                }`}>
                <Text
                  className={`font-semibold ${
                    product.stock < 5 ? "text-rose-700" : "text-emerald-700"
                  }`}>
                  {product.stock < 5 ? "Reorder" : "Available"}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {products.length === 0 && (
          <View className="mt-12 items-center">
            <Text className="text-slate-500">
              No products match your search.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
