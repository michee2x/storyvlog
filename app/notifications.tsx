import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, RefreshControl, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../src/hooks/useNotifications';
import { Notification } from '../src/types/notification';

export default function NotificationsScreen() {
  const router = useRouter();
  const { data: notifications, isLoading, refetch, isRefetching, markAsRead, markAllAsRead } = useNotifications();

  const handleNotificationPress = (notification: Notification) => {
    router.push(`/notifications/${notification.id}`);
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => handleNotificationPress(item)}
      className={`flex-row items-center p-4 border-b border-white/5 ${item.read ? 'opacity-50' : 'bg-white/5'}`}
    >
      <View className={`w-10 h-10 rounded-full justify-center items-center mr-3 ${
        item.type === 'like' ? 'bg-red-500/20' :
        item.type === 'comment' ? 'bg-blue-500/20' :
        item.type === 'follow' ? 'bg-green-500/20' : 'bg-gray-500/20'
      }`}>
        <Ionicons
          name={
            item.type === 'like' ? 'heart' :
            item.type === 'comment' ? 'chatbubble' :
            item.type === 'follow' ? 'person-add' : 'information-circle'
          }
          size={20}
          color={
            item.type === 'like' ? '#ef4444' :
            item.type === 'comment' ? '#3b82f6' :
            item.type === 'follow' ? '#22c55e' : '#9ca3af'
          }
        />
      </View>
      <View className="flex-1">
        <Text className="text-white font-semibold text-base">{item.title}</Text>
        <Text className="text-gray-400 text-sm mt-0.5">{item.message}</Text>
        <Text className="text-gray-600 text-xs mt-2">
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </Text>
      </View>
      {!item.read && (
        <View className="w-2 h-2 rounded-full bg-primary ml-2" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="px-4 py-3 flex-row justify-between items-center border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Notifications</Text>
        <TouchableOpacity onPress={() => markAllAsRead.mutate()}>
            <Ionicons name="checkmark-done-circle-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#FF2D55" />
        </View>
      ) : (
        <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
                <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#FF2D55" />
            }
            ListEmptyComponent={
                <View className="flex-1 justify-center items-center py-20">
                    <Ionicons name="notifications-off-outline" size={64} color="#333" />
                    <Text className="text-gray-500 mt-4 text-lg">No notifications yet</Text>
                </View>
            }
        />
      )}
    </SafeAreaView>
  );
}
