import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StatusBar, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchStoryDetails, Story } from '../../src/api/stories';
import { extractColorsFromImage, ExtractedColors } from '../../src/utils/colorExtractor';

const { width } = Dimensions.get('window');

// Helper to format numbers (e.g. 1500 -> 1.5k)
function formatCompactNumber(number: number | string): string {
  const num = typeof number === 'string' ? parseInt(number, 10) : number;
  if (isNaN(num)) return '0';
  return Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(num);
}

// Helper to get helper icons based on specific categories
function getCategoryIcon(category: string): any {
  const cat = category.toLowerCase();
  if (cat.includes('romance')) return 'heart';
  if (cat.includes('fantasy')) return 'planet';
  if (cat.includes('adventure')) return 'compass';
  if (cat.includes('horror') || cat.includes('thriller')) return 'skull';
  if (cat.includes('action')) return 'flash';
  if (cat.includes('drama')) return 'film'; // Face like emoji?
  return 'book';
}

// Helper to check if color is light or dark to adjust text color
function getContrastColor(hexColor: string) {
  // Default to white if invalid hex
  if (!hexColor || !/^#[0-9A-F]{6}$/i.test(hexColor)) return 'white';
  
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128 ? 'black' : 'white';
}

export default function StoryDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState<ExtractedColors>({
    primary: '#1a1a2e',
    secondary: '#16213e',
    background: '#0f0f1a',
    accent: '#FF2D55',
  });

  const btnTextColor = getContrastColor(colors.accent);

  useEffect(() => {
    if (id) {
        loadStory(id as string);
    }
  }, [id]);

  async function loadStory(storyId: string) {
    try {
        const data = await fetchStoryDetails(storyId);
        setStory(data as any); 
        setChapters(data.chapters || []);
        
        if (data.coverImage) {
          const extractedColors = await extractColorsFromImage(data.coverImage);
          setColors(extractedColors);
        }
    } catch (e) {
        console.error("Failed to load story", e);
    } finally {
        setLoading(false);
    }
  }

  if (loading) {
    return (
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
            <ActivityIndicator color={colors.accent} size="large" />
        </View>
    );
  }

  if (!story) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white">Story not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Dynamic Background Gradient */}
      <LinearGradient
        colors={[colors.primary, colors.background]}
        locations={[0, 0.8]}
        className="absolute top-0 left-0 right-0 h-[50%]"
      />

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Controls */}
        <View className="flex-row justify-between items-center px-6 z-10" style={{ marginTop: insets.top + 10 }}>
             <TouchableOpacity 
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full justify-center items-center bg-black/20"
             >
                <Ionicons name="chevron-back" size={24} color="white" />
             </TouchableOpacity>
             <TouchableOpacity 
                className="w-10 h-10 rounded-full justify-center items-center bg-black/20"
             >
                <Ionicons name="share-outline" size={24} color="white" />
             </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View className="items-center px-6 mt-6">
          {/* Cover Image with Shadow Glow */}
          <View className="shadow-2xl shadow-black/50" style={{ 
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 10
          }}>
            <Image 
              source={story.coverImage} 
              style={{ width: width * 0.55, height: width * 0.8 }}
              className="rounded-xl"
              resizeMode="cover"
            />
          </View>

          {/* Title & Author */}
          <Text className="text-2xl font-bold text-white text-center mt-8 mb-2 leading-tight">
            {story.title}
          </Text>
          <Text className="text-gray-400 font-medium text-base mb-6">
            By {story.author}
          </Text>

{/* Stats Row */}
          <View className="flex-row items-center justify-around w-full mb-8 bg-white/5 mx-6 py-4 rounded-2xl border border-white/5 px-4 backdrop-blur-md">
               <View className="items-center flex-1">
                  <Ionicons name="eye" size={20} color={colors.accent} style={{ marginBottom: 4 }} />
                  <Text className="text-white font-bold text-base">{formatCompactNumber(story.views)}</Text>
                  <Text className="text-white/40 text-xs font-medium">Reads</Text>
               </View>
               <View className="items-center flex-1">
                  <Ionicons name="heart" size={20} color={colors.accent} style={{ marginBottom: 4 }} />
                  <Text className="text-white font-bold text-base">{formatCompactNumber(story.likes)}</Text>
                   <Text className="text-white/40 text-xs font-medium">Likes</Text>
               </View>
               <View className="items-center flex-1">
                  <Ionicons name="layers" size={20} color={colors.accent} style={{ marginBottom: 4 }} />
                  <Text className="text-white font-bold text-base">{story.chapters_count}</Text>
                   <Text className="text-white/40 text-xs font-medium">Parts</Text>
               </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row w-full flex gap-4 mb-8">
              <TouchableOpacity 
                  onPress={() => router.push({ pathname: `/story/[id]/read`, params: { id } })}
                  className="flex-1 py-3.5 rounded-full items-center shadow-lg active:opacity-90 flex-row justify-center space-x-2"
                  style={{ backgroundColor: colors.accent, shadowColor: colors.accent, shadowOpacity: 0.3, shadowRadius: 10 }}
              >
                  <Ionicons name="play" size={22} color={btnTextColor} />
                  <Text className="font-bold text-lg ml-2" style={{ color: btnTextColor }}>Read Now</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                  className="h-[3.5rem] aspect-square items-center justify-center rounded-full border border-white/10 bg-white/5 active:bg-white/10"
              >
                  <Ionicons name="bookmark-outline" size={22} color="white" />
              </TouchableOpacity>
          </View>
        </View>

        {/* Content Section */}
        <View className="px-6">
           <Text className="text-white font-bold text-lg mb-3">About</Text>
           <Text className="text-gray-400 leading-7 text-base mb-8">
             {story.description || "Join the adventure in this captivating story. Experience the journey through immersive storytelling and engaging characters."}
           </Text>
           
           {/* Tags */}
           <View className="flex-row flex-wrap gap-2 mb-8">
               {story.category && (
                 <View className="pl-3 pr-4 py-2 rounded-full bg-white/5 border border-white/10 flex-row items-center space-x-1.5">
                   <Ionicons 
                    name={getCategoryIcon(story.category)} 
                    size={14} 
                    color={colors.accent} 
                    style={{ marginRight: 6 }}
                   />
                   <Text className="text-gray-300 text-xs font-medium capitalize">{story.category}</Text>
                 </View>
               )}
               {story.status && (
                 <View className="pl-3 pr-4 py-2 rounded-full bg-white/5 border border-white/10 flex-row items-center">
                   <Ionicons 
                    name={story.status === 'completed' ? "checkmark-circle" : "time"} 
                    size={14} 
                    color={story.status === 'completed' ? "#4ade80" : "#fbbf24"}
                    style={{ marginRight: 6 }}
                   />
                   <Text className="text-gray-300 text-xs font-medium capitalize">
                     {story.status}
                   </Text>
                 </View>
               )}
           </View>

           {/* Chapters List */}
           <Text className="text-white font-bold text-lg mb-4">Episodes ({chapters.length})</Text>
           <View className="gap-3">
              {chapters.map((chapter, index) => (
                <TouchableOpacity 
                  key={chapter.id || index}
                  onPress={() => router.push({ pathname: `/story/[id]/read`, params: { id, chapterIndex: index } })}
                  className="flex-row items-center p-4 rounded-2xl bg-white/5 border border-white/5 active:bg-white/10"
                >
                  <View className="w-10 h-10 rounded-full justify-center items-center bg-white/5 mr-4">
                    <Text className="text-white/60 font-bold font-mono">{index + 1}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-medium text-base mb-0.5" numberOfLines={1}>
                      {chapter.title || `Episode ${index + 1}`}
                    </Text>
                    <Text className="text-white/40 text-xs">
                      5 mins
                    </Text>
                  </View>
                  <View className="w-8 h-8 rounded-full items-center justify-center border border-white/10">
                    <Ionicons name="play" size={14} color="white" style={{ marginLeft: 2 }} />
                  </View>
                </TouchableOpacity>
              ))}
              
              {chapters.length === 0 && (
                <Text className="text-gray-500 italic">No episodes available yet.</Text>
              )}
           </View>
        </View>
      </ScrollView>
    </View>
  );
}
