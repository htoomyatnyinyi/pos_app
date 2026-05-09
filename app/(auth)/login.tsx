import { useState } from "react";
import { View, TextInput, Text, TouchableOpacity } from "react-native";
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
    <View className="flex-1 justify-center p-5 bg-white">
      <Text className="text-3xl font-bold text-slate-800 mb-8">Welcome Back</Text>
      
      <View className="gap-4">
        <TextInput 
          placeholder="Email Address" 
          value={email} 
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          className="bg-slate-50 p-4 rounded-xl border border-slate-200"
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          className="bg-slate-50 p-4 rounded-xl border border-slate-200"
        />

        <TouchableOpacity 
          onPress={handleLogin}
          disabled={isLoading}
          className="bg-blue-600 p-4 rounded-xl items-center mt-4"
        >
          <Text className="text-white font-bold text-lg">
            {isLoading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push("/register")}
          className="items-center mt-2"
        >
          <Text className="text-slate-500">
            Don't have an account? <Text className="text-blue-600 font-bold">Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
