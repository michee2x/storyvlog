import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { supabase } from '../../src/lib/supabase';

interface PublicProfile {
  id: string;
  username: string;
  avatar_url?: string;
}

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 bg-dark-bg justify-center items-center">
        <ActivityIndicator size="large" color="#FF2D55" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 bg-dark-bg justify-center items-center">
        <Text className="text-white">User not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      <View className="flex-row items-center px-4 py-2">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg ml-2">Profile</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Header */}
        <View className="items-center mt-6 mb-8">
            <View className="w-24 h-24 rounded-full bg-gray-700 border-4 border-dark-bg mb-4 overflow-hidden">
                {profile.avatar_url ? (
                  <Image
                    source={{ uri: profile.avatar_url }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <View className="w-full h-full bg-primary justify-center items-center">
                      <Text className="text-4xl text-white font-bold">
                        {profile.username?.[0]?.toUpperCase() || 'U'}
                      </Text>
                  </View>
                )}
            </View>
            <Text className="text-white text-2xl font-bold mb-1">
              {profile.username}
            </Text>
        </View>

        {/* Stats */}
        <View className="flex-row justify-between px-6 mb-10">
            <View className="items-center flex-1">
                <Text className="text-white text-lg font-bold">0</Text>
                <Text className="text-gray-400 text-xs uppercase">Stories</Text>
            </View>
            <View className="w-[1px] h-10 bg-white/10" />
            <View className="items-center flex-1">
                <Text className="text-white text-lg font-bold">0</Text>
                <Text className="text-gray-400 text-xs uppercase">Followers</Text>
            </View>
            <View className="w-[1px] h-10 bg-white/10" />
            <View className="items-center flex-1">
                <Text className="text-white text-lg font-bold">0</Text>
                <Text className="text-gray-400 text-xs uppercase">Following</Text>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
