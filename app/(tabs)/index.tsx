import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StatusBar, Modal,
  ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import {
  useGetProductsQuery,
  useLazyGetProductByBarcodeQuery,
} from "@/services/features/products/productApi";
import { useGetCategoriesQuery } from "@/services/features/categories/categoryApi";
import { useCreateOrderMutation } from "@/services/features/order/orderApi";
import { useGetCustomersQuery } from "@/services/features/customers/customerApi";
import { useGetActiveSessionQuery } from "@/services/features/sessions/sessionApi";
import { useAppSelector } from "@/hooks/redux-hooks/useAppSelector";
import BarcodeScannerModal from "@/components/BarcodeScannerModal";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";

type CartItem = { id: string; name: string; price: number; quantity: number };

const PAYMENT_METHODS = ["CASH", "KBZ_PAY", "WAVE_PAY", "CARD"];

export default function CheckoutScreen() {
  const { data: products, isLoading } = useGetProductsQuery();
  const { data: categories } = useGetCategoriesQuery();
  const { data: customers } = useGetCustomersQuery();
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
   const [lookupBarcode] = useLazyGetProductByBarcodeQuery();
  const user = useAppSelector((s) => s.auth.user);
  const { data: activeSession } = useGetActiveSessionQuery(user?.id || "", { skip: !user?.id });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  
  // Advanced Checkout State
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [paidAmount, setPaidAmount] = useState("");
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<any>(null);

  const addToCart = (product: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { id: product.id, name: product.name, price: Number(product.sellingPrice), quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i));
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const totalAmount = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const changeAmount = Number(paidAmount) > totalAmount ? Number(paidAmount) - totalAmount : 0;

  const handleBarcodeScan = async (barcode: string, type: string, continuous?: boolean) => {
    // Only close the scanner if we are NOT in continuous mode
    if (!continuous) {
      setIsScannerVisible(false);
    }
    
    try {
      const cleanBarcode = barcode.trim();
      const result = await lookupBarcode(cleanBarcode).unwrap();
      
      if (result.found && result.product) {
        if (continuous) {
          // In continuous mode, add directly to cart and give haptic feedback
          addToCart(result.product);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          // In single scan mode, show the preview modal
          setTimeout(() => {
            setScannedProduct(result.product);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }, 300);
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Not Found", `No product found with barcode: ${cleanBarcode}`);
      }
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Scan Error", "Could not reach the server.");
    }
  };

  const handleCharge = async () => {
    if (!cart.length) return;
    
    if (!user?.id) {
      Alert.alert("Authentication Required", "Please sign in to process transactions.");
      return;
    }

    if (!activeSession) {
      Alert.alert("Shift Not Started", "Please go to the Admin tab and 'Start Shift' before processing sales.");
      return;
    }

    try {
      await createOrder({
        subTotal: totalAmount, grandTotal: totalAmount, 
        paymentMethod: paymentMethod as any,
        paidAmount: Number(paidAmount) || totalAmount, 
        changeAmount: changeAmount, 
        userId: user.id,
        customerId: selectedCustomerId || undefined,
        items: cart.map((i) => ({ productId: i.id, quantity: i.quantity, unitPrice: i.price, subTotal: i.price * i.quantity })),
      }).unwrap();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCart([]); setIsCartVisible(false); setSelectedCustomerId(null); setPaidAmount("");
      Alert.alert("Success", "Transaction completed successfully!");
    } catch (err: any) {
      Alert.alert("Error", "Failed to process transaction.");
    }
  };

  const filteredProducts = selectedCat ? products?.filter((p) => p.categoryId === selectedCat) : products;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1c24' }}>
      <StatusBar barStyle="light-content" />
  
      {/* HEADER */}
      <View style={{ backgroundColor: '#1a1c24', borderBottomWidth: 1, borderBottomColor: '#1e293b' }} className="px-6 py-5 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-slate-100 tracking-tight">MidnightCorner</Text>
          <Text className="text-[10px] font-bold text-slate-500 tracking-[3px] uppercase mt-0.5">Terminal</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setIsScannerVisible(true)}
          className="w-12 h-12 bg-indigo-500/10 rounded-2xl items-center justify-center border border-indigo-500/20"
        >
          <Text className="text-2xl">📷</Text>
        </TouchableOpacity>
      </View>

      {/* CATEGORY TABS */}
      {categories && categories.length > 0 && (
        <View style={{ backgroundColor: '#1a1c24' }} className="py-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
            <TouchableOpacity 
              onPress={() => setSelectedCat(null)}
              className={`px-6 py-3 rounded-2xl ${!selectedCat ? 'bg-indigo-500' : 'bg-slate-800 border border-slate-700'}`}
            >
              <Text className={`font-bold text-sm ${!selectedCat ? 'text-white' : 'text-slate-400'}`}>All</Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat.id} onPress={() => setSelectedCat(cat.id)}
                className={`px-6 py-3 rounded-2xl ${selectedCat === cat.id ? 'bg-indigo-500' : 'bg-slate-800 border border-slate-700'}`}
              >
                <Text className={`font-bold text-sm ${selectedCat === cat.id ? 'text-white' : 'text-slate-400'}`}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* PRODUCTS GRID */}
      <View className="px-6 mb-2">
        <Text className="text-slate-500 text-[10px] font-black uppercase tracking-[3px]">
          {filteredProducts?.length || 0} Products available
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#6366f1" /></View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-2" contentContainerStyle={{ paddingBottom: 140 }}>
          {(!filteredProducts || filteredProducts.length === 0) ? (
            <View className="flex-1 items-center justify-center py-20 opacity-40">
              <Text className="text-6xl mb-4">🔍</Text>
              <Text className="text-slate-100 font-bold">No products found</Text>
              <Text className="text-slate-500 text-xs mt-1">Try selecting another category</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {filteredProducts.map((product) => {
                const inCart = cart.find((i) => i.id === product.id);
                return (
                  <View key={product.id} className="w-[48%] mb-4">
                    <TouchableOpacity 
                      onPress={() => addToCart(product)} activeOpacity={0.8}
                      style={{ backgroundColor: '#252833', borderColor: '#1e293b', borderWidth: 1 }}
                      className="p-4 rounded-3xl shadow-sm"
                    >
                      <View style={{ backgroundColor: '#1a1c24', borderWidth: 1, borderColor: '#1e293b' }} className="w-full aspect-square rounded-2xl items-center justify-center mb-4 relative">
                        <Text className="text-4xl opacity-80">☕</Text>
                        {inCart && (
                          <View className="absolute -top-2 -right-2 bg-indigo-500 w-8 h-8 rounded-full items-center justify-center shadow-lg border-2 border-[#252833]">
                            <Text className="text-white font-black text-xs">{inCart.quantity}</Text>
                          </View>
                        )}
                      </View>
                      <Text className="font-bold text-slate-200 text-base" numberOfLines={1}>{product.name || 'Unnamed Item'}</Text>
                      <View className="flex-row justify-between items-center mt-2">
                        <Text className="text-indigo-400 font-black text-lg">${Number(product.sellingPrice || 0).toFixed(2)}</Text>
                        <View className={`w-2 h-2 rounded-full ${Number(product.stockQuantity || 0) < 10 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* BOTTOM ACTION BAR */}
      {totalItems > 0 && (
        <Animated.View entering={FadeInDown.duration(400)} className="absolute bottom-6 left-6 right-6">
          <TouchableOpacity 
            onPress={() => setIsCartVisible(true)} activeOpacity={0.9}
            className="bg-indigo-600 p-5 rounded-[32px] flex-row items-center justify-between shadow-2xl shadow-indigo-600/30"
          >
            <View className="flex-row items-center gap-4">
              <View className="bg-white/20 w-12 h-12 rounded-2xl items-center justify-center">
                <Text className="text-white font-black text-lg">{totalItems}</Text>
              </View>
              <View>
                <Text className="text-indigo-200 font-bold text-[10px] uppercase tracking-widest">Active Sale</Text>
                <Text className="text-white font-black text-2xl">${totalAmount.toFixed(2)}</Text>
              </View>
            </View>
            <View className="bg-white/10 px-6 py-3 rounded-2xl border border-white/20">
              <Text className="text-white font-black">View Order</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* CART MODAL */}
      <Modal visible={isCartVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsCartVisible(false)}>
        <View className="flex-1 bg-[#1a1c24]">
          <View className="px-6 py-6 bg-[#1a1c24] border-b border-slate-800 flex-row justify-between items-center z-10">
            <Text className="text-2xl font-black text-slate-100">Review Sale</Text>
            <TouchableOpacity onPress={() => setIsCartVisible(false)} className="bg-slate-800 w-10 h-10 rounded-full items-center justify-center">
              <Text className="text-slate-400 font-bold text-xl">×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
            {/* ITEMS LIST */}
            <View className="px-6 pt-6">
              {cart.map((item) => (
                <Animated.View key={item.id} layout={Layout.springify()} className="bg-[#252833] p-5 rounded-[28px] mb-4 border border-slate-800 flex-row items-center">
                  <View className="bg-[#1a1c24] w-14 h-14 rounded-2xl items-center justify-center mr-4">
                    <Text className="text-2xl">☕</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-100 font-bold text-lg">{item.name}</Text>
                    <Text className="text-slate-500 font-bold text-sm">${item.price.toFixed(2)}</Text>
                  </View>
                  <View className="flex-row items-center bg-[#1a1c24] rounded-2xl p-1 border border-slate-800">
                    <TouchableOpacity onPress={() => removeFromCart(item.id)} className="w-10 h-10 bg-[#252833] rounded-xl items-center justify-center border border-slate-700">
                      <Text className="text-slate-300 font-black">−</Text>
                    </TouchableOpacity>
                    <Text className="px-4 font-black text-slate-100 text-lg">{item.quantity}</Text>
                    <TouchableOpacity onPress={() => addToCart({ id: item.id })} className="w-10 h-10 bg-[#252833] rounded-xl items-center justify-center border border-slate-700">
                      <Text className="text-slate-300 font-black">+</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              ))}
            </View>

            {/* CUSTOMER SELECTION */}
            <View className="px-6 mt-4">
              <Text className="text-slate-600 text-[10px] font-black uppercase tracking-[3px] mb-3 ml-2">Assign Customer</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                <TouchableOpacity 
                  onPress={() => setSelectedCustomerId(null)}
                  className={`px-5 py-3 rounded-2xl border ${!selectedCustomerId ? 'bg-indigo-600 border-indigo-600' : 'bg-[#252833] border-slate-800'}`}
                >
                  <Text className={`font-bold text-sm ${!selectedCustomerId ? 'text-white' : 'text-slate-400'}`}>Guest</Text>
                </TouchableOpacity>
                {customers?.map((cust) => (
                  <TouchableOpacity 
                    key={cust.id} onPress={() => setSelectedCustomerId(cust.id)}
                    className={`px-5 py-3 rounded-2xl border ${selectedCustomerId === cust.id ? 'bg-indigo-600 border-indigo-600' : 'bg-[#252833] border-slate-800'}`}
                  >
                    <Text className={`font-bold text-sm ${selectedCustomerId === cust.id ? 'text-white' : 'text-slate-400'}`}>{cust.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* PAYMENT METHOD SELECTION */}
            <View className="px-6 mt-8">
              <Text className="text-slate-600 text-[10px] font-black uppercase tracking-[3px] mb-3 ml-2">Payment Method</Text>
              <View className="flex-row flex-wrap gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <TouchableOpacity 
                    key={method} onPress={() => setPaymentMethod(method)}
                    className={`px-5 py-3 rounded-2xl border ${paymentMethod === method ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-[#252833] border-slate-800'}`}
                  >
                    <Text className={`font-bold text-sm ${paymentMethod === method ? 'text-emerald-400' : 'text-slate-400'}`}>{method.replace("_", " ")}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* CASH RECEIVED INPUT */}
            {paymentMethod === "CASH" && (
              <View className="px-6 mt-8">
                <Text className="text-slate-600 text-[10px] font-black uppercase tracking-[3px] mb-3 ml-2">Cash Received</Text>
                <View className="bg-[#252833] p-6 rounded-[32px] border border-slate-800 shadow-2xl">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-slate-500 font-bold">Received</Text>
                    <TextInput
                      value={paidAmount}
                      onChangeText={setPaidAmount}
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor="#475569"
                      className="text-white text-4xl font-black text-right min-w-[150px]"
                    />
                  </View>

                  {/* QUICK CASH BUTTONS */}
                  <View className="flex-row flex-wrap gap-2 mb-6">
                    {[5, 10, 20, 50, 100].map((amt) => (
                      <TouchableOpacity 
                        key={amt} 
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          setPaidAmount(amt.toString());
                        }}
                        className="bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700"
                      >
                        <Text className="text-slate-300 font-black text-xs">${amt}</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity 
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setPaidAmount(totalAmount.toString());
                      }}
                      className="bg-indigo-500/20 px-4 py-2.5 rounded-xl border border-indigo-500/30"
                    >
                      <Text className="text-indigo-400 font-black text-xs">Exact</Text>
                    </TouchableOpacity>
                  </View>

                  <View className="pt-5 border-t border-slate-800/50 flex-row justify-between items-center">
                    <View>
                      <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Change Due</Text>
                      <Text className={`font-black text-3xl mt-1 ${changeAmount > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                        ${changeAmount.toFixed(2)}
                      </Text>
                    </View>
                    {changeAmount > 0 && (
                      <View className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                        <Text className="text-2xl">💸</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          <View className="bg-[#1a1c24] p-8 pb-12 border-t border-slate-800 shadow-2xl">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-slate-500 font-bold text-lg uppercase tracking-widest">Total</Text>
              <Text className="text-5xl font-black text-slate-100">${totalAmount.toFixed(2)}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                setIsCartVisible(false);
                setIsPaymentModalVisible(true);
              }}
              className="py-6 rounded-[28px] items-center shadow-2xl bg-indigo-600 shadow-indigo-600/20"
            >
              <Text className="text-white font-black text-xl tracking-tight">Proceed to Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isPaymentModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsPaymentModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
          <View className="flex-1 bg-[#1a1c24]">
            <View className="px-6 py-6 bg-[#1a1c24] border-b border-slate-800 flex-row justify-between items-center z-10">
              <Text className="text-2xl font-black text-slate-100">Finalize Payment</Text>
              <TouchableOpacity onPress={() => setIsPaymentModalVisible(false)} className="bg-slate-800 w-10 h-10 rounded-full items-center justify-center">
                <Text className="text-slate-400 font-bold text-xl">×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-10" contentContainerStyle={{ paddingBottom: 150 }}>
              <View className="bg-[#252833] p-10 rounded-[40px] border border-slate-700 items-center mb-10 shadow-2xl">
                <Text className="text-slate-500 font-bold text-xs uppercase tracking-[4px] mb-4">Amount Due</Text>
                <Text className="text-white text-6xl font-black">${totalAmount.toFixed(2)}</Text>
                
                <View className="flex-row items-center gap-2 mt-6 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
                  <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{paymentMethod.replace("_", " ")}</Text>
                </View>
              </View>

              {paymentMethod === "CASH" && (
                <Animated.View entering={FadeInDown.duration(400)} className="mb-10">
                  <View className="bg-[#252833] p-8 rounded-[40px] border border-slate-800 shadow-xl">
                    <View className="flex-row items-center justify-between mb-10">
                      <View>
                        <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">Cash Received</Text>
                        <TextInput
                          autoFocus
                          value={paidAmount}
                          onChangeText={setPaidAmount}
                          keyboardType="numeric"
                          placeholder="0.00"
                          placeholderTextColor="#475569"
                          className="text-white text-5xl font-black"
                        />
                      </View>
                      <View className="bg-indigo-500/10 w-16 h-16 rounded-3xl items-center justify-center border border-indigo-500/20">
                        <Text className="text-3xl">💵</Text>
                      </View>
                    </View>

                    <View className="flex-row flex-wrap gap-3 mb-10">
                      {[5, 10, 20, 50, 100].map((amt) => (
                        <TouchableOpacity 
                          key={amt} 
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            setPaidAmount(amt.toString());
                          }}
                          className="bg-slate-800 px-6 py-4 rounded-2xl border border-slate-700 active:bg-slate-700"
                        >
                          <Text className="text-slate-100 font-black text-base">${amt}</Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity 
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          setPaidAmount(totalAmount.toString());
                        }}
                        className="bg-indigo-500/20 px-8 py-4 rounded-2xl border border-indigo-500/30"
                      >
                        <Text className="text-indigo-400 font-black text-base">Exact</Text>
                      </TouchableOpacity>
                    </View>

                    <View className="pt-8 border-t border-slate-800/50 flex-row justify-between items-center">
                      <View>
                        <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">Change Back</Text>
                        <Text className={`font-black text-4xl ${changeAmount > 0 ? 'text-emerald-400' : 'text-slate-700'}`}>
                          ${changeAmount.toFixed(2)}
                        </Text>
                      </View>
                      <View className={`w-14 h-14 rounded-2xl items-center justify-center border ${changeAmount > 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-800/50 border-slate-800'}`}>
                        <Text className="text-2xl">{changeAmount > 0 ? "💰" : "⚖️"}</Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              )}

              {paymentMethod !== "CASH" && (
                <View className="bg-[#252833] p-10 rounded-[40px] border border-slate-800 items-center opacity-50">
                  <Text className="text-slate-400 font-bold text-center">Process digital payment on external terminal</Text>
                </View>
              )}
            </ScrollView>

            <View className="p-8 pb-12 bg-[#1a1c24] border-t border-slate-800">
              <TouchableOpacity 
                onPress={() => {
                  if (paymentMethod === "CASH" && Number(paidAmount) < totalAmount) {
                    Alert.alert("Insufficient Payment", "The cash received is less than the total amount due.");
                    return;
                  }
                  setIsPaymentModalVisible(false);
                  handleCharge();
                }} 
                disabled={isCreating}
                className={`py-6 rounded-[32px] items-center shadow-2xl ${
                  isCreating ? 'bg-slate-700' : 
                  (paymentMethod === "CASH" && Number(paidAmount) < totalAmount) ? 'bg-slate-800 opacity-50' : 'bg-emerald-600 shadow-emerald-600/20'
                }`}
              >
                {isCreating ? <ActivityIndicator color="#fff" /> : (
                  <View className="items-center">
                    <Text className={`font-black text-xl tracking-tight ${
                      (paymentMethod === "CASH" && Number(paidAmount) < totalAmount) ? 'text-slate-500' : 'text-white'
                    }`}>
                      {Number(paidAmount) < totalAmount && paymentMethod === "CASH" ? "Insufficient Cash" : "Complete Transaction"}
                    </Text>
                    {changeAmount > 0 && (
                      <Text className="text-emerald-300 font-bold text-[10px] uppercase tracking-widest mt-1">Return ${changeAmount.toFixed(2)} to customer</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <BarcodeScannerModal visible={isScannerVisible} onClose={() => setIsScannerVisible(false)} onScanned={handleBarcodeScan} title="Terminal Scan" />

      {/* SCANNED PRODUCT PREVIEW MODAL */}
      <Modal visible={!!scannedProduct} transparent animationType="fade" onRequestClose={() => setScannedProduct(null)}>
        <View className="flex-1 bg-black/60 justify-center items-center px-8">
          <Animated.View entering={FadeInDown.duration(400)} className="bg-[#252833] w-full p-8 rounded-[40px] border border-slate-700 shadow-2xl">
            <View className="items-center mb-6">
              <View className="w-24 h-24 bg-[#1a1c24] rounded-[32px] items-center justify-center mb-4 border border-slate-700">
                <Text className="text-5xl">📦</Text>
              </View>
              <Text className="text-white text-2xl font-black text-center">{scannedProduct?.name}</Text>
              <Text className="text-indigo-400 font-bold mt-1">Barcode: {scannedProduct?.barcode}</Text>
            </View>

            <View className="flex-row justify-between items-center bg-[#1a1c24] p-5 rounded-3xl border border-slate-800 mb-8">
              <View>
                <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Price</Text>
                <Text className="text-white text-3xl font-black">${Number(scannedProduct?.sellingPrice).toFixed(2)}</Text>
              </View>
              <View className="items-end">
                <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">In Stock</Text>
                <Text className={`text-xl font-black ${scannedProduct?.stockQuantity < 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {scannedProduct?.stockQuantity}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity 
                onPress={() => setScannedProduct(null)}
                className="flex-1 bg-slate-800 py-5 rounded-2xl items-center border border-slate-700"
              >
                <Text className="text-slate-300 font-black">Dismiss</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  addToCart(scannedProduct);
                  setScannedProduct(null);
                }}
                className="flex-2 bg-indigo-600 py-5 rounded-2xl items-center shadow-lg shadow-indigo-600/30"
              >
                <Text className="text-white font-black text-lg">Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
