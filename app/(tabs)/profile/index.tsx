import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';

interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  balance: number;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  // Fetch profile data on focus
  useFocusEffect(
    useCallback(() => {
      async function fetchProfile() {
        if (!user?.id) return;
        
        // Don't show loading spinner on refetch to keep UI stable
        // setLoading(true); 
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
        setLoading(false);
      }

      fetchProfile();
    }, [user?.id])
  );

  const StatItem = ({ label, value }: { label: string, value: string }) => (
    <View className="items-center flex-1">
      <Text className="text-white font-bold text-xl mb-1">{value}</Text>
      <Text className="text-gray-500 text-xs uppercase tracking-wider">{label}</Text>
    </View>
  );

  const MenuItem = ({ icon, label, isDestructive = false, onPress }: { icon: any, label: string, isDestructive?: boolean, onPress?: () => void }) => (
    <TouchableOpacity onPress={onPress} className="flex-row items-center p-4 border-b border-white/5 bg-dark-card first:rounded-t-2xl last:rounded-b-2xl mb-[1px]">
        <View className={`w-8 h-8 rounded-full justify-center items-center mr-4 ${isDestructive ? 'bg-red-500/10' : 'bg-white/5'}`}>
            <Ionicons name={icon} size={16} color={isDestructive ? '#EF4444' : 'white'} />
        </View>
        <Text className={`flex-1 text-base font-semibold ${isDestructive ? 'text-red-500' : 'text-white'}`}>{label}</Text>
        <Ionicons name="chevron-forward" size={16} color="#52525B" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header Profile */}
        <View className="items-center mt-8 mb-8">
            <View className="relative">
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
                            {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                          </Text>
                      </View>
                    )}
                </View>
                <View className="absolute bottom-4 right-0 bg-white p-1.5 rounded-full border-2 border-dark-bg">
                    <Ionicons name="camera" size={12} color="black" />
                </View>
            </View>
            <Text className="text-white text-2xl font-bold mb-1">
              {profile?.username || user?.email?.split('@')[0] || 'User'}
            </Text>
            <Text className="text-primary font-semibold">{user?.email || '@username'}</Text>
        </View>

        {/* Stats */}
        <View className="flex-row justify-between px-6 mb-10">
            <StatItem label="Books Read" value="12" />
            <View className="w-[1px] h-10 bg-white/10" />
            <StatItem label="Reading Time" value="42h" />
            <View className="w-[1px] h-10 bg-white/10" />
            <StatItem label="Following" value="145" />
        </View>

        {/* Menu Group 1 */}
        <View className="px-6 mb-8">
            <Text className="text-gray-500 text-xs font-bold uppercase mb-3 ml-2">Account</Text>
            <View>
                <MenuItem icon="person-outline" label="Edit Profile" onPress={() => router.push('/edit-profile')} />
                <MenuItem icon="notifications-outline" label="Notifications" />
                <MenuItem 
                  icon="shield-checkmark-outline" 
                  label="Privacy & Security" 
                  onPress={() => router.push('/privacy-policy')}
                />
            </View>
        </View>

        {/* Menu Group 2 */}
        <View className="px-6">
            <MenuItem 
              icon="help-buoy-outline" 
              label="Help & Support" 
              onPress={() => router.push('/help-support')}
            />
            <MenuItem icon="log-out-outline" label="Log Out" isDestructive onPress={handleLogout} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
