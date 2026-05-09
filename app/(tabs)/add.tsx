import { MOCK_PRODUCTS, ShopProduct } from "@/services/mock/mockData";
import { useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const initialForm = {
  name: "",
  category: "Beverages",
  price: "",
  stock: "",
};

export default function AddProductScreen() {
  const [products, setProducts] = useState<ShopProduct[]>(MOCK_PRODUCTS);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => products.find((item) => item.id === editingId) ?? null,
    [editingId, products],
  );

  const handleSave = () => {
    const name = form.name.trim();
    const category = form.category.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!name || !category || Number.isNaN(price) || Number.isNaN(stock)) {
      Alert.alert(
        "Missing fields",
        "Please complete every field before saving.",
      );
      return;
    }

    if (editingId) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? { ...item, name, category, price, stock }
            : item,
        ),
      );
      Alert.alert("Product updated", `${name} was updated successfully.`);
    } else {
      setProducts((prev) => [
        {
          id: `p-${Date.now()}`,
          name,
          category,
          price,
          stock,
          sold: 0,
        },
        ...prev,
      ]);
      Alert.alert("Product added", `${name} was added to inventory.`);
    }

    setForm(initialForm);
    setEditingId(null);
  };

  const handleEdit = (product: ShopProduct) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
    });
  };

  const handleDelete = (productId: string) => {
    Alert.alert(
      "Delete product",
      "Are you sure you want to remove this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setProducts((prev) => prev.filter((item) => item.id !== productId));
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 py-5 bg-white border-b border-slate-200">
        <Text className="text-3xl font-bold text-slate-900">Product CRUD</Text>
        <Text className="text-slate-500 mt-1">
          Add, edit, or remove mock products for your mini shop.
        </Text>
      </View>

      <ScrollView className="px-6 pt-4">
        <View className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200 mb-6">
          <Text className="text-xl font-bold text-slate-900 mb-4">
            {editingId ? "Edit Product" : "New Product"}
          </Text>

          <TextInput
            placeholder="Product name"
            value={form.name}
            onChangeText={(value) =>
              setForm((prev) => ({ ...prev, name: value }))
            }
            className="mb-4 rounded-2xl bg-slate-100 px-4 py-3 text-slate-900"
          />
          <TextInput
            placeholder="Category"
            value={form.category}
            onChangeText={(value) =>
              setForm((prev) => ({ ...prev, category: value }))
            }
            className="mb-4 rounded-2xl bg-slate-100 px-4 py-3 text-slate-900"
          />
          <TextInput
            placeholder="Price"
            value={form.price}
            onChangeText={(value) =>
              setForm((prev) => ({ ...prev, price: value }))
            }
            keyboardType="decimal-pad"
            className="mb-4 rounded-2xl bg-slate-100 px-4 py-3 text-slate-900"
          />
          <TextInput
            placeholder="Stock quantity"
            value={form.stock}
            onChangeText={(value) =>
              setForm((prev) => ({ ...prev, stock: value }))
            }
            keyboardType="number-pad"
            className="mb-6 rounded-2xl bg-slate-100 px-4 py-3 text-slate-900"
          />

          <TouchableOpacity
            onPress={handleSave}
            className="rounded-2xl bg-blue-600 px-5 py-4 items-center">
            <Text className="text-white font-bold text-lg">
              {editingId ? "Save changes" : "Add product"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="space-y-4 pb-24">
          {products.map((product) => (
            <View
              key={product.id}
              className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
              <View className="flex-row justify-between items-start gap-4">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-slate-900">
                    {product.name}
                  </Text>
                  <Text className="text-slate-500 mt-1">
                    {product.category}
                  </Text>
                </View>
                <Text className="text-slate-900 font-bold">
                  ${product.price.toFixed(2)}
                </Text>
              </View>

              <View className="mt-4 flex-row justify-between items-center">
                <Text className="text-slate-500">Stock: {product.stock}</Text>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => handleEdit(product)}
                    className="rounded-2xl bg-slate-100 px-4 py-2">
                    <Text className="font-semibold text-slate-700">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(product.id)}
                    className="rounded-2xl bg-rose-100 px-4 py-2">
                    <Text className="font-semibold text-rose-700">Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
