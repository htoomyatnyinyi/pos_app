import { useState } from "react";
import { View, TextInput, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { useLoginMutation } from "@/services/features/auth/authApi";
import { useAppDispatch } from "@/hooks/redux-hooks/useAppDispatch";
import { setUser } from "@/services/features/auth/authSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async () => {
    try {
      const user = await login({ email, password }).unwrap();
      dispatch(setUser(user));
      router.replace("/");
    } catch (error) {}
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1a1c24" }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-16">
            <View className="w-24 h-24 bg-[#252833] rounded-[32px] items-center justify-center shadow-2xl border border-slate-800 mb-8">
              <Text className="text-5xl">⚡</Text>
            </View>
            <Text className="text-4xl font-bold text-slate-100 tracking-tight mb-3">MidnightCorner</Text>
            <Text className="text-slate-500 font-bold tracking-[5px] uppercase text-[10px]">Security Gateway</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(200)} className="bg-[#252833] p-8 rounded-[40px] border border-slate-800 shadow-2xl">
            <View className="mb-6">
              <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3 ml-2">Email Address</Text>
              <TextInput 
                placeholder="name@example.com" value={email} onChangeText={setEmail}
                autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#475569"
                className="bg-[#1a1c24] px-6 py-5 rounded-2xl text-slate-100 font-bold border border-slate-800"
              />
            </View>

            <View className="mb-8 relative">
              <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3 ml-2">Password</Text>
              <TextInput
                placeholder="••••••••" secureTextEntry={!showPassword} value={password} onChangeText={setPassword}
                placeholderTextColor="#475569" className="bg-[#1a1c24] px-6 py-5 rounded-2xl text-slate-100 font-bold border border-slate-800 pr-14"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="absolute right-5 top-[44px]">
                <Text className="text-xl opacity-60">{showPassword ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              activeOpacity={0.8} onPress={handleLogin} disabled={isLoading}
              className={`py-6 rounded-[28px] items-center shadow-2xl ${isLoading ? 'bg-slate-800' : 'bg-indigo-600 shadow-indigo-600/20'}`}
            >
              <Text className="font-black text-xl text-white tracking-tight">{isLoading ? "Verifying..." : "Sign In"}</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(400)} className="items-center mt-10">
            <TouchableOpacity onPress={() => router.push("/register")} className="p-4">
              <Text className="text-slate-500 font-bold text-sm tracking-tight">
                New to the platform? <Text className="text-indigo-400">Request Access</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
