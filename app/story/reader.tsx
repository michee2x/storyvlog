import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { STORIES } from '../../src/api/stories';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function ReaderScreen() {
  const { storyId, chapterId } = useLocalSearchParams();
  const router = useRouter();
  
  const story = STORIES.find(s => s.id === storyId);
  const chapter = story?.chapters.find(c => c.id === chapterId);

  // Simple state for "Progress" simulation
  const [progress, setProgress] = useState(0);

  if (!story || !chapter) {
    return <View className="flex-1 justify-center items-center"><Text>Error loading chapter</Text></View>;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Reader Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
        <Text className="font-bold text-gray-700 flex-1 text-center" numberOfLines={1}>{chapter.title}</Text>
        <TouchableOpacity>
           <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 100 }}>
        <Text className="text-xl leading-8 text-gray-800 font-serif">
          {chapter.content}
          {"\n\n"}
          {/* Repeat content to make it scrollable for demo */}
          {chapter.content}
          {"\n\n"}
          {chapter.content}
        </Text>
        
        <View className="mt-8 mb-8 items-center">
            <Text className="text-gray-400">End of Chapter</Text>
        </View>
      </ScrollView>

      {/* Footer / Progress Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
         <View className="h-1 bg-gray-200 rounded-full mb-2">
             <View className="h-1 bg-blue-500 rounded-full w-1/3" /> 
         </View>
         <Text className="text-center text-xs text-gray-400">Chapter 1 of {story.chapters.length}</Text>
      </View>
    </SafeAreaView>
  );
}
