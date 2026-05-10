import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/services/features/products/productApi";
import { useGetCategoriesQuery } from "@/services/features/categories/categoryApi";
import { IconSymbol } from "@/components/ui/icon-symbol";

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
  const [categoryText, setCategoryText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      setImageUrl(editingProduct.imageUrl || "");
      setSelectedImage(editingProduct.imageUrl || null);
      const matchedCategory = categories?.find(
        (cat) => cat.id === editingProduct.categoryId,
      );
      setCategoryText(matchedCategory?.name || editingProduct.categoryId || "");
    } else {
      resetForm();
    }
  }, [editingProduct, categories]);

  useEffect(() => {
    if (
      !editingProduct &&
      categories &&
      categories.length > 0 &&
      !categoryText
    ) {
      setCategoryText(categories[0].name);
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
    setImageUrl("");
    setSelectedImage(null);
    setCategoryText(categories?.[0]?.name || "");
  };

  const pickImage = async () => {
    console.log("pickImage called, Platform.OS:", Platform.OS);
    try {
      // Request permissions (skip on web as it's handled by browser)
      if (Platform.OS !== "web") {
        console.log("Requesting media library permissions...");
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log("Media library permission status:", status);
        if (status !== "granted") {
          Alert.alert(
            "Permission needed",
            "Camera roll permissions are required to select images.",
          );
          return;
        }
      }

      // On web, directly open gallery. On mobile, show options
      if (Platform.OS === "web") {
        console.log("Opening gallery for web...");
        openGallery();
      } else {
        console.log("Showing alert for mobile options...");
        // Show options for mobile
        Alert.alert("Select Image", "Choose image source", [
          { text: "Camera", onPress: openCamera },
          { text: "Gallery", onPress: openGallery },
          { text: "Cancel", style: "cancel" },
        ]);
      }
    } catch (error) {
      console.error("Error in pickImage:", error);
      Alert.alert("Error", "Failed to open image picker");
    }
  };

  const openCamera = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission needed", "Camera permissions are required.");
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const base64 = result.assets[0].base64;
        setSelectedImage(uri);
        setImageUrl(`data:image/jpeg;base64,${base64}`);
      }
    } catch (error) {
      console.error("Error opening camera:", error);
      Alert.alert("Error", "Failed to open camera");
    }
  };

  const openGallery = async () => {
    console.log("openGallery called");
    try {
      console.log("Launching image library...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      console.log("Image picker result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const base64 = result.assets[0].base64;
        console.log("Setting image:", uri);
        setSelectedImage(uri);
        setImageUrl(`data:image/jpeg;base64,${base64}`);
      } else {
        console.log("Image selection canceled or no assets");
      }
    } catch (error) {
      console.error("Error opening gallery:", error);
      Alert.alert("Error", "Failed to open gallery");
    }
  };

  const handleSave = async () => {
    if (
      !name ||
      !sku ||
      !sellingPrice ||
      !costPrice ||
      !stockQuantity ||
      !categoryText
    ) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    const matchedCategory = categories?.find(
      (cat) => cat.name.toLowerCase() === categoryText.trim().toLowerCase(),
    );
    const categoryIdToSave = matchedCategory?.id || categoryText.trim();

    const payload = {
      name,
      sku,
      barcode: barcode || undefined,
      description: description || undefined,
      brand: brand || undefined,
      sellingPrice: parseFloat(sellingPrice),
      costPrice: parseFloat(costPrice),
      stockQuantity: parseInt(stockQuantity),
      categoryId: categoryIdToSave,
      imageUrl: imageUrl || undefined,
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
              {product.imageUrl ? (
                <Image
                  source={{ uri: product.imageUrl }}
                  className="w-16 h-16 rounded-2xl mr-5"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-16 h-16 bg-slate-50 rounded-2xl items-center justify-center mr-5">
                  <Text className="text-3xl">📦</Text>
                </View>
              )}
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
        presentationStyle="fullScreen"
        onRequestClose={() => setIsModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-white">
          <View className="flex-1">
            <View className="p-8 pb-4">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-3xl font-black text-slate-900">
                  {editingProduct ? "Edit Product" : "New Product"}
                </Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <Text className="text-slate-400 font-bold text-lg">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              className="flex-1 px-8"
              contentContainerStyle={{ paddingBottom: 120, gap: 24 }}>
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
                <TextInput
                  placeholder="e.g. Coffee, Snacks"
                  value={categoryText}
                  onChangeText={setCategoryText}
                  className="bg-slate-50 p-5 rounded-2xl text-slate-900 font-bold text-lg"
                />
                {categories && categories.length > 0 ? (
                  <Text className="text-slate-400 mt-2 text-sm">
                    Tip: type a category name that already exists or enter a new
                    one.
                  </Text>
                ) : null}
              </View>

              <View>
                <Text className="text-slate-500 font-bold mb-2 ml-1">
                  Product Image
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    console.log("Image picker pressed");
                    pickImage();
                  }}
                  className="bg-slate-50 p-5 rounded-2xl items-center justify-center min-h-[120]">
                  {selectedImage ? (
                    <Image
                      source={{ uri: selectedImage }}
                      className="w-20 h-20 rounded-xl"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="items-center">
                      <Text className="text-slate-400 text-4xl mb-2">📷</Text>
                      <Text className="text-slate-600 font-bold">
                        Tap to select image
                      </Text>
                      <Text className="text-slate-400 text-sm mt-1">
                        Camera or Gallery
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
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
