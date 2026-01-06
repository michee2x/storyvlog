import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from '../../src/lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        Alert.alert("Login Failed", error.message);
        setLoading(false);
    } else {
        // Success
        setLoading(false);
        router.replace('/(tabs)/home');
    }
  }

  return (
    <View className="flex-1 bg-dark-bg justify-center px-8">
      <View className="items-center mb-10">
        <Text className="text-primary font-bold text-lg tracking-widest mb-2">STORYVLOG</Text>
        <Text className="text-4xl font-bold text-white">Welcome Back</Text>
      </View>

      <View className="space-y-4">
        <TextInput
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            className="bg-dark-card text-white px-4 py-4 rounded-xl border border-white/10"
        />
        <TextInput
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="bg-dark-card text-white px-4 py-4 rounded-xl border border-white/10 mt-4"
        />

        <TouchableOpacity 
            onPress={handleLogin}
            disabled={loading}
            className={`bg-primary py-4 rounded-xl items-center mt-6 ${loading ? 'opacity-70' : ''}`}
        >
             {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Log In</Text>}
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center mt-8">
        <Text className="text-gray-400">Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text className="text-primary font-bold">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
