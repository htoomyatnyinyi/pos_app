import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
} from "@/services/features/categories/categoryApi";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from "@/services/features/products/productApi";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InventoryScreen() {
  const { data: products, isLoading, error } = useGetProductsQuery();
  const { data: categories } = useGetCategoriesQuery();

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

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
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [createCategory] = useCreateCategoryMutation();

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
    setName("");
    setSku("");
    setBarcode("");
    setDescription("");
    setBrand("");
    setSellingPrice("");
    setCostPrice("");
    setStockQuantity("");
    setCategoryId(categories?.[0]?.id || "");
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Error", "Category name is required.");
      return;
    }

    try {
      setIsAddingCategory(true);

      const slug = newCategoryName.toLowerCase().replace(/\s+/g, "-");

      const newCategory = await createCategory({
        name: newCategoryName,
        slug,
        description: "",
        sortOrder: 0,
      }).unwrap();

      setCategoryId(newCategory.id);
      setNewCategoryName("");

      Alert.alert("Success", "Category created successfully.");
    } catch (err: any) {
      console.error(err);

      Alert.alert("Error", err?.data?.message || "Failed to create category.");
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleSave = async () => {
    if (!name || !sku || !sellingPrice || !costPrice || !stockQuantity) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    if (!categoryId && (!categories || categories.length === 0)) {
      Alert.alert(
        "Error",
        "No categories found. Please create a category first.",
      );
      return;
    }

    const payload = {
      name,
      sku,
      barcode: barcode || undefined,
      description: description || undefined,
      brand: brand || undefined,
      sellingPrice: parseFloat(sellingPrice),
      costPrice: parseFloat(costPrice),
      stockQuantity: parseInt(stockQuantity),
      categoryId: categoryId || categories?.[0]?.id,
    };

    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, data: payload }).unwrap();
        Alert.alert("Success", "Product updated successfully.");
      } else {
        await createProduct(payload).unwrap();
        Alert.alert("Success", "Product created successfully.");
      }
      setIsModalVisible(false);
      setEditingProduct(null);
      resetForm();
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        "Error",
        err?.data?.message || "Failed to save product. Check if SKU is unique.",
      );
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct(id).unwrap();
              Alert.alert("Success", "Product deleted.");
            } catch (err: any) {
              Alert.alert(
                "Error",
                err?.data?.message || "Failed to delete product.",
              );
            }
          },
        },
      ],
    );
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setIsModalVisible(true);
  };

  const openAdd = () => {
    setEditingProduct(null);
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-8 pt-10 pb-6 flex-row justify-between items-end">
        <View>
          <Text className="text-4xl font-black text-slate-900 tracking-tight">
            Products
          </Text>
          <Text className="text-slate-400 font-medium text-sm uppercase tracking-widest mt-1">
            Manage your catalog
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openAdd}
          className="bg-slate-900 px-6 py-4 rounded-2xl shadow-sm flex-row items-center">
          <Text className="text-white font-black text-lg">+ Add Product</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-red-500 font-bold text-lg text-center">
            Error loading inventory.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 40 }}>
          {products?.map((product) => (
            <View
              key={product.id}
              className="bg-white p-6 rounded-3xl mb-4 shadow-sm border border-slate-100 flex-row items-center">
              <View className="w-16 h-16 bg-slate-50 rounded-2xl items-center justify-center mr-5">
                <Text className="text-3xl">📦</Text>
              </View>
              <View className="flex-1">
                <Text
                  className="text-slate-900 font-black text-xl"
                  numberOfLines={1}>
                  {product.name}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-slate-400 font-bold text-sm">
                    SKU:{" "}
                  </Text>
                  <Text className="text-slate-900 font-bold text-sm mr-2">
                    {product.sku}
                  </Text>
                  <Text className="text-slate-200 mx-2">|</Text>
                  <Text className="text-slate-400 font-bold text-sm">
                    Stock:{" "}
                  </Text>
                  <Text
                    className={`${product.stockQuantity < 10 ? "text-red-500" : "text-green-600"} font-bold text-sm`}>
                    {product.stockQuantity}
                  </Text>
                </View>
                <Text className="text-slate-900 font-black text-lg mt-1">
                  ${product.sellingPrice?.toFixed?.(2) || "0.00"}
                </Text>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => openEdit(product)}
                  className="p-3 bg-slate-50 rounded-2xl">
                  <IconSymbol name="pencil" size={20} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(product.id)}
                  className="p-3 bg-red-50 rounded-2xl">
                  <IconSymbol name="trash.fill" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Product Form Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-white">
          <View className="p-8">
            <View className="flex-row justify-between items-center mb-10">
              <Text className="text-3xl font-black text-slate-900">
                {editingProduct ? "Edit Product" : "New Product"}
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text className="text-slate-400 font-bold text-lg">Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              className="gap-6"
              contentContainerStyle={{ paddingBottom: 100 }}>
              <View>
                <Text className="text-slate-500 font-bold mb-2 ml-1">
                  Product Name *
                </Text>
                <TextInput
                  placeholder="e.g. Espresso"
                  value={name}
                  onChangeText={setName}
                  className="bg-slate-50 p-5 rounded-2xl text-slate-900 font-bold text-lg"
                />
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-slate-500 font-bold mb-2 ml-1">
                    SKU *
                  </Text>
                  <TextInput
                    placeholder="SKU-123"
                    value={sku}
                    onChangeText={setSku}
                    className="bg-slate-50 p-5 rounded-2xl text-slate-900 font-bold text-lg"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-500 font-bold mb-2 ml-1">
                    Barcode
                  </Text>
                  <TextInput
                    placeholder="885..."
                    value={barcode}
                    onChangeText={setBarcode}
                    className="bg-slate-50 p-5 rounded-2xl text-slate-900 font-bold text-lg"
                  />
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-slate-500 font-bold mb-2 ml-1">
                    Selling Price *
                  </Text>
                  <TextInput
                    placeholder="0.00"
                    value={sellingPrice}
                    onChangeText={setSellingPrice}
                    keyboardType="numeric"
                    className="bg-slate-50 p-5 rounded-2xl text-slate-900 font-bold text-lg"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-500 font-bold mb-2 ml-1">
                    Cost Price *
                  </Text>
                  <TextInput
                    placeholder="0.00"
                    value={costPrice}
                    onChangeText={setCostPrice}
                    keyboardType="numeric"
                    className="bg-slate-50 p-5 rounded-2xl text-slate-900 font-bold text-lg"
                  />
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-slate-500 font-bold mb-2 ml-1">
                    Stock Quantity *
                  </Text>
                  <TextInput
                    placeholder="0"
                    value={stockQuantity}
                    onChangeText={setStockQuantity}
                    keyboardType="numeric"
                    className="bg-slate-50 p-5 rounded-2xl text-slate-900 font-bold text-lg"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-500 font-bold mb-2 ml-1">
                    Brand
                  </Text>
                  <TextInput
                    placeholder="Brand name"
                    value={brand}
                    onChangeText={setBrand}
                    className="bg-slate-50 p-5 rounded-2xl text-slate-900 font-bold text-lg"
                  />
                </View>
              </View>

              <View>
                <Text className="text-slate-500 font-bold mb-2 ml-1">
                  Description
                </Text>
                <TextInput
                  placeholder="Product description..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  className="bg-slate-50 p-5 rounded-2xl text-slate-900 font-bold text-lg min-h-[100]"
                />
              </View>

              <View>
                <Text className="text-slate-500 font-bold mb-2 ml-1">
                  Category *
                </Text>

                {/* Existing Categories */}
                {categories && categories.length > 0 ? (
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setCategoryId(cat.id)}
                        className={`px-4 py-2 rounded-full border ${
                          categoryId === cat.id
                            ? "bg-slate-900 border-slate-900"
                            : "bg-white border-slate-200"
                        }`}>
                        <Text
                          className={`font-bold ${
                            categoryId === cat.id
                              ? "text-white"
                              : "text-slate-600"
                          }`}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text className="text-orange-500 italic mb-4">
                    No categories yet. Create one below.
                  </Text>
                )}

                {/* Add New Category */}
                <View className="flex-row items-center gap-2">
                  <TextInput
                    placeholder="New category name"
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    className="flex-1 border border-slate-300 rounded-xl px-4 py-3 bg-white"
                  />

                  <TouchableOpacity
                    disabled={isAddingCategory}
                    onPress={handleCreateCategory}
                    className="bg-slate-900 px-5 py-3 rounded-xl">
                    <Text className="text-white font-bold">
                      {isAddingCategory ? "..." : "Add"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSave}
                className="bg-slate-900 p-6 rounded-3xl items-center mt-6 shadow-lg">
                <Text className="text-white font-black text-xl">
                  Save Product
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
