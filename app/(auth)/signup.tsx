import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../src/lib/supabase';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email || !password || !username) {
       return Alert.alert("Error", "Please fill in all fields");
    }
    setLoading(true);
    
    // Sign up with Supabase Auth - username is passed in metadata
    // The database trigger will automatically create the profile
    const { data: { session, user }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
        emailRedirectTo: undefined, // Disable email confirmation for development
      }
    });

    if (error) {
       Alert.alert("Signup Failed", error.message);
       setLoading(false);
       return;
    }

    // Success! The profile was created automatically by the database trigger
    Alert.alert("Success", "Account created! Please sign in.");
    router.replace('/(auth)/login');
    setLoading(false);
  }

  return (
    <View className="flex-1 bg-dark-bg justify-center px-8">
      <View className="items-center mb-10">
        <Text className="text-4xl font-bold text-white mb-2">Create Account</Text>
        <Text className="text-gray-400">Join StoryVlog today</Text>
      </View>

      <View className="space-y-4">
        <TextInput
            placeholder="Username"
            placeholderTextColor="#666"
            value={username}
            onChangeText={setUsername}
            className="bg-dark-card text-white px-4 py-4 rounded-xl border border-white/10"
        />
        <TextInput
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            className="bg-dark-card text-white px-4 py-4 rounded-xl border border-white/10 mt-4"
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
            onPress={handleSignup}
            disabled={loading}
            className={`bg-primary py-4 rounded-xl items-center mt-6 ${loading ? 'opacity-70' : ''}`}
        >
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Sign Up</Text>}
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center mt-8">
        <Text className="text-gray-400">Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-primary font-bold">Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
