import React from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useGetOrdersQuery } from "@/services/features/order/orderApi";

export default function OrdersScreen() {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-8 pt-10 pb-6">
        <Text className="text-4xl font-black text-slate-900 tracking-tight">Sales History</Text>
        <Text className="text-slate-400 font-medium text-sm uppercase tracking-widest mt-1">Review your recent transactions</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-red-500 font-bold text-lg text-center">Error loading orders. Please try again.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 40 }}>
          {orders?.length === 0 ? (
            <View className="items-center justify-center py-20 opacity-40">
              <Text className="text-6xl mb-4">📋</Text>
              <Text className="text-slate-500 font-bold text-lg">No orders found</Text>
            </View>
          ) : (
            orders?.map((order) => (
              <TouchableOpacity
                key={order.id}
                activeOpacity={0.7}
                className="bg-white p-6 rounded-3xl mb-4 shadow-sm border border-slate-100 flex-row justify-between items-center"
              >
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-slate-900 font-black text-xl mr-2">Order #{order.id.slice(-6).toUpperCase()}</Text>
                    <View className={`px-3 py-1 rounded-full ${order.status === 'COMPLETED' ? 'bg-green-100' : 'bg-orange-100'}`}>
                      <Text className={`text-xs font-bold ${order.status === 'COMPLETED' ? 'text-green-700' : 'text-orange-700'}`}>
                        {order.status}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-slate-400 font-medium text-sm">
                    {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-slate-900 font-black text-2xl">${order.totalAmount.toFixed(2)}</Text>
                  <Text className="text-slate-400 font-bold text-xs uppercase tracking-tighter">
                    {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
