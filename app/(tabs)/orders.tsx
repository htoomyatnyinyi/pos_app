import React, { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Alert, Modal } from "react-native";
import { useGetOrdersQuery } from "@/services/features/order/orderApi";
import { useProcessReturnMutation } from "@/services/features/returns/returnsApi";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const STATUS_STYLING: Record<string, { bg: string, text: string, dot: string }> = {
  COMPLETED: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-500" },
  PENDING: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-500" },
  CANCELLED: { bg: "bg-rose-500/10", text: "text-rose-400", dot: "bg-rose-500" },
};

export default function OrdersScreen() {
  const { data: orders, isLoading, error, refetch, isFetching } = useGetOrdersQuery();
  const [processReturn, { isLoading: isRefunding }] = useProcessReturnMutation();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const handleRefund = () => {
    Alert.alert("Refund Order", "Are you sure you want to refund this entire transaction? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Confirm Refund", style: "destructive", onPress: async () => {
        try {
          await processReturn({ orderId: selectedOrder.id, reason: "Customer requested refund" }).unwrap();
          Alert.alert("Success", "Transaction has been fully refunded.");
          setSelectedOrder(null);
          refetch();
        } catch (err) {
          Alert.alert("Error", "Failed to process refund.");
        }
      }}
    ]);
  };

  const handleExport = async () => {
    if (!orders || orders.length === 0) {
      Alert.alert("Export Error", "No transactions to export.");
      return;
    }
    try {
      const csvHeader = "Order ID,Date,Status,Total Amount,Items Summary\n";
      const csvRows = orders.map(order => {
        const date = new Date(order.createdAt).toLocaleString();
        const total = order.items.reduce((acc, item) => acc + item.quantity * Number(item?.product?.sellingPrice || 0), 0);
        const itemSummary = order.items.map(i => `${i.quantity}x ${i.product?.name}`).join(" | ");
        return `"${order.id}","${date}","${order.status}","${total.toFixed(2)}","${itemSummary}"`;
      }).join("\n");
      
      const csvString = csvHeader + csvRows;
      // @ts-ignore
      const filePath = `${FileSystem.documentDirectory}sales_audit_${Date.now()}.csv`;
      
      await FileSystem.writeAsStringAsync(filePath, csvString, { encoding: 'utf8' });
      await Sharing.shareAsync(filePath, { dialogTitle: "Export Sales Audit" });
    } catch (error) {
      Alert.alert("Export Failed", "Failed to generate the audit record.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1a1c24]">
      {/* Header */}
      <View className="px-6 py-6 bg-[#1a1c24] border-b border-slate-800 flex-row justify-between items-center">
        <View>
          <Text className="text-3xl font-bold text-slate-100 tracking-tight">Sales</Text>
          <Text className="text-[10px] font-bold text-slate-500 tracking-[3px] uppercase mt-1">Audit & Records</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-700">
            <Text className="text-indigo-400 font-black text-sm">{orders?.length || 0}</Text>
          </View>
          <TouchableOpacity onPress={handleExport} className="bg-indigo-500/10 px-4 py-2.5 rounded-2xl border border-indigo-500/20">
            <Text className="text-indigo-400 font-bold text-sm">Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#6366f1" /></View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#6366f1" />}
        >
          {orders?.length === 0 ? (
            <View className="items-center py-24 opacity-30">
              <Text className="text-7xl mb-6">🧾</Text>
              <Text className="text-slate-100 font-bold text-lg">No Transactions</Text>
            </View>
          ) : (
            orders?.map((order, idx) => {
              const st = STATUS_STYLING[order.status] || STATUS_STYLING.PENDING;
              const total = order.items.reduce((acc, item) => acc + item.quantity * Number(item?.product?.sellingPrice || 0), 0);
              
              return (
                <Animated.View key={order.id} entering={FadeInDown.duration(400).delay(idx * 40)}>
                  <TouchableOpacity activeOpacity={0.8} onPress={() => setSelectedOrder(order)} className="bg-[#252833] p-6 rounded-[32px] mb-5 border border-slate-800/50">
                    <View className="flex-row justify-between items-start mb-5">
                      <View>
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text className="text-slate-100 font-bold text-xl">#{order.id.slice(-6).toUpperCase()}</Text>
                          <View className={`px-2.5 py-1 rounded-lg flex-row items-center gap-1.5 ${st.bg}`}>
                            <View className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            <Text className={`text-[9px] font-black tracking-widest uppercase ${st.text}`}>{order.status}</Text>
                          </View>
                        </View>
                        <Text className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                          {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </Text>
                      </View>
                      <Text className="text-slate-100 font-black text-2xl">${total.toFixed(2)}</Text>
                    </View>
                    
                    <View className="flex-row flex-wrap gap-2.5">
                      {order.items.slice(0, 3).map((item, i) => (
                        <View key={i} className="bg-[#1a1c24] px-4 py-2 rounded-xl border border-slate-800">
                          <Text className="text-slate-400 text-[11px] font-bold">{item.quantity}× {item.product?.name || "Item"}</Text>
                        </View>
                      ))}
                      {order.items.length > 3 && (
                        <View className="bg-[#1a1c24] px-4 py-2 rounded-xl border border-slate-800">
                          <Text className="text-slate-600 text-[11px] font-bold">+{order.items.length - 3}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Digital Receipt Modal */}
      <Modal visible={!!selectedOrder} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedOrder(null)}>
        <View className="flex-1 bg-[#1a1c24]">
          <View className="px-6 py-6 bg-[#1a1c24] border-b border-slate-800 flex-row justify-between items-center">
            <Text className="text-2xl font-black text-slate-100">Digital Receipt</Text>
            <TouchableOpacity onPress={() => setSelectedOrder(null)} className="bg-slate-800 w-10 h-10 rounded-full items-center justify-center">
              <Text className="text-slate-400 font-bold text-xl">×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 pt-6">
            <Animated.View entering={FadeInUp.duration(400)} className="bg-[#252833] rounded-[32px] p-8 border border-slate-700 shadow-2xl mb-8">
              <View className="items-center mb-8">
                <Text className="text-slate-100 text-3xl font-black tracking-tight mb-2">MidnightCorner</Text>
                <Text className="text-slate-500 font-bold text-xs uppercase tracking-[3px]">Official Receipt</Text>
              </View>

              <View className="flex-row justify-between mb-8 border-b border-slate-700/50 pb-6">
                <View>
                  <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Date</Text>
                  <Text className="text-slate-100 font-bold text-sm">
                    {selectedOrder && new Date(selectedOrder.createdAt).toLocaleString()}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Order No.</Text>
                  <Text className="text-slate-100 font-bold text-sm">#{selectedOrder?.id?.slice(-6).toUpperCase()}</Text>
                </View>
              </View>

              <View className="mb-6">
                {selectedOrder?.items.map((item: any, idx: number) => {
                  const subTotal = item.quantity * Number(item.product?.sellingPrice || 0);
                  return (
                    <View key={idx} className="flex-row justify-between items-center mb-4">
                      <View className="flex-1">
                        <Text className="text-slate-100 font-bold text-base">{item.product?.name}</Text>
                        <Text className="text-slate-500 font-bold text-xs">{item.quantity} x ${Number(item.product?.sellingPrice || 0).toFixed(2)}</Text>
                      </View>
                      <Text className="text-slate-100 font-black text-lg">${subTotal.toFixed(2)}</Text>
                    </View>
                  );
                })}
              </View>

              <View className="border-t border-slate-700/50 pt-6 mt-2">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-slate-400 font-bold text-sm">Payment Method</Text>
                  <Text className="text-slate-100 font-bold text-sm">{selectedOrder?.paymentMethod}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-slate-400 font-bold text-sm">Status</Text>
                  <Text className="text-indigo-400 font-bold text-sm">{selectedOrder?.status}</Text>
                </View>
              </View>

              <View className="bg-[#1a1c24] mt-8 p-6 rounded-2xl border border-slate-800 flex-row justify-between items-center">
                <Text className="text-slate-500 font-black text-sm uppercase tracking-widest">Total</Text>
                <Text className="text-3xl font-black text-indigo-400">
                  ${selectedOrder?.items.reduce((acc: number, item: any) => acc + item.quantity * Number(item.product?.sellingPrice || 0), 0).toFixed(2)}
                </Text>
              </View>

              {selectedOrder?.status !== "REFUNDED" && (
                <TouchableOpacity 
                  onPress={handleRefund} disabled={isRefunding}
                  className="mt-6 bg-rose-500/10 py-5 rounded-2xl items-center border border-rose-500/20"
                >
                  {isRefunding ? <ActivityIndicator color="#fb7185" /> : <Text className="text-rose-400 font-black tracking-widest uppercase">Refund Transaction</Text>}
                </TouchableOpacity>
              )}
            </Animated.View>
          </ScrollView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
