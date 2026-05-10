import React, { useMemo, useState, useEffect } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
} from "react-native";
import { FaCartPlus, FaBars, FaMinus } from "react-icons/fa";
import { router } from "expo-router";
import { mockProdcuts } from "@/services/features/products/mockProducts";

const StockItems = () => {
  const [isLoading] = useState(false);
  const [error] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showSidebar, setShowSidebar] = useState(true);

  const [products, setProducts] = useState(mockProdcuts);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // unique categories
  const categories = useMemo(() => {
    const unique = [
      "All",
      ...new Set(mockProdcuts.map((item) => item.categories)),
    ];
    return unique;
  }, []);

  // effect to set selectedCategory based on search
  useEffect(() => {
    if (searchQuery.length > 0) {
      const matchingProducts = products.filter((product) => {
        const query = searchQuery.toLowerCase();
        return (
          product.categories.toLowerCase().includes(query) ||
          product.sellingPrice.toString().includes(query) ||
          product.originalPrice.toString().includes(query) ||
          product.quantities.toString().includes(query)
        );
      });
      const uniqueCategories = [
        ...new Set(matchingProducts.map((p) => p.categories)),
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
      : products.filter((product) => product.categories === selectedCategory);

  const displayedProducts = filteredProducts.filter((product) => {
    if (searchQuery.length === 0) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.categories.toLowerCase().includes(query) ||
      product.sellingPrice.toString().includes(query) ||
      product.originalPrice.toString().includes(query) ||
      product.quantities.toString().includes(query)
    );
  });

  // add to cart
  const handleAddToCart = (id: any) => {
    const selectedProduct = products.find((p) => p.id === id);

    if (!selectedProduct || selectedProduct.quantities <= 0) return;

    // 1. reduce stock
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              quantities: product.quantities - 1,
            }
          : product,
      ),
    );

    // 2. update cart items
    setCartItems((prev: any) => {
      const existing = prev.find((item: any) => item.id === id);

      if (existing) {
        return prev.map((item: any) =>
          item.id === id
            ? {
                ...item,
                qty: item.qty + 1,
              }
            : item,
        );
      }

      return [
        ...prev,
        {
          ...selectedProduct,
          qty: 1,
        },
      ];
    });

    // 3. update cart badge
    setCartCount((prev) => prev + 1);
  };

  // remove from cart
  const handleRemoveFromCart = (id: any) => {
    const existing = cartItems.find((item: any) => item.id === id);

    if (!existing || existing.qty <= 0) return;

    // 1. increase stock
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              quantities: product.quantities + 1,
            }
          : product,
      ),
    );

    // 2. update cart items
    setCartItems((prev: any) => {
      const updated = prev
        .map((item: any) =>
          item.id === id
            ? {
                ...item,
                qty: item.qty - 1,
              }
            : item,
        )
        .filter((item: any) => item.qty > 0);

      return updated;
    });

    // 3. update cart badge
    setCartCount((prev) => prev - 1);
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
            className="bg-white border border-slate-200 p-4 rounded-2xl">
            <FaBars color="#0f172a" />
          </TouchableOpacity>

          {/* Cart */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={openAdd}
            className="bg-slate-900 px-5 py-4 rounded-2xl relative">
            <FaCartPlus color="white" />
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

      {/* LOADING */}
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
                  {categories.map((category, i) => {
                    const active = selectedCategory === category;

                    return (
                      <TouchableOpacity
                        key={i}
                        activeOpacity={0.8}
                        onPress={() => setSelectedCategory(category)}
                        className={`mx-3 mb-3 px-4 py-3 rounded-2xl ${
                          active
                            ? "bg-slate-900"
                            : "bg-slate-100 border border-slate-200"
                        }`}>
                        <Text
                          className={`font-bold text-center ${
                            active ? "text-white" : "text-slate-700"
                          }`}>
                          {category}
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
              className="flex-1">
              <View className="flex-row flex-wrap justify-between">
                {displayedProducts.map((product) => (
                  <>
                    {isInCart(product.id) && (
                      <View className="absolute top-2 right-2 bg-green-500 px-2 py-1 rounded-full">
                        <Text className="text-white text-xs font-bold">
                          In Cart
                        </Text>
                      </View>
                    )}
                    <View
                      key={product.id}
                      className="w-[48%] rounded-3xl mb-4 p-4 border shadow-sm bg-white border-slate-200">
                      {/* IMAGE */}
                      <Image
                        source={{ uri: product.img }}
                        className="w-full h-32 rounded-2xl bg-slate-100"
                        resizeMode="cover"
                      />

                      {/* INFO */}
                      <View className="mt-4">
                        <Text className="text-slate-400 text-xs font-bold uppercase">
                          {product.categories}
                        </Text>

                        <Text className="text-lg font-black text-slate-900 mt-1">
                          {product.sellingPrice} MMK
                        </Text>

                        <Text className="text-slate-500 text-sm line-through">
                          {product.originalPrice} MMK
                        </Text>

                        <View className="flex-row justify-between items-center mt-3">
                          <Text className="text-sm font-bold text-slate-700">
                            Stock: {product.quantities}
                          </Text>

                          <View className="flex-row gap-2">
                            {isInCart(product.id) && (
                              <TouchableOpacity
                                onPress={() => handleRemoveFromCart(product.id)}
                                className="bg-red-500 w-9 h-9 rounded-full items-center justify-center">
                                <Text className="text-white text-lg font-bold">
                                  -
                                </Text>
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity
                              onPress={() => handleAddToCart(product.id)}
                              className="bg-slate-900 w-9 h-9 rounded-full items-center justify-center">
                              <Text className="text-white text-lg font-bold">
                                +
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  </>
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
