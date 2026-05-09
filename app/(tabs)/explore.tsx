import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
} from "react-native";

// Mock Data for the POS
const PRODUCTS = [
  { id: 1, name: "Espresso", price: 3.0, color: "bg-orange-100" },
  { id: 2, name: "Iced Latte", price: 4.5, color: "bg-blue-100" },
  { id: 3, name: "Matcha", price: 5.0, color: "bg-green-100" },
  { id: 4, name: "Croissant", price: 3.5, color: "bg-yellow-100" },
  { id: 5, name: "Americano", price: 3.25, color: "bg-stone-200" },
  { id: 6, name: "Flat White", price: 4.0, color: "bg-orange-50" },
];

export default function MidnightCornerPOS() {
  const [cart, setCart] = useState<
    { id: number; name: string; price: number; quantity: number }[]
  >([]);
  const [isCartVisible, setIsCartVisible] = useState(false);

  const addToCart = (product: (typeof PRODUCTS)[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

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
        <TouchableOpacity className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center">
          <Text className="text-slate-600 font-bold">HT</Text>
        </TouchableOpacity>
      </View>

      {/* --- PRODUCT GRID --- */}
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="flex-row flex-wrap justify-between">
          {PRODUCTS.map((product) => (
            <TouchableOpacity
              key={product.id}
              onPress={() => addToCart(product)}
              activeOpacity={0.7}
              className="bg-white p-3 rounded-2xl w-[48%] mb-4 shadow-sm border border-slate-100"
            >
              <View
                className={`w-full aspect-square ${product.color} rounded-xl mb-3 items-center justify-center`}
              >
                <Text className="text-4xl">☕</Text>
              </View>
              <Text
                className="font-bold text-slate-800 text-lg"
                numberOfLines={1}
              >
                {product.name}
              </Text>
              <Text className="text-blue-600 font-black text-md mt-1">
                ${product.price.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Padding for ScrollView to not hide behind the bottom bar */}
        <View className="h-24" />
      </ScrollView>

      {/* --- BOTTOM SUMMARY BAR --- */}
      {totalItems > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 pb-8 flex-row justify-between items-center shadow-lg">
          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase">
              {totalItems} Items
            </Text>
            <Text className="text-2xl font-black text-slate-900">
              ${totalAmount.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsCartVisible(true)}
            className="bg-blue-600 px-8 py-4 rounded-2xl shadow-blue-200 shadow-md"
          >
            <Text className="text-white font-bold text-lg">View Cart</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --- CART MODAL --- */}
      <Modal
        visible={isCartVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white p-6">
          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-3xl font-black text-slate-900">
              Current Order
            </Text>
            <TouchableOpacity onPress={() => setIsCartVisible(false)}>
              <Text className="text-blue-600 font-bold text-lg">Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1">
            {cart.map((item) => (
              <View
                key={item.id}
                className="flex-row justify-between items-center mb-6 pb-6 border-b border-slate-50"
              >
                <View className="flex-row items-center">
                  <View className="bg-slate-100 w-12 h-12 rounded-lg items-center justify-center mr-4">
                    <Text className="font-bold text-slate-800">
                      {item.quantity}x
                    </Text>
                  </View>
                  <View>
                    <Text className="text-lg font-bold text-slate-800">
                      {item.name}
                    </Text>
                    <Text className="text-slate-400 font-medium">
                      ${item.price.toFixed(2)} each
                    </Text>
                  </View>
                </View>
                <Text className="text-lg font-black text-slate-900">
                  ${(item.price * item.quantity).toFixed(2)}
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
                ${totalAmount.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              className="bg-blue-600 p-5 rounded-2xl items-center"
              onPress={() => {
                alert("Processing Payment...");
                setCart([]);
                setIsCartVisible(false);
              }}
            >
              <Text className="text-white font-black text-xl">
                Confirm & Charge
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
// import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

// export default function MobilePOS() {
//   return (
//     <SafeAreaView className="flex-1 bg-slate-50">
//       {/* Header */}
//       <View className="px-4 py-4 bg-white border-b border-slate-200">
//         <Text className="text-2xl font-bold text-slate-800">MidnightCorner POS</Text>
//       </View>

//       {/* Product Grid */}
//       <ScrollView className="flex-1 px-4 pt-4">
//         <View className="flex-row flex-wrap justify-between">
//           {[1, 2, 3, 4, 5, 6].map((item) => (
//             <TouchableOpacity
//               key={item}
//               className="bg-white p-3 rounded-xl w-[48%] mb-4 shadow-sm border border-slate-100"
//             >
//               <View className="w-full aspect-square bg-slate-100 rounded-lg mb-2" />
//               <Text className="font-semibold text-slate-800">Item {item}</Text>
//               <Text className="text-blue-600 font-bold">$4.50</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </ScrollView>

//       {/* Bottom Cart Summary (Mobile Sticky) */}
//       <View className="bg-white border-t border-slate-200 px-6 py-4 pb-8">
//         <View className="flex-row justify-between items-center mb-4">
//           <View>
//             <Text className="text-slate-500 text-sm">3 Items</Text>
//             <Text className="text-xl font-bold text-slate-800">$13.50</Text>
//           </View>
//           <TouchableOpacity className="bg-blue-600 px-8 py-3 rounded-full">
//             <Text className="text-white font-bold text-lg">View Cart</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }
// // import { Image } from 'expo-image';
// // import { Platform, StyleSheet } from 'react-native';

// // import { Collapsible } from '@/components/ui/collapsible';
// // import { ExternalLink } from '@/components/external-link';
// // import ParallaxScrollView from '@/components/parallax-scroll-view';
// // import { ThemedText } from '@/components/themed-text';
// // import { ThemedView } from '@/components/themed-view';
// // import { IconSymbol } from '@/components/ui/icon-symbol';
// // import { Fonts } from '@/constants/theme';

// // export default function TabTwoScreen() {
// //   return (
// //     <ParallaxScrollView
// //       headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
// //       headerImage={
// //         <IconSymbol
// //           size={310}
// //           color="#808080"
// //           name="chevron.left.forwardslash.chevron.right"
// //           style={styles.headerImage}
// //         />
// //       }>
// //       <ThemedView style={styles.titleContainer}>
// //         <ThemedText
// //           type="title"
// //           style={{
// //             fontFamily: Fonts.rounded,
// //           }}>
// //           Explore
// //         </ThemedText>
// //       </ThemedView>
// //       <ThemedText>This app includes example code to help you get started.</ThemedText>
// //       <Collapsible title="File-based routing">
// //         <ThemedText>
// //           This app has two screens:{' '}
// //           <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
// //           <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
// //         </ThemedText>
// //         <ThemedText>
// //           The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
// //           sets up the tab navigator.
// //         </ThemedText>
// //         <ExternalLink href="https://docs.expo.dev/router/introduction">
// //           <ThemedText type="link">Learn more</ThemedText>
// //         </ExternalLink>
// //       </Collapsible>
// //       <Collapsible title="Android, iOS, and web support">
// //         <ThemedText>
// //           You can open this project on Android, iOS, and the web. To open the web version, press{' '}
// //           <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
// //         </ThemedText>
// //       </Collapsible>
// //       <Collapsible title="Images">
// //         <ThemedText>
// //           For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
// //           <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
// //           different screen densities
// //         </ThemedText>
// //         <Image
// //           source={require('@/assets/images/react-logo.png')}
// //           style={{ width: 100, height: 100, alignSelf: 'center' }}
// //         />
// //         <ExternalLink href="https://reactnative.dev/docs/images">
// //           <ThemedText type="link">Learn more</ThemedText>
// //         </ExternalLink>
// //       </Collapsible>
// //       <Collapsible title="Light and dark mode components">
// //         <ThemedText>
// //           This template has light and dark mode support. The{' '}
// //           <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
// //           what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
// //         </ThemedText>
// //         <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
// //           <ThemedText type="link">Learn more</ThemedText>
// //         </ExternalLink>
// //       </Collapsible>
// //       <Collapsible title="Animations">
// //         <ThemedText>
// //           This template includes an example of an animated component. The{' '}
// //           <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
// //           the powerful{' '}
// //           <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
// //             react-native-reanimated
// //           </ThemedText>{' '}
// //           library to create a waving hand animation.
// //         </ThemedText>
// //         {Platform.select({
// //           ios: (
// //             <ThemedText>
// //               The <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
// //               component provides a parallax effect for the header image.
// //             </ThemedText>
// //           ),
// //         })}
// //       </Collapsible>
// //     </ParallaxScrollView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   headerImage: {
// //     color: '#808080',
// //     bottom: -90,
// //     left: -35,
// //     position: 'absolute',
// //   },
// //   titleContainer: {
// //     flexDirection: 'row',
// //     gap: 8,
// //   },
// // });
