import { useGetCategoriesQuery } from "@/services/features/categories/categoryApi";
import { useGetProductsQuery } from "@/services/features/products/productApi";
import { mockProducts } from "@/services/features/products/mockProducts";
import { Product } from "@/services/features/products/productTypes";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "@/hooks/redux-hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/redux-hooks/useAppSelector";
import { addToCart, removeFromCart } from "@/services/features/cart/cartSlice";
import { FontAwesome6 } from "@expo/vector-icons";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StockItems = () => {
  // FETCH API DATA
  const { data: apiProducts = [], isLoading, error } = useGetProductsQuery();

  // const [isLoading] = useState(false);
  // const [error] = useState(false);
  const dispatch = useAppDispatch();
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const [showSidebar, setShowSidebar] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: categoryData = [], isLoading: isCategoriesLoading } =
    useGetCategoriesQuery();

  const dynamicCategories = useMemo(() => {
    // Start with API categories
    const apiCats = categoryData.map(c => ({ id: c.id, name: c.name }));
    
    // Add categories from current products if they don't exist in API cats
    const productCats = [
      ...new Set(products.map((p) => p.categoryId)),
    ].filter(id => !apiCats.some(c => c.id === id))
     .map(id => ({ id, name: id }));
     
    return [...apiCats, ...productCats];
  }, [categoryData, products]);

  // SET PRODUCTS FROM API WITH MOCK FALLBACK
  useEffect(() => {
    if (apiProducts && apiProducts.length > 0) {
      setProducts(apiProducts);
    } else if (!isLoading) {
      // Fallback to mock data if API is empty or errors out
      // We map mock data to match the Product interface if needed
      const mappedMocks: Product[] = mockProducts.map(p => ({
        id: String(p.id),
        sku: `SKU-${p.id}`,
        name: `Product ${p.id}`,
        costPrice: p.originalPrice,
        sellingPrice: p.sellingPrice,
        stockQuantity: p.quantities,
        categoryId: p.categories,
        imageUrl: p.img,
        createdAt: new Date().toISOString()
      }));
      setProducts(mappedMocks);
    }
  }, [apiProducts, isLoading]);

  // effect to set selectedCategory based on search
  useEffect(() => {
    if (searchQuery.length > 0) {
      const matchingProducts = products.filter((product) => {
        const query = searchQuery.toLowerCase();
        return (
          product.categoryId.toLowerCase().includes(query) ||
          product.sellingPrice.toString().includes(query) ||
          product.costPrice.toString().includes(query) ||
          product.stockQuantity.toString().includes(query)
        );
      });
      const uniqueCategories = [
        ...new Set(matchingProducts.map((p) => p.categoryId)),
      ];
      if (uniqueCategories.length === 1) {
        setSelectedCategory(uniqueCategories[0]);
      } else {
        setSelectedCategory("All");
      }
    } else {
      setSelectedCategory("All");
    }
  }, [searchQuery, products]);

  // filter products
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.categoryId === selectedCategory);

  const displayedProducts = filteredProducts.filter((product) => {
    if (searchQuery.length === 0) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.categoryId.toLowerCase().includes(query) ||
      product.sellingPrice.toString().includes(query) ||
      product.costPrice.toString().includes(query) ||
      product.stockQuantity.toString().includes(query)
    );
  });

  // add to cart
  const handleAddToCart = (product: Product) => {
    if (product.stockQuantity <= 0) return;
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.sellingPrice,
      qty: 1,
      productId: product.id,
      image: product.imageUrl
    }));
    setCartCount((prev) => prev + 1);
  };

  // remove from cart
  const handleRemoveFromCart = (id: string) => {
    dispatch(removeFromCart(id));
    setCartCount((prev) => Math.max(0, prev - 1));
  };

  const openAdd = () => {
    router.push({
      pathname: "/checkout" as any,
      params: {
        cart: JSON.stringify(cartItems),
      },
    });
  };
  const isInCart = (id: any) => {
    return cartItems.some((item: any) => item.id === id);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* HEADER */}
      <View className="px-6 pt-10 pb-6 flex-row justify-between items-center">
        <View>
          <Text className="text-4xl font-black text-slate-900">Products</Text>
          <Text className="text-slate-400 font-medium text-sm mt-1">
            Manage your catalog
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          {/* Sidebar Toggle */}
          <TouchableOpacity
            onPress={() => setShowSidebar(!showSidebar)}
            className="bg-white border border-slate-200 p-4 rounded-2xl"
          >
            <FontAwesome6 name="bars" size={20} color="#0f172a" />
          </TouchableOpacity>

          {/* Cart */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={openAdd}
            className="bg-slate-900 px-5 py-4 rounded-2xl relative"
          >
            <FontAwesome6 name="cart-plus" size={20} color="white" />
            {cartCount > 0 && (
              <View className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* LOADING (only show if we have no products yet) */}
      {isLoading && products.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : (
        <>
          <View className="px-4 pt-4 pb-2">
            <View className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex-row items-center">
              <Text className="text-slate-400 mr-2">🔍</Text>

              <TextInput
                placeholder="Search products, category, price..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 text-slate-900"
              />

              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Text className="text-slate-500 font-bold">✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View className="flex-1 flex-row">
            {/* LEFT CATEGORY SIDEBAR */}
            {showSidebar && (
              <View className="w-32 bg-white border-r border-slate-200 py-4">
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* ALL CATEGORY */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setSelectedCategory("All")}
                    className={`mx-3 mb-3 px-4 py-3 rounded-2xl ${
                      selectedCategory === "All"
                        ? "bg-slate-900"
                        : "bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <Text
                      className={`font-bold text-center ${
                        selectedCategory === "All"
                          ? "text-white"
                          : "text-slate-700"
                      }`}
                    >
                      All
                    </Text>
                  </TouchableOpacity>

                  {/* REAL CATEGORIES */}
                  {dynamicCategories.map((category) => {
                    const active = selectedCategory === category.id;

                    return (
                      <TouchableOpacity
                        key={category.id}
                        activeOpacity={0.8}
                        onPress={() => setSelectedCategory(category.id)}
                        className={`mx-3 mb-3 px-4 py-3 rounded-2xl ${
                          active
                            ? "bg-slate-900"
                            : "bg-slate-100 border border-slate-200"
                        }`}
                      >
                        <Text
                          className={`font-bold text-center ${
                            active ? "text-white" : "text-slate-700"
                          }`}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* PRODUCTS */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 120,
                paddingTop: 10,
              }}
              className="flex-1"
            >
              <View className="flex-row flex-wrap justify-between">
                {displayedProducts.map((product) => (
                  <View
                    key={product.id}
                    className="w-[48%] rounded-3xl mb-4 p-4 border shadow-sm bg-white border-slate-200 relative"
                  >
                    {isInCart(product.id) && (
                      <View className="absolute top-2 right-2 bg-green-500 px-2 py-1 rounded-full z-10">
                        <Text className="text-white text-xs font-bold">
                          In Cart
                        </Text>
                      </View>
                    )}
                      {/* IMAGE */}
                      {/* <Image
                        source={{ uri: product.img }}
                        className="w-full h-32 rounded-2xl bg-slate-100"
                        resizeMode="cover"
                      /> */}

                      {/* INFO */}
                      <View className="mt-4">
                        <Text className="text-slate-400 text-xs font-bold uppercase">
                          {product.categoryId}
                        </Text>

                        <Text className="text-lg font-black text-slate-900 mt-1">
                          {product.sellingPrice} MMK
                        </Text>

                        <Text className="text-slate-500 text-sm line-through">
                          {product.costPrice} MMK
                        </Text>

                        <View className="flex-row justify-between items-center mt-3">
                          <Text className="text-sm font-bold text-slate-700">
                            Stock: {product.stockQuantity}
                          </Text>

                          <View className="flex-row gap-2">
                            {isInCart(product.id) && (
                              <TouchableOpacity
                                  onPress={() => handleRemoveFromCart(product.id)}
                                  className="bg-red-500 w-9 h-9 rounded-full items-center justify-center"
                                >
                                  <Text className="text-white text-lg font-bold">
                                    -
                                  </Text>
                                </TouchableOpacity>
                              )}
                              <TouchableOpacity
                                onPress={() => handleAddToCart(product)}
                                className="bg-slate-900 w-9 h-9 rounded-full items-center justify-center"
                              >
                              <Text className="text-white text-lg font-bold">
                                +
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default StockItems;
