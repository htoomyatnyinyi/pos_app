import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useAppDispatch } from "@/hooks/redux-hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/redux-hooks/useAppSelector";
import { logout } from "@/services/features/auth/authSlice";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  const SettingItem = ({ icon, title, subtitle, onPress, color = "#0f172a" }: any) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="bg-white p-6 rounded-3xl mb-4 shadow-sm border border-slate-100 flex-row items-center"
    >
      <View className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center mr-5">
        <IconSymbol name={icon} size={24} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-slate-900 font-black text-lg">{title}</Text>
        {subtitle && <Text className="text-slate-400 font-medium text-sm">{subtitle}</Text>}
      </View>
      <IconSymbol name="chevron.right" size={20} color="#94a3b8" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 40 }}>
        <View className="pt-10 pb-10 items-center">
          <View className="w-24 h-24 bg-slate-900 rounded-full items-center justify-center mb-4 shadow-lg">
            <Text className="text-white text-4xl font-black">{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <Text className="text-3xl font-black text-slate-900 tracking-tight">{user?.name || 'User'}</Text>
          <Text className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">Authorized Staff</Text>
        </View>

        <View className="mb-8">
          <Text className="text-slate-400 font-black text-xs uppercase tracking-[3px] mb-4 ml-2">Account Settings</Text>
          <SettingItem 
            icon="house.fill" 
            title="Business Profile" 
            subtitle="Update store info and location" 
          />
          <SettingItem 
            icon="paperplane.fill" 
            title="Notifications" 
            subtitle="Manage alerts and reports" 
          />
        </View>

        <View className="mb-8">
          <Text className="text-slate-400 font-black text-xs uppercase tracking-[3px] mb-4 ml-2">System</Text>
          <SettingItem 
            icon="square.grid.2x2.fill" 
            title="Display" 
            subtitle="Dark mode and UI density" 
          />
          <SettingItem 
            icon="clock.fill" 
            title="Backup & Sync" 
            subtitle="Last synced: Just now" 
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          className="bg-red-50 p-6 rounded-3xl flex-row items-center justify-center border border-red-100 mt-4"
        >
          <Text className="text-red-600 font-black text-lg">Sign Out</Text>
        </TouchableOpacity>
        
        <View className="mt-10 items-center">
          <Text className="text-slate-300 font-bold text-xs uppercase tracking-widest">POS System v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
