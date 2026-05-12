import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  useGetProductsQuery,
  useLazyGetProductByBarcodeQuery,
} from "@/services/features/products/productApi";
import { useCreateOrderMutation } from "@/services/features/order/orderApi";
import { useAppSelector } from "@/hooks/redux-hooks/useAppSelector";
import BarcodeScannerModal from "@/components/BarcodeScannerModal";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CheckoutScreen() {
  const { data: products, isLoading, error } = useGetProductsQuery();
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
  const [lookupBarcode] = useLazyGetProductByBarcodeQuery();
  const user = useAppSelector((state) => state.auth.user);

  const [cart, setCart] = useState<
    { id: string; name: string; price: number; quantity: number }[]
  >([]);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isScannerVisible, setIsScannerVisible] = useState(false);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.sellingPrice),
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        );
      }
      return prev.filter((item) => item.id !== productId);
    });
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleBarcodeScan = async (scannedBarcode: string, type: string) => {
    setIsScannerVisible(false);

    try {
      const result = await lookupBarcode(scannedBarcode).unwrap();

      if (result.found && result.product) {
        // Product found — add to cart
        addToCart(result.product);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Check if already in cart for the message
        const existingItem = cart.find(
          (item) => item.id === result.product!.id,
        );
        const newQty = existingItem ? existingItem.quantity + 1 : 1;

        Alert.alert(
          "✅ Product Added",
          `${result.product.name}\nQuantity: ${newQty}\nPrice: $${Number(result.product.sellingPrice).toFixed(2)}`,
          [
            { text: "Done", style: "default" },
            { text: "Scan More", onPress: () => setIsScannerVisible(true) },
          ],
        );
      } else {
        // Product not found
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          "❌ Product Not Found",
          `No product with barcode "${scannedBarcode}" exists in inventory.`,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Scan Again", onPress: () => setIsScannerVisible(true) },
          ],
        );
      }
    } catch (err: any) {
      // 404 or network error
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "❌ Product Not Found",
        `No product with barcode "${scannedBarcode}" exists in inventory.\n\nAdd it in the Products tab first, then scan again.`,
        [
          { text: "OK", style: "default" },
          { text: "Scan Again", onPress: () => setIsScannerVisible(true) },
        ],
      );
    }
  };

  const handleCharge = async () => {
    if (cart.length === 0) return;
    if (!user) {
      Alert.alert("Error", "Please login to process orders.");
      return;
    }

    try {
      await createOrder({
        subTotal: totalAmount,
        grandTotal: totalAmount,
        paymentMethod: "CASH",
        paidAmount: totalAmount,
        changeAmount: 0,
        userId: user.id,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          subTotal: item.price * item.quantity,
        })),
      }).unwrap();

      Alert.alert("Success", "Order completed successfully!");
      setCart([]);
      setIsCartVisible(false);
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message || "Failed to create order");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />

      {/* --- HEADER --- */}
      <View className="px-6 py-4 bg-white border-b border-slate-200 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-slate-800">
            MidnightCorner
          </Text>
          <Text className="text-slate-400 text-xs uppercase tracking-widest font-semibold">
            Point of Sale
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          {/* Scan Button */}
          <TouchableOpacity
            onPress={() => setIsScannerVisible(true)}
            activeOpacity={0.7}
            className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center shadow-sm"
          >
            <Text className="text-white text-lg">📷</Text>
          </TouchableOpacity>
          {/* Profile */}
          <TouchableOpacity className="w-10 h-10 bg-slate-900 rounded-full items-center justify-center">
            <Text className="text-white font-bold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- PRODUCT GRID --- */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-red-500 font-bold text-center">
            Failed to load products. Please check your backend connection.
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4">
          {/* Quick Scan Banner */}
          <TouchableOpacity
            onPress={() => setIsScannerVisible(true)}
            activeOpacity={0.8}
            className="bg-linear-to-r bg-blue-500 p-4 rounded-2xl mb-4 flex-row items-center justify-center shadow-sm"
          >
            <Text className="text-2xl mr-3">📱</Text>
            <View>
              <Text className="text-white font-black text-lg">
                Scan Barcode to Add
              </Text>
              <Text className="text-blue-100 font-medium text-sm">
                Tap to open camera scanner
              </Text>
            </View>
          </TouchableOpacity>

          <View className="flex-row flex-wrap justify-between">
            {products?.map((product) => (
              <TouchableOpacity
                key={product.id}
                onPress={() => addToCart(product)}
                activeOpacity={0.7}
                className="bg-white p-3 rounded-2xl w-[48%] mb-4 shadow-sm border border-slate-100"
              >
                <View className="w-full aspect-square bg-slate-50 rounded-xl mb-3 items-center justify-center">
                  <Text className="text-4xl">☕</Text>
                </View>
                <Text
                  className="font-bold text-slate-800 text-lg"
                  numberOfLines={1}
                >
                  {product.name}
                </Text>
                <Text className="text-blue-600 font-black text-md mt-1">
                  ${Number(product.sellingPrice).toFixed(2)}
                </Text>
                {product.barcode && (
                  <Text
                    className="text-slate-400 text-xs mt-1"
                    numberOfLines={1}
                  >
                    📱 {product.barcode}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <View className="h-24" />
        </ScrollView>
      )}

      {/* --- BOTTOM SUMMARY BAR --- */}
      {totalItems > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 pb-8 flex-row justify-between items-center shadow-lg">
          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase">
              {totalItems} Items
            </Text>
            <Text className="text-2xl font-black text-slate-900">
              ${totalAmount?.toFixed?.(2) || "0.00"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsCartVisible(true)}
            className="bg-slate-900 px-8 py-4 rounded-2xl"
          >
            <Text className="text-white font-bold text-lg">View Order</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --- CART MODAL --- */}
      <Modal
        visible={isCartVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsCartVisible(false)}
      >
        <View className="flex-1 bg-white p-6">
          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-3xl font-black text-slate-900">
              Current Order
            </Text>
            <TouchableOpacity onPress={() => setIsCartVisible(false)}>
              <Text className="text-slate-400 font-bold text-lg">Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1">
            {cart.map((item) => (
              <View
                key={item.id}
                className="flex-row justify-between items-center mb-6 pb-6 border-b border-slate-50"
              >
                <View className="flex-row items-center flex-1">
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.id)}
                    className="bg-red-50 w-8 h-8 rounded-lg items-center justify-center mr-2"
                  >
                    <Text className="text-red-500 font-black">−</Text>
                  </TouchableOpacity>
                  <View className="bg-slate-50 w-12 h-12 rounded-lg items-center justify-center mr-4">
                    <Text className="font-bold text-slate-900">
                      {item.quantity}x
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-lg font-bold text-slate-800"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text className="text-slate-400 font-medium">
                      ${item.price?.toFixed?.(2) || "0.00"} each
                    </Text>
                  </View>
                </View>
                <Text className="text-lg font-black text-slate-900">
                  $
                  {((item.price || 0) * (item.quantity || 0))?.toFixed?.(2) ||
                    "0.00"}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View className="pt-6 border-t border-slate-100">
            <View className="flex-row justify-between mb-6">
              <Text className="text-xl text-slate-500 font-medium">
                Total Amount
              </Text>
              <Text className="text-3xl font-black text-slate-900">
                ${totalAmount?.toFixed?.(2) || "0.00"}
              </Text>
            </View>

            {/* Scan more button in cart */}
            <TouchableOpacity
              className="p-4 rounded-2xl items-center mb-3 bg-blue-50 flex-row justify-center"
              onPress={() => {
                setIsCartVisible(false);
                setTimeout(() => setIsScannerVisible(true), 300);
              }}
            >
              <Text className="text-2xl mr-2">📷</Text>
              <Text className="text-blue-600 font-bold text-lg">
                Scan More Items
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`p-5 rounded-2xl items-center ${isCreating ? "bg-slate-400" : "bg-slate-900"}`}
              onPress={handleCharge}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-black text-xl">
                  Confirm & Charge
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        visible={isScannerVisible}
        onClose={() => setIsScannerVisible(false)}
        onScanned={handleBarcodeScan}
        title="Scan to Add to Cart"
      />
    </SafeAreaView>
  );
}
