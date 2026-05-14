import React, { useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useCreateOrderMutation } from "@/services/features/order/orderApi";
import { useAppSelector } from "@/hooks/redux-hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/redux-hooks/useAppDispatch";
import { clearCart } from "@/services/features/cart/cartSlice";
import { Alert } from "react-native";

const Checkout = () => {
  const params = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();

  const cartItems = JSON.parse(params.cart || "[]");

  const totalAmount = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + (item.sellingPrice || item.price) * item.qty,
      0,
    );
  }, [cartItems]);

  const [payAmount, setPayAmount] = useState("");

  const handleCompletePayment = async () => {
    if (!payAmount || Number(payAmount) < totalAmount) {
      Alert.alert("Error", "Insufficient payment amount.");
      return;
    }

    try {
      const payload = {
        subTotal: totalAmount,
        grandTotal: totalAmount,
        paymentMethod: "CASH",
        paidAmount: Number(payAmount),
        changeAmount: Number(payAmount) - totalAmount,
        userId: user?.id || "",
        items: cartItems.map((item) => ({
          productId: item.productId || item.id,
          quantity: item.qty,
          unitPrice: item.sellingPrice || item.price,
          subTotal: (item.sellingPrice || item.price) * item.qty,
        })),
      };

      await createOrder(payload).unwrap();

      Alert.alert("Success", "Payment completed successfully!", [
        {
          text: "OK",
          onPress: () => {
            dispatch(clearCart());
            router.replace("/");
          },
        },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to process payment. Please try again.");
    }
  };

  const returnAmount = Number(payAmount || 0) - totalAmount;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* HEADER */}
      <View className="px-6 pt-10 pb-5">
        <Text className="text-4xl font-black text-slate-900">Checkout</Text>

        <Text className="text-slate-400 mt-2">Payment & Receipt</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
      >
        {/* SLIP */}
        <View className="bg-white rounded-3xl p-5 border border-slate-200">
          <Text className="text-xl font-black mb-5">Receipt Slip</Text>

          {cartItems.map((item) => (
            <View key={item.id} className="flex-row justify-between mb-4">
              <View>
                <Text className="font-bold text-slate-900">
                  {item.categories}
                </Text>

                <Text className="text-slate-400">
                  {item.qty} x {item.sellingPrice}
                </Text>
              </View>

              <Text className="font-black text-slate-900">
                {item.qty * item.sellingPrice} MMK
              </Text>
            </View>
          ))}

          {/* TOTAL */}
          <View className="border-t border-dashed border-slate-300 pt-4 mt-4">
            <View className="flex-row justify-between">
              <Text className="text-lg font-black">Total</Text>

              <Text className="text-lg font-black">{totalAmount} MMK</Text>
            </View>
          </View>
        </View>

        {/* PAYMENT */}
        <View className="bg-white rounded-3xl p-5 border border-slate-200 mt-5">
          <Text className="text-xl font-black mb-4">Payment</Text>

          <Text className="text-slate-500 mb-2">Customer Pay Amount</Text>

          <TextInput
            keyboardType="numeric"
            placeholder="Enter pay amount"
            value={payAmount}
            onChangeText={setPayAmount}
            className="border border-slate-300 rounded-2xl px-4 py-4 text-lg"
          />

          <View className="mt-5">
            <View className="flex-row justify-between mb-3">
              <Text className="font-bold text-slate-600">Total Amount</Text>

              <Text className="font-black text-slate-900">
                {totalAmount} MMK
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="font-bold text-slate-600">Return Amount</Text>

              <Text
                className={`font-black text-xl ${
                  returnAmount < 0 ? "text-red-500" : "text-green-600"
                }`}
              >
                {returnAmount > 0 ? returnAmount : 0} MMK
              </Text>
            </View>
          </View>
        </View>

        {/* CHECKOUT BUTTON */}
        <View className="flex-row gap-4 mt-6">
          {/* Cancel Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            className="flex-1 bg-slate-200 py-5 rounded-3xl items-center"
          >
            <Text className="text-slate-900 text-lg font-black">Cancel</Text>
          </TouchableOpacity>

          {/* Complete Payment Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCompletePayment}
            disabled={isCreating}
            className={`flex-1 py-5 rounded-3xl items-center ${isCreating ? "bg-slate-400" : "bg-slate-900"}`}
          >
            <Text className="text-white text-lg font-black">
              {isCreating ? "Processing..." : "Complete Payment"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Checkout;
