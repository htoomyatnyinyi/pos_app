import { useState } from "react";
import { View, TextInput, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useRegisterMutation } from "@/services/features/auth/authApi";
import { useAppDispatch } from "@/hooks/redux-hooks/useAppDispatch";
import { setUser } from "@/services/features/auth/authSlice";

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [register, { isLoading }] = useRegisterMutation();

  const handleRegister = async () => {
    try {
      const user = await register({
        name,
        email,
        password,
      }).unwrap();

      dispatch(setUser(user));
      router.replace("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-8"
      >
        <View className="mb-12">
          <Text className="text-4xl font-black text-slate-900 tracking-tight mb-2">Create Account</Text>
          <Text className="text-slate-500 font-medium text-base">Sign up to get started.</Text>
        </View>
        
        <View className="gap-5">
          <TextInput 
            placeholder="Full Name" 
            value={name} 
            onChangeText={setName}
            placeholderTextColor="#94a3b8"
            className="bg-slate-50 px-6 py-5 rounded-2xl text-slate-900 font-medium text-base"
          />

          <TextInput 
            placeholder="Email Address" 
            value={email} 
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#94a3b8"
            className="bg-slate-50 px-6 py-5 rounded-2xl text-slate-900 font-medium text-base"
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#94a3b8"
            className="bg-slate-50 px-6 py-5 rounded-2xl text-slate-900 font-medium text-base"
          />

          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleRegister}
            disabled={isLoading}
            className={`py-5 rounded-2xl items-center mt-6 shadow-sm ${isLoading ? 'bg-slate-200' : 'bg-slate-900'}`}
          >
            <Text className={`font-black text-lg ${isLoading ? 'text-slate-400' : 'text-white'}`}>
              {isLoading ? "Creating Account..." : "Register"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.6}
            onPress={() => router.push("/login")}
            className="items-center mt-4 p-2"
          >
            <Text className="text-slate-500 font-medium">
              Already have an account? <Text className="text-slate-900 font-bold">Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
