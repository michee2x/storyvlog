import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../src/lib/supabase';
import { useNotifications } from '../../src/hooks/useNotifications';
import { Notification } from '../../src/types/notification';
import { useEffect } from 'react';

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { markAsRead } = useNotifications();

  const { data: notification, isLoading } = useQuery({
    queryKey: ['notification', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Notification;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (notification && !notification.read) {
        markAsRead.mutate(notification.id);
    }
  }, [notification]);

  const handleAction = () => {
    if (!notification) return;
    
    // Handle navigation based on type/data
    if (notification.type === 'comment' || notification.type === 'like') {
        if (notification.data?.story_id) {
            router.push(`/story/${notification.data.story_id}`);
        }
    } else if (notification.type === 'follow') {
        if (notification.data?.follower_id) {
             // router.push(`/user/${notification.data.follower_id}`); 
        }
    }
  };

  if (isLoading) {
    return (
        <View className="flex-1 bg-dark-bg justify-center items-center">
            <ActivityIndicator size="large" color="#FF2D55" />
        </View>
    );
  }

  if (!notification) {
      return (
          <View className="flex-1 bg-dark-bg justify-center items-center">
              <Text className="text-white">Notification not found</Text>
          </View>
      );
  }

  const hasAction = (notification.type === 'comment' || notification.type === 'like') && notification.data?.story_id;

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Details</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="flex-row items-center mb-6">
            <View className={`w-12 h-12 rounded-full justify-center items-center mr-4 ${
                notification.type === 'like' ? 'bg-red-500/20' :
                notification.type === 'comment' ? 'bg-blue-500/20' :
                notification.type === 'follow' ? 'bg-green-500/20' : 'bg-gray-500/20'
            }`}>
                <Ionicons
                name={
                    notification.type === 'like' ? 'heart' :
                    notification.type === 'comment' ? 'chatbubble' :
                    notification.type === 'follow' ? 'person-add' : 'information-circle'
                }
                size={24}
                color={
                    notification.type === 'like' ? '#ef4444' :
                    notification.type === 'comment' ? '#3b82f6' :
                    notification.type === 'follow' ? '#22c55e' : '#9ca3af'
                }
                />
            </View>
            <View className="flex-1">
                <Text className="text-white font-bold text-xl">{notification.title}</Text>
                <Text className="text-gray-400 text-sm">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </Text>
            </View>
        </View>

        <Text className="text-white text-lg leading-7 mb-8">
            {notification.message}
        </Text>

        {hasAction && (
            <TouchableOpacity 
                onPress={handleAction}
                className="bg-primary py-4 rounded-xl items-center"
            >
                <Text className="text-white font-bold text-lg">View Content</Text>
            </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
