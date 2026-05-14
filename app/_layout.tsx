import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from "@/services/store/store";
import "../global.css";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAppSelector } from "@/hooks/redux-hooks/useAppSelector";

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { user } = useAppSelector((state) => state.auth);
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const router = useRouter();

  useEffect(() => {
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/login");
    } else if (user && inAuthGroup) {
      router.replace("/");
    }
  }, [user, segments, navigationState?.key]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />

        <Stack.Screen name="(auth)" />

        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
          }}
        />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootNavigator />
      </PersistGate>
    </Provider>
  );
}
// import { useEffect } from "react";
// import {
//   DarkTheme,
//   DefaultTheme,
//   ThemeProvider,
// } from "@react-navigation/native";
// import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import "react-native-reanimated";
// import { Provider } from "react-redux";
// import { store } from "@/services/store/store";
// import "../global.css";
// import { useColorScheme } from "@/hooks/use-color-scheme";
// import { useAppSelector } from "@/hooks/redux-hooks/useAppSelector";

// export const unstable_settings = {
//   anchor: "(tabs)",
// };

// function InitialLayout() {
//   const colorScheme = useColorScheme();
//   const { user } = useAppSelector((state) => state.auth);
//   const segments = useSegments();
//   const router = useRouter();
//   const navigationState = useRootNavigationState();

//   useEffect(() => {
//     if (!navigationState?.key) return;

//     const inAuthGroup = segments[0] === "(auth)";

//     if (!user && !inAuthGroup) {
//       // Redirect to login if not authenticated and not in auth group
//       router.replace("/login");
//     } else if (user && inAuthGroup) {
//       // Redirect to home if authenticated and in auth group
//       router.replace("/");
//     }
//   }, [user, segments, router, navigationState?.key]);

//   return (
//     <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         <Stack.Screen name="(auth)" options={{ headerShown: false }} />
//         <Stack.Screen
//           name="modal"
//           options={{ presentation: "modal", title: "Modal" }}
//         />
//       </Stack>
//       <StatusBar style="auto" />
//     </ThemeProvider>
//   );
// }

// export default function RootLayout() {
//   return (
//     <Provider store={store}>
//       <InitialLayout />
//     </Provider>
//   );
// }
