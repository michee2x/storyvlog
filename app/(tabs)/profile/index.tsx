import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useProfile } from '../../../src/hooks/useProfile';

export default function ProfileScreen() {
  const router = useRouter(); 
  const { signOut } = useAuth();
  
  // React Query Hook - Automatically handles caching & background refetch
  const { data: profile, isLoading } = useProfile();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  // Menu items config
  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', route: '/edit-profile' },
    { icon: 'notifications-outline', label: 'Notifications', route: '/notifications' },
    { icon: 'shield-checkmark-outline', label: 'Privacy & Policy', route: '/privacy-policy' },
    { icon: 'help-circle-outline', label: 'Help & Support', route: '/help-support' },
  ];

  if (isLoading) {
      return (
          <View className="flex-1 bg-dark-bg justify-center items-center">
              <ActivityIndicator size="large" color="#FF2D55" />
          </View>
      );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center">
        <Text className="text-white text-2xl font-bold">Profile</Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#FF2D55" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* User Info */}
        <View className="items-center mt-6 mb-8">
            <View className="w-24 h-24 rounded-full bg-gray-700 border-4 border-dark-bg mb-4 overflow-hidden">
                {profile?.avatar_url ? (
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
                            {profile?.username?.[0]?.toUpperCase() || 'U'}
                        </Text>
                    </View>
                )}
            </View>
            <Text className="text-white text-2xl font-bold mb-1">
                {profile?.username || 'User'}
            </Text>
            <Text className="text-gray-400 text-sm">
                 Member since 2024
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

        {/* Menu */}
        <View className="px-6">
            <Text className="text-gray-500 font-bold mb-4 uppercase text-xs">Settings</Text>
            
            {menuItems.map((item, index) => (
                <TouchableOpacity 
                    key={index}
                    onPress={() => item.route && router.push(item.route as any)}
                    className="flex-row items-center bg-dark-card p-4 rounded-2xl mb-3 border border-white/5 active:bg-white/5"
                >
                    <View className="w-10 h-10 rounded-full bg-white/5 justify-center items-center mr-4">
                        <Ionicons name={item.icon as any} size={20} color="white" />
                    </View>
                    <Text className="text-white text-base font-medium flex-1">
                        {item.label}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
            ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
