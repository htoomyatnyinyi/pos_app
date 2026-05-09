import { useState } from "react";
import { View, TextInput, Button, Text, TouchableOpacity } from "react-native";
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
    <View className="flex-1 justify-center p-5 bg-white">
      <Text className="text-3xl font-bold text-slate-800 mb-8">Create Account</Text>
      
      <View className="gap-4">
        <TextInput 
          placeholder="Full Name" 
          value={name} 
          onChangeText={setName}
          className="bg-slate-50 p-4 rounded-xl border border-slate-200"
        />

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
          onPress={handleRegister}
          disabled={isLoading}
          className="bg-blue-600 p-4 rounded-xl items-center mt-4"
        >
          <Text className="text-white font-bold text-lg">
            {isLoading ? "Creating Account..." : "Register"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push("/login")}
          className="items-center mt-2"
        >
          <Text className="text-slate-500">
            Already have an account? <Text className="text-blue-600 font-bold">Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
