import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, ActivityIndicator, TouchableOpacity,
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform, RefreshControl,
} from "react-native";
import {
  useGetProductsQuery, useCreateProductMutation,
  useUpdateProductMutation, useDeleteProductMutation,
} from "@/services/features/products/productApi";
import { useGetCategoriesQuery } from "@/services/features/categories/categoryApi";
import { SafeAreaView } from "react-native-safe-area-context";
import BarcodeScannerModal from "@/components/BarcodeScannerModal";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import QRCode from "react-native-qrcode-svg";

export default function InventoryScreen() {
  const { data: products, isLoading, error, refetch, isFetching } = useGetProductsQuery();
  const { data: categories } = useGetCategoriesQuery();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  
  // New features state
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [qrProduct, setQrProduct] = useState<any>(null);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setSku(editingProduct.sku);
      setBarcode(editingProduct.barcode || "");
      setDescription(editingProduct.description || "");
      setBrand(editingProduct.brand || "");
      setSellingPrice(editingProduct.sellingPrice.toString());
      setCostPrice(editingProduct.costPrice.toString());
      setStockQuantity(editingProduct.stockQuantity.toString());
      setCategoryId(editingProduct.categoryId);
      setNewCategoryName("");
    } else {
      resetForm();
    }
  }, [editingProduct]);

  useEffect(() => {
    if (!editingProduct && categories && categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories]);

  const resetForm = () => {
    setName(""); setSku(""); setBarcode(""); setDescription("");
    setBrand(""); setSellingPrice(""); setCostPrice(""); setStockQuantity("");
    setCategoryId(categories?.[0]?.id || "");
    setNewCategoryName("");
  };

  const handleSave = async () => {
    if (!name || !sku || !sellingPrice || !costPrice || !stockQuantity) {
      Alert.alert("Error", "Required fields missing"); return;
    }

    const finalCategoryId = newCategoryName ? undefined : (categoryId || categories?.[0]?.id);
    if (!finalCategoryId && !newCategoryName) {
      Alert.alert("Error", "Please select a category or create a new one"); return;
    }

    const payload = {
      name, 
      sku, 
      barcode: barcode.trim() !== "" ? barcode.trim() : undefined, 
      description: description.trim() !== "" ? description.trim() : undefined,
      brand: brand.trim() !== "" ? brand.trim() : undefined, 
      sellingPrice: parseFloat(sellingPrice),
      costPrice: parseFloat(costPrice), 
      stockQuantity: parseInt(stockQuantity),
      categoryId: finalCategoryId,
      categoryName: newCategoryName.trim() !== "" ? newCategoryName.trim() : undefined,
    };
    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, data: payload }).unwrap();
      } else {
        await createProduct(payload).unwrap();
      }
      setIsModalVisible(false); setEditingProduct(null); resetForm();
    } catch (err: any) {
      Alert.alert("Error", err?.data?.error || err?.message || "Save failed");
    }
  };

  const handleExport = async () => {
    if (!products || products.length === 0) {
      Alert.alert("Export Error", "No products to export.");
      return;
    }
    try {
      const csvHeader = "ID,Name,SKU,Barcode,Category ID,Stock,Cost Price,Selling Price\n";
      const csvRows = products.map(p => {
        return `"${p.id}","${p.name}","${p.sku}","${p.barcode || ''}","${p.categoryId}","${p.stockQuantity}","${p.costPrice}","${p.sellingPrice}"`;
      }).join("\n");
      
      const csvString = csvHeader + csvRows;
      // @ts-ignore
      const filePath = `${FileSystem.documentDirectory}inventory_audit_${Date.now()}.csv`;
      
      await FileSystem.writeAsStringAsync(filePath, csvString, { encoding: 'utf8' });
      await Sharing.shareAsync(filePath, { dialogTitle: "Export Inventory Audit" });
    } catch (error) {
      Alert.alert("Export Failed", "Failed to generate inventory record.");
    }
  };

  const filteredProducts = selectedCat ? products?.filter((p) => p.categoryId === selectedCat) : products;

  return (
    <SafeAreaView className="flex-1 bg-[#1a1c24]">
      {/* Header */}
      <View className="px-6 py-5 bg-[#1a1c24] border-b border-slate-800 flex-row justify-between items-center">
        <View>
          <Text className="text-3xl font-bold text-slate-100 tracking-tight">Catalog</Text>
          <Text className="text-[10px] font-bold text-slate-500 tracking-[3px] uppercase mt-1">Inventory Control</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={handleExport} className="bg-slate-800 px-4 py-3 rounded-xl border border-slate-700">
            <Text className="text-slate-300 font-bold text-xs uppercase tracking-wider">Export</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { setEditingProduct(null); setIsModalVisible(true); }}
            className="bg-indigo-600 px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/20"
          >
            <Text className="text-white font-black text-xs uppercase tracking-wider">+ Item</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CATEGORY TABS */}
      {categories && categories.length > 0 && (
        <View className="py-3 bg-[#1a1c24] border-b border-slate-800/50">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
            <TouchableOpacity 
              onPress={() => setSelectedCat(null)}
              className={`px-5 py-2.5 rounded-xl ${!selectedCat ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-slate-800 border border-slate-700'}`}
            >
              <Text className={`font-bold text-xs uppercase tracking-wider ${!selectedCat ? 'text-indigo-400' : 'text-slate-400'}`}>All</Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat.id} onPress={() => setSelectedCat(cat.id)}
                className={`px-5 py-2.5 rounded-xl ${selectedCat === cat.id ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-slate-800 border border-slate-700'}`}
              >
                <Text className={`font-bold text-xs uppercase tracking-wider ${selectedCat === cat.id ? 'text-indigo-400' : 'text-slate-400'}`}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {isLoading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#6366f1" /></View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#6366f1" />}
        >
          {filteredProducts?.map((product, idx) => (
            <Animated.View key={product.id} entering={FadeInDown.duration(400).delay(idx * 40)}>
              <View className="bg-[#252833] p-5 rounded-[28px] mb-4 border border-slate-800/50 flex-row items-center">
                <TouchableOpacity onPress={() => setQrProduct(product)} className="w-14 h-14 bg-[#1a1c24] rounded-2xl items-center justify-center mr-4 border border-slate-800">
                  <Text className="text-2xl opacity-70">📱</Text>
                  <Text className="text-[8px] font-black uppercase tracking-widest text-indigo-400 mt-1">QR</Text>
                </TouchableOpacity>
                <View className="flex-1">
                  <Text className="text-slate-100 font-bold text-lg" numberOfLines={1}>{product.name}</Text>
                  <View className="flex-row items-center gap-2 mt-1">
                    <Text className="text-slate-500 font-black text-[9px] uppercase tracking-widest bg-[#1a1c24] px-2 py-0.5 rounded-lg border border-slate-800">{product.sku}</Text>
                    {product.barcode && <Text className="text-indigo-400 font-black text-[9px] uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">⊟ {product.barcode}</Text>}
                    {product.category?.name && <Text className="text-emerald-400 font-black text-[9px] uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">{product.category.name}</Text>}
                  </View>
                  <View className="flex-row items-center justify-between mt-3">
                    <Text className="text-indigo-400 font-black text-xl">${Number(product.sellingPrice).toFixed(2)}</Text>
                    <View className="flex-row items-center gap-2 bg-[#1a1c24] px-3 py-1.5 rounded-full border border-slate-800">
                      <View className={`w-1.5 h-1.5 rounded-full ${product.stockQuantity < 10 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      <Text className={`text-xs font-black ${product.stockQuantity < 10 ? 'text-rose-400' : 'text-slate-400'}`}>{product.stockQuantity}</Text>
                    </View>
                  </View>
                </View>
                <View className="gap-2.5 ml-4">
                  <TouchableOpacity onPress={() => { setEditingProduct(product); setIsModalVisible(true); }} className="w-11 h-11 bg-[#1a1c24] rounded-xl items-center justify-center border border-slate-700">
                    <Text>✏️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      )}

      {/* Form Modal */}
      <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-[#1a1c24]">
          <View className="px-6 py-6 bg-[#1a1c24] border-b border-slate-800 flex-row justify-between items-center">
            <Text className="text-2xl font-black text-slate-100">{editingProduct ? "Edit Item" : "New Item"}</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)} className="bg-slate-800 w-11 h-11 rounded-full items-center justify-center">
              <Text className="text-slate-400 font-bold text-2xl">×</Text>
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1 px-6 pt-8" contentContainerStyle={{ paddingBottom: 100 }}>
            <View className="bg-[#252833] p-6 rounded-[32px] border border-slate-800 shadow-xl mb-8">
              <FormField label="Name *" value={name} onChangeText={setName} placeholder="Item name" />
              
              <View className="flex-row gap-4 mt-6">
                <View className="flex-1"><FormField label="SKU *" value={sku} onChangeText={setSku} placeholder="SKU" /></View>
                <View className="flex-1">
                  <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-1">Barcode</Text>
                  <View className="flex-row gap-2">
                    <TextInput value={barcode} onChangeText={setBarcode} placeholder="Code" placeholderTextColor="#475569" className="flex-1 bg-[#1a1c24] px-4 py-4 rounded-2xl border border-slate-800 font-bold text-slate-100" />
                    <TouchableOpacity onPress={() => setIsScannerVisible(true)} className="w-14 bg-indigo-500/10 rounded-2xl items-center justify-center border border-indigo-500/20"><Text>📷</Text></TouchableOpacity>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-4 mt-6">
                <View className="flex-1"><FormField label="Cost Price *" value={costPrice} onChangeText={setCostPrice} keyboard="numeric" placeholder="0.00" /></View>
                <View className="flex-1"><FormField label="Selling Price *" value={sellingPrice} onChangeText={setSellingPrice} keyboard="numeric" placeholder="0.00" /></View>
              </View>

              <View className="flex-row gap-4 mt-6">
                <View className="flex-1"><FormField label="Stock *" value={stockQuantity} onChangeText={setStockQuantity} keyboard="numeric" placeholder="0" /></View>
                <View className="flex-1"><FormField label="Brand" value={brand} onChangeText={setBrand} placeholder="Brand Name" /></View>
              </View>

              <View className="mt-6">
                <FormField label="Description" value={description} onChangeText={setDescription} placeholder="Product description..." multiline={true} />
              </View>

              <View className="mt-6">
                <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-1">Category *</Text>
                <View className="flex-row flex-wrap gap-2.5">
                  {categories?.map((cat) => (
                    <TouchableOpacity key={cat.id} onPress={() => { setCategoryId(cat.id); setNewCategoryName(""); }} className={`px-5 py-3 rounded-2xl border ${categoryId === cat.id && !newCategoryName ? 'bg-indigo-600 border-indigo-600' : 'bg-[#1a1c24] border-slate-800'}`}>
                      <Text className={`font-bold text-sm ${categoryId === cat.id && !newCategoryName ? 'text-white' : 'text-slate-500'}`}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View className="mt-4">
                  <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-1">Or Create New Category</Text>
                  <TextInput 
                    value={newCategoryName} 
                    onChangeText={(val) => { setNewCategoryName(val); if(val) setCategoryId(""); }} 
                    placeholder="Type new category name..." 
                    placeholderTextColor="#475569"
                    className="bg-[#1a1c24] px-5 py-4 rounded-2xl border border-slate-800 font-bold text-slate-100"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity onPress={handleSave} className="bg-indigo-600 py-6 rounded-[28px] items-center shadow-2xl shadow-indigo-600/20">
              <Text className="text-white font-black text-xl tracking-tight">Save to Catalog</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* QR Code Modal */}
      <Modal visible={!!qrProduct} animationType="fade" transparent={true} onRequestClose={() => setQrProduct(null)}>
        <View className="flex-1 bg-black/80 items-center justify-center p-6">
          <Animated.View entering={FadeInDown.duration(300)} className="bg-[#252833] w-full max-w-sm rounded-[40px] p-8 items-center border border-slate-700">
            <View className="w-16 h-16 bg-indigo-500/20 rounded-3xl items-center justify-center mb-6">
              <Text className="text-3xl">📦</Text>
            </View>
            <Text className="text-2xl font-black text-white text-center mb-2">{qrProduct?.name}</Text>
            <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-8">SKU: {qrProduct?.sku}</Text>
            
            <View className="bg-white p-6 rounded-3xl mb-8">
              <QRCode 
                value={qrProduct?.barcode || qrProduct?.id || "N/A"} 
                size={200}
              />
            </View>

            <Text className="text-slate-500 text-xs font-bold tracking-widest text-center mb-8 uppercase">
              {qrProduct?.barcode ? 'Barcode / ' : 'System ID / '} QR Tag
            </Text>

            <TouchableOpacity onPress={() => setQrProduct(null)} className="bg-slate-800 w-full py-5 rounded-2xl items-center border border-slate-700">
              <Text className="text-white font-black text-lg">Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      <BarcodeScannerModal visible={isScannerVisible} onClose={() => setIsScannerVisible(false)} onScanned={(code) => { setBarcode(code); setIsScannerVisible(false); }} title="Catalog Scan" />
    </SafeAreaView>
  );
}

function FormField({ label, value, onChangeText, placeholder, keyboard, multiline }: any) {
  return (
    <View>
      <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-1">{label}</Text>
      <TextInput
        placeholder={placeholder} value={value} onChangeText={onChangeText} placeholderTextColor="#475569"
        keyboardType={keyboard || "default"} multiline={multiline} numberOfLines={multiline ? 3 : 1}
        className={`bg-[#1a1c24] px-5 py-4 rounded-2xl border border-slate-800 font-bold text-slate-100 ${multiline ? 'min-h-[100px]' : ''}`}
        style={multiline ? { textAlignVertical: "top" } : {}}
      />
    </View>
  );
}
