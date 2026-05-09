import {
  MOCK_FINANCE_HISTORY,
  MOCK_NOTIFICATIONS,
  MOCK_PRODUCTS,
} from "@/services/mock/mockData";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const totalRevenue = MOCK_FINANCE_HISTORY.filter(
    (record) => record.type === "income",
  ).reduce((sum, record) => sum + record.amount, 0);

  const totalExpenses = MOCK_FINANCE_HISTORY.filter(
    (record) => record.type === "expense",
  ).reduce((sum, record) => sum + Math.abs(record.amount), 0);

  const totalOrders = MOCK_NOTIFICATIONS.filter(
    (item) => item.type === "order",
  ).length;

  const lowStockCount = MOCK_PRODUCTS.filter(
    (product) => product.stock < 5,
  ).length;

  const topProducts = MOCK_PRODUCTS.slice()
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 4);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar style="dark" />

      <View className="px-6 py-5 bg-white border-b border-slate-200">
        <Text className="text-3xl font-bold text-slate-900">Mini Shop POS</Text>
        <Text className="text-slate-500 mt-2">
          A simple point of sale dashboard with stock, product CRUD, history,
          and finance.
        </Text>
      </View>

      <ScrollView className="px-6 pt-4 pb-24">
        <View className="grid-cols-2 gap-4">
          <View className="mb-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
            <Text className="text-slate-500">Revenue</Text>
            <Text className="mt-4 text-3xl font-bold text-slate-900">
              ${totalRevenue.toFixed(2)}
            </Text>
          </View>
          <View className="mb-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
            <Text className="text-slate-500">Expenses</Text>
            <Text className="mt-4 text-3xl font-bold text-slate-900">
              ${totalExpenses.toFixed(2)}
            </Text>
          </View>
          <View className="mb-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
            <Text className="text-slate-500">Orders</Text>
            <Text className="mt-4 text-3xl font-bold text-slate-900">
              {totalOrders}
            </Text>
          </View>
          <View className="mb-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
            <Text className="text-slate-500">Low stock</Text>
            <Text className="mt-4 text-3xl font-bold text-slate-900">
              {lowStockCount}
            </Text>
          </View>
        </View>

        <View className="mt-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
          <Text className="text-xl font-bold text-slate-900">
            Quick actions
          </Text>
          <View className="mt-4 flex-row flex-wrap gap-3">
            <TouchableOpacity
              onPress={() => router.push("/stock")}
              className="rounded-2xl bg-blue-600 px-4 py-3">
              <Text className="text-white font-semibold">View stock</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/add")}
              className="rounded-2xl bg-slate-900 px-4 py-3">
              <Text className="text-white font-semibold">Add product</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/notification")}
              className="rounded-2xl bg-slate-100 px-4 py-3">
              <Text className="font-semibold text-slate-900">
                Order history
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/finance")}
              className="rounded-2xl bg-slate-100 px-4 py-3">
              <Text className="font-semibold text-slate-900">Finance</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
          <Text className="text-xl font-bold text-slate-900">Top selling</Text>
          <View className="mt-4 space-y-4">
            {topProducts.map((product) => (
              <View
                key={product.id}
                className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                <Text className="font-semibold text-slate-900">
                  {product.name}
                </Text>
                <Text className="text-slate-500 mt-1">{product.category}</Text>
                <View className="mt-3 flex-row justify-between items-center">
                  <Text className="text-slate-600">Sold {product.sold}</Text>
                  <Text className="font-bold text-slate-900">
                    ${product.price.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
// import { Image } from 'expo-image';
// import { Platform, StyleSheet } from 'react-native';

// import { HelloWave } from '@/components/hello-wave';
// import ParallaxScrollView from '@/components/parallax-scroll-view';
// import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';
// import { Link } from 'expo-router';

// export default function HomeScreen() {
//   return (
//     <ParallaxScrollView
//       headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
//       headerImage={
//         <Image
//           source={require('@/assets/images/partial-react-logo.png')}
//           style={styles.reactLogo}
//         />
//       }>
//       <ThemedView style={styles.titleContainer}>
//         <ThemedText type="title">Welcome!</ThemedText>
//         <HelloWave />
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Step 1: Try it</ThemedText>
//         <ThemedText>
//           Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
//           Press{' '}
//           <ThemedText type="defaultSemiBold">
//             {Platform.select({
//               ios: 'cmd + d',
//               android: 'cmd + m',
//               web: 'F12',
//             })}
//           </ThemedText>{' '}
//           to open developer tools.
//         </ThemedText>
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <Link href="/modal">
//           <Link.Trigger>
//             <ThemedText type="subtitle">Step 2: Explore</ThemedText>
//           </Link.Trigger>
//           <Link.Preview />
//           <Link.Menu>
//             <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
//             <Link.MenuAction
//               title="Share"
//               icon="square.and.arrow.up"
//               onPress={() => alert('Share pressed')}
//             />
//             <Link.Menu title="More" icon="ellipsis">
//               <Link.MenuAction
//                 title="Delete"
//                 icon="trash"
//                 destructive
//                 onPress={() => alert('Delete pressed')}
//               />
//             </Link.Menu>
//           </Link.Menu>
//         </Link>

//         <ThemedText>
//           {`Tap the Explore tab to learn more about what's included in this starter app.`}
//         </ThemedText>
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
//         <ThemedText>
//           {`When you're ready, run `}
//           <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
//           <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
//           <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
//           <ThemedText type="defaultSemiBold">app-example</ThemedText>.
//         </ThemedText>
//       </ThemedView>
//     </ParallaxScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   stepContainer: {
//     gap: 8,
//     marginBottom: 8,
//   },
//   reactLogo: {
//     height: 178,
//     width: 290,
//     bottom: 0,
//     left: 0,
//     position: 'absolute',
//   },
// });
