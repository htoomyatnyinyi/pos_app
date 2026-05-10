import { useState } from "react";
import { View, TextInput, Text, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { useLoginMutation } from "@/services/features/auth/authApi";
import { useAppDispatch } from "@/hooks/redux-hooks/useAppDispatch";
import { setUser } from "@/services/features/auth/authSlice";

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async () => {
    try {
      const user = await login({
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
          <Text className="text-4xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</Text>
          <Text className="text-slate-500 font-medium text-base">Sign in to continue to POS.</Text>
        </View>
        
        <View className="gap-5">
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
            onPress={handleLogin}
            disabled={isLoading}
            className={`py-5 rounded-2xl items-center mt-6 shadow-sm ${isLoading ? 'bg-slate-200' : 'bg-slate-900'}`}
          >
            <Text className={`font-black text-lg ${isLoading ? 'text-slate-400' : 'text-white'}`}>
              {isLoading ? "Logging in..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.6}
            onPress={() => router.push("/register")}
            className="items-center mt-4 p-2"
          >
            <Text className="text-slate-500 font-medium">
              Don't have an account? <Text className="text-slate-900 font-bold">Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
