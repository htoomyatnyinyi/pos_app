import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from "@/services/features/products/productApi";
import type { Product } from "@/services/features/products/productTypes";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const initialForm = {
  sku: "",
  barcode: "",
  name: "",
  description: "",
  brand: "",
  originalPrice: "",
  sellingPrice: "",
  stock: "",
  categoryId: "",
  supplierId: "",
  imageUrl: "",
};

type FormErrors = {
  name?: string;
  originalPrice?: string;
  sellingPrice?: string;
  stock?: string;
  categoryId?: string;
};

export default function AddProductScreen() {
  const { data: products = [], isLoading: isLoadingProducts } = useGetProductsQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const selectedProduct = useMemo(
    () => products.find((item) => item.id === editingId) ?? null,
    [editingId, products],
  );

  useEffect(() => {
    if (selectedProduct) {
      setForm({
        sku: selectedProduct.sku,
        barcode: selectedProduct.barcode ?? "",
        name: selectedProduct.name,
        description: selectedProduct.description ?? "",
        brand: selectedProduct.brand ?? "",
        originalPrice: String(selectedProduct.costPrice ?? ""),
        sellingPrice: String(selectedProduct.sellingPrice ?? ""),
        stock: String(selectedProduct.stockQuantity ?? ""),
        categoryId: selectedProduct.categoryId,
        supplierId: selectedProduct.supplierId ?? "",
        imageUrl: selectedProduct.imageUrl ?? "",
      });
    }
  }, [selectedProduct]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photo library to upload an image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setForm((prev) => ({ ...prev, imageUrl: result.assets[0].uri }));
    }
  };

  const handleSave = async () => {
    const nextErrors: FormErrors = {};
    const name = form.name.trim();
    const description = form.description.trim();
    const originalPrice = Number(form.originalPrice);
    const sellingPrice = Number(form.sellingPrice);
    const stock = Number(form.stock);

    if (!name) {
      nextErrors.name = "Product name is required.";
    }

    if (
      form.originalPrice === "" ||
      Number.isNaN(originalPrice) ||
      originalPrice <= 0
    ) {
      nextErrors.originalPrice = "Original price must be greater than 0.";
    }

    if (
      form.sellingPrice === "" ||
      Number.isNaN(sellingPrice) ||
      sellingPrice <= 0
    ) {
      nextErrors.sellingPrice = "Selling price must be greater than 0.";
    }

    if (
      !nextErrors.originalPrice &&
      !nextErrors.sellingPrice &&
      sellingPrice < originalPrice
    ) {
      nextErrors.sellingPrice =
        "Selling price must be greater than original price.";
    }

    if (form.stock === "" || Number.isNaN(stock) || stock < 0) {
      nextErrors.stock = "Stock must be a valid number.";
    }

    if (!form.categoryId.trim()) {
      nextErrors.categoryId = "Category ID is required.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload = {
      sku: form.sku || `SKU-${Date.now()}`,
      barcode: form.barcode || undefined,
      name,
      description,
      brand: form.brand || undefined,
      costPrice: originalPrice,
      sellingPrice,
      stockQuantity: stock,
      categoryId: form.categoryId,
      supplierId: form.supplierId || undefined,
    };

    try {
      if (editingId) {
        await updateProduct({ id: editingId, data: payload }).unwrap();
        Alert.alert("Product updated", `${name} was updated successfully.`);
      } else {
        await createProduct(payload).unwrap();
        Alert.alert("Product added", `${name} was added to inventory.`);
        setShowNotification(true);
      }

      setForm(initialForm);
      setEditingId(null);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.data?.message || "Failed to save product. Please try again.",
      );
    }
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      "Delete product",
      "Are you sure you want to remove this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct(product.id).unwrap();
              if (editingId === product.id) {
                setEditingId(null);
                setForm(initialForm);
              }
              Alert.alert("Product deleted", `${product.name} was removed.`);
            } catch (error: any) {
              Alert.alert(
                "Error",
                error?.data?.message || "Failed to delete product.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {showNotification && (
        <View className="bg-emerald-500 px-6 py-4 flex-row items-center justify-between border-b-4 border-emerald-700">
          <View className="flex-row items-center gap-4 flex-1">
            <View className="bg-white bg-opacity-30 p-2 rounded-full">
              <IconSymbol name="bell.fill" size={28} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">
                ✓ Product Added!
              </Text>
              <Text className="text-white text-sm opacity-90">
                Successfully added to inventory
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              setShowNotification(false);
              router.push("/stock");
            }}
            className="bg-white px-4 py-2 rounded-lg ml-2">
            <Text className="text-emerald-600 font-bold text-base">Stock</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="px-4 md:px-6 lg:px-8 py-4 md:py-5 bg-white border-b border-slate-200">
        <Text className="text-2xl md:text-3xl font-bold text-slate-900">
          Product CRUD
        </Text>
        <Text className="text-sm md:text-base text-slate-500 mt-1">
          Add or update inventory products using the backend API.
        </Text>
      </View>

      <ScrollView className="px-4 md:px-6 lg:px-8 pt-3 md:pt-4">
        <View className="rounded-3xl bg-white p-4 md:p-6 lg:p-8 shadow-sm border border-slate-200 mb-6 max-w-2xl mx-auto w-full">
          <Text className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900 mb-4">
            {editingId ? "Edit Product" : "New Product"}
          </Text>

          {isLoadingProducts && (
            <View className="mb-4 items-center">
              <ActivityIndicator size="large" color="#0f172a" />
              <Text className="text-slate-500 mt-3">Loading products...</Text>
            </View>
          )}

          <View className="mb-3 md:mb-4">
            <TextInput
              placeholder="Product name *"
              value={form.name}
              onChangeText={(value) => {
                setForm((prev) => ({ ...prev, name: value }));
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              className="rounded-2xl bg-slate-100 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-slate-900"
            />
            {errors.name ? (
              <Text className="text-rose-600 text-xs mt-1 ml-1">
                {errors.name}
              </Text>
            ) : null}
          </View>

          <TextInput
            placeholder="Description"
            value={form.description}
            onChangeText={(value) =>
              setForm((prev) => ({ ...prev, description: value }))
            }
            multiline
            numberOfLines={2}
            className="mb-3 md:mb-4 rounded-2xl bg-slate-100 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-slate-900"
          />

          <View className="flex-row gap-2 md:gap-4 mb-3 md:mb-4">
            <View className="flex-1">
              <TextInput
                placeholder="Original price *"
                value={form.originalPrice}
                onChangeText={(value) => {
                  setForm((prev) => ({ ...prev, originalPrice: value }));
                  setErrors((prev) => ({ ...prev, originalPrice: undefined }));
                }}
                keyboardType="decimal-pad"
                className="rounded-2xl bg-slate-100 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-slate-900"
              />
              {errors.originalPrice ? (
                <Text className="text-rose-600 text-xs mt-1 ml-1">
                  {errors.originalPrice}
                </Text>
              ) : null}
            </View>

            <View className="flex-1">
              <TextInput
                placeholder="Selling price *"
                value={form.sellingPrice}
                onChangeText={(value) => {
                  setForm((prev) => ({ ...prev, sellingPrice: value }));
                  setErrors((prev) => ({ ...prev, sellingPrice: undefined }));
                }}
                keyboardType="decimal-pad"
                className="rounded-2xl bg-slate-100 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-slate-900"
              />
              {errors.sellingPrice ? (
                <Text className="text-rose-600 text-xs mt-1 ml-1">
                  {errors.sellingPrice}
                </Text>
              ) : null}
            </View>
          </View>

          <View className="mb-3 md:mb-4">
            <TextInput
              placeholder="Stock quantity *"
              value={form.stock}
              onChangeText={(value) => {
                setForm((prev) => ({ ...prev, stock: value }));
                setErrors((prev) => ({ ...prev, stock: undefined }));
              }}
              keyboardType="number-pad"
              className="rounded-2xl bg-slate-100 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-slate-900"
            />
            {errors.stock ? (
              <Text className="text-rose-600 text-xs mt-1 ml-1">
                {errors.stock}
              </Text>
            ) : null}
          </View>

          <View className="grid-cols-2 gap-2 md:gap-4 mb-3 md:mb-4">
            <TextInput
              placeholder="Category ID *"
              value={form.categoryId}
              onChangeText={(value) => {
                setForm((prev) => ({ ...prev, categoryId: value }));
                setErrors((prev) => ({ ...prev, categoryId: undefined }));
              }}
              className="mb-3 rounded-2xl bg-slate-100 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-slate-900"
            />
            {errors.categoryId ? (
              <Text className="text-rose-600 text-xs mt-1 ml-1">
                {errors.categoryId}
              </Text>
            ) : null}

            <TextInput
              placeholder="Supplier ID"
              value={form.supplierId}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, supplierId: value }))
              }
              className="mb-3 rounded-2xl bg-slate-100 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-slate-900"
            />
          </View>

          <TextInput
            placeholder="Image URL (optional)"
            value={form.imageUrl}
            onChangeText={(value) =>
              setForm((prev) => ({ ...prev, imageUrl: value }))
            }
            className="mb-3 md:mb-4 rounded-2xl bg-slate-100 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-slate-900"
          />

          <TouchableOpacity
            onPress={pickImage}
            className="mb-4 md:mb-6 rounded-2xl bg-slate-900 px-4 md:px-5 py-3 md:py-4 items-center">
            <Text className="text-white font-bold text-sm md:text-base">
              Pick image from device
            </Text>
          </TouchableOpacity>

          {form.imageUrl ? (
            <Image
              source={{ uri: form.imageUrl }}
              className="mb-4 md:mb-6 h-32 md:h-40 lg:h-48 w-full rounded-3xl bg-slate-100"
              resizeMode="cover"
            />
          ) : null}

          <TouchableOpacity
            onPress={handleSave}
            disabled={isCreating || isUpdating || isDeleting}
            className="rounded-2xl bg-blue-600 px-4 md:px-5 py-3 md:py-4 items-center">
            <Text className="text-white font-bold text-sm md:text-base">
              {isCreating || isUpdating ? "Saving..." : editingId ? "Save changes" : "Add product"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
