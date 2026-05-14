import { useState } from "react";
import { View, TextInput, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useRegisterMutation } from "@/services/features/auth/authApi";
import { useAppDispatch } from "@/hooks/redux-hooks/useAppDispatch";
import { setUser } from "@/services/features/auth/authSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [register, { isLoading }] = useRegisterMutation();

  const handleRegister = async () => {
    try {
      const user = await register({ name, email, password }).unwrap();
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
          <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-12">
            <View className="w-20 h-20 bg-[#252833] rounded-[28px] items-center justify-center shadow-2xl border border-slate-800 mb-6">
              <Text className="text-4xl">✨</Text>
            </View>
            <Text className="text-4xl font-bold text-slate-100 tracking-tight mb-2">Create Account</Text>
            <Text className="text-slate-500 font-bold tracking-[4px] uppercase text-[9px]">Terminal Enrollment</Text>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.duration(600).delay(200)} className="bg-[#252833] p-8 rounded-[40px] border border-slate-800 shadow-2xl">
            <View className="mb-5">
              <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-2">Full Name</Text>
              <TextInput 
                placeholder="Full Name" value={name} onChangeText={setName}
                placeholderTextColor="#475569" className="bg-[#1a1c24] px-6 py-5 rounded-2xl text-slate-100 font-bold border border-slate-800"
              />
            </View>

            <View className="mb-5">
              <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-2">Email Address</Text>
              <TextInput 
                placeholder="Email" value={email} onChangeText={setEmail}
                autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#475569"
                className="bg-[#1a1c24] px-6 py-5 rounded-2xl text-slate-100 font-bold border border-slate-800"
              />
            </View>

            <View className="mb-8 relative">
              <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-2">Password</Text>
              <TextInput
                placeholder="••••••••" secureTextEntry={!showPassword} value={password} onChangeText={setPassword}
                placeholderTextColor="#475569" className="bg-[#1a1c24] px-6 py-5 rounded-2xl text-slate-100 font-bold border border-slate-800 pr-14"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="absolute right-5 top-[42px]">
                <Text className="text-xl opacity-60">{showPassword ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              activeOpacity={0.8} onPress={handleRegister} disabled={isLoading}
              className={`py-6 rounded-[28px] items-center shadow-2xl ${isLoading ? 'bg-slate-800' : 'bg-indigo-600 shadow-indigo-600/20'}`}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="font-black text-xl text-white tracking-tight">Register Terminal</Text>}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(400)} className="items-center mt-8">
            <TouchableOpacity onPress={() => router.push("/login")} className="p-4">
              <Text className="text-slate-500 font-bold text-sm tracking-tight">
                Already registered? <Text className="text-indigo-400">Sign In</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
