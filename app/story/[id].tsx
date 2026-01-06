import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchStoryDetails, Story } from '../../src/api/stories';

export default function StoryDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
        loadStory(id as string);
    }
  }, [id]);

  async function loadStory(storyId: string) {
    try {
        const data = await fetchStoryDetails(storyId);
        setStory(data as any); // Cast to handle coverImage mismatch if needed, though fetchStoryDetails handles it safely mostly
        setChapters(data.chapters || []);
    } catch (e) {
        console.error("Failed to load story", e);
    } finally {
        setLoading(false);
    }
  }

  if (loading) {
    return (
        <View className="flex-1 bg-dark-bg justify-center items-center">
            <ActivityIndicator color="#FF2D55" size="large" />
        </View>
    );
  }

  if (!story) {
    return (
      <View className="flex-1 bg-dark-bg justify-center items-center">
        <Text className="text-white">Story not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark-bg">
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView className="flex-1" bounces={false}>
        {/* Parallax-like Header */}
        <View className="relative h-96">
          <Image 
            source={story.coverImage} 
            className="w-full h-full"
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(15, 15, 26, 1)']}
            className="absolute bottom-0 left-0 right-0 h-48"
          />
          
          {/* Header Controls */}
          <View className="absolute top-12 left-4 right-4 flex-row justify-between items-center z-10">
             <TouchableOpacity 
                onPress={() => router.back()}
                className="w-10 h-10 bg-black/30 rounded-full justify-center items-center backdrop-blur-md"
             >
                <Ionicons name="chevron-back" size={24} color="white" />
             </TouchableOpacity>
             <TouchableOpacity 
                className="w-10 h-10 bg-black/30 rounded-full justify-center items-center backdrop-blur-md"
             >
                <Ionicons name="heart-outline" size={24} color="white" />
             </TouchableOpacity>
          </View>
        </View>

        {/* Content Container */}
        <View className="px-6 -mt-10 pb-20">
          <Text className="text-3xl font-bold text-white mb-2">{story.title}</Text>
          <Text className="text-gray-400 mb-4">By {story.author} • Created Jan 16 2026</Text>
          
          {/* Tags */}
          <View className="flex-row gap-2 flex space-x-3 mb-6">
              <View className="px-3 py-1 rounded-full bg-dark-card border border-white/10">
                  <Text className="text-gray-300 text-xs">Fantasy</Text>
              </View>
              <View className="px-3 py-1 rounded-full bg-dark-card border border-white/10">
                  <Text className="text-gray-300 text-xs">Adventure</Text>
              </View>
          </View>

          {/* Stats */}
          <View className="flex-row items-center mb-8 bg-dark-card p-4 rounded-xl border border-white/5 justify-between">
              <View className="items-center">
                 <Ionicons name="eye-outline" size={20} color="#8E8E93" />
                 <Text className="text-gray-400 text-xs mt-1">1.4M reads</Text>
              </View>
              <View className="h-8 w-[1px] bg-white/10" />
              <View className="items-center">
                 <Ionicons name="thumbs-up-outline" size={20} color="#8E8E93" />
                 <Text className="text-gray-400 text-xs mt-1">{story.likes} Likes</Text>
              </View>
              <View className="h-8 w-[1px] bg-white/10" />
              <View className="items-center">
                 <Ionicons name="list-outline" size={20} color="#8E8E93" />
                 <Text className="text-gray-400 text-xs mt-1">{story.chapters.length} Episodes</Text>
              </View>
          </View>

          <Text className="text-xl font-bold text-white mb-3">About The Story</Text>
          <Text className="text-gray-400 leading-6 mb-8">{story.description} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>

          {/* Action Buttons */}
          <View className="flex-row flex gap-2 space-x-4 mb-8">
              <TouchableOpacity className="flex-1 bg-white py-4 rounded-xl items-center">
                  <Text className="text-black font-bold font-lg">Preview</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-primary py-4 rounded-xl items-center shadow-lg shadow-primary/30">
                  <Text className="text-white font-bold font-lg">Read Book</Text>
              </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
