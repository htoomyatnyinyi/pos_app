import { Tabs } from "expo-router";
import React from "react";
import { Platform, View, Text } from "react-native";
import { HapticTab } from "@/components/haptic-tab";

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View className="items-center justify-center gap-1.5 mt-2">
      <View className={`w-14 h-9 rounded-2xl items-center justify-center transition-all ${focused ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-transparent'}`}>
        <Text className={`text-xl ${focused ? 'opacity-100' : 'opacity-40'}`}>{emoji}</Text>
      </View>
      <Text className={`text-[9px] font-black tracking-[1.5px] uppercase ${focused ? 'text-indigo-400' : 'text-slate-600'}`}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#1a1c24",
          borderTopWidth: 1,
          borderTopColor: "#252833",
          height: Platform.OS === "ios" ? 94 : 74,
          paddingBottom: Platform.OS === "ios" ? 32 : 12,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📱" label="POS" focused={focused} /> }} />
      <Tabs.Screen name="orders" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🧾" label="Sales" focused={focused} /> }} />
      <Tabs.Screen name="inventory" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📦" label="Items" focused={focused} /> }} />
      <Tabs.Screen name="settings" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" label="Admin" focused={focused} /> }} />
    </Tabs>
  );
}
