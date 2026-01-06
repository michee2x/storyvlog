import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchStories, Story } from '../../../src/api/stories';
import StoryCardSkeleton from '../../../src/components/cards/StoryCardSkeleton';
import TopCreatorSkeleton from '../../../src/components/skeletons/TopCreatorSkeleton';
import StoryCard from '../../../src/components/cards/StoryCard';

export default function HomeScreen() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
        const fetchPromise = fetchStories();
        const minWait = new Promise(resolve => setTimeout(resolve, 800));
        const [data] = await Promise.all([fetchPromise, minWait]);
        setStories(data);
        setLoading(false);
    }
    init();
  }, []);

  // Loading State - EXACT replica of the actual UI structure
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
        <StatusBar barStyle="light-content" />
        
        {/* Sticky Header - Exact match */}
        <View className="px-6 py-4 flex-row justify-between items-center bg-dark-bg z-10">
          <View>
            <View className="w-32 h-7 bg-white/10 rounded mb-1" />
            <View className="w-28 h-7 bg-white/10 rounded" />
          </View>
          <View className="flex-row space-x-4 gap-3">
            <View className="w-10 h-10 rounded-full bg-white/10" />
            <View className="w-10 h-10 rounded-full bg-white/10" />
          </View>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
          <View className="p-6 pt-2">
            
            {/* Top Creators Section - Exact match */}
            <View className="mb-8">
              <View className="flex-row justify-between items-end mb-4">
                <View className="w-24 h-5 bg-white/10 rounded" />
                <View className="w-16 h-3 bg-white/10 rounded" />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <TopCreatorSkeleton key={i} />
                ))}
              </ScrollView>
            </View>

            {/* My Collection Section - Exact match */}
            <View className="mb-8">
              <View className="flex-row justify-between items-end mb-4">
                <View className="w-28 h-6 bg-white/10 rounded" />
                <View className="w-16 h-3 bg-white/10 rounded" />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[1, 2, 3, 4].map(i => <StoryCardSkeleton key={`collection-${i}`} />)}
              </ScrollView>
            </View>

            {/* New Arrivals Section - Exact match */}
            <View className="mb-8">
              <View className="w-24 h-6 bg-white/10 rounded mb-4" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[1, 2, 3, 4].map(i => <StoryCardSkeleton key={`arrivals-${i}`} />)}
              </ScrollView>
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Sticky Header Container */}
      <View className="px-6 py-4 flex-row justify-between items-center bg-dark-bg z-10">
        <View>
          <Text className="text-2xl font-bold text-white">Where Stories</Text>
          <Text className="text-2xl font-bold text-white">Made By You</Text>
        </View>
        <View className="flex-row space-x-4 gap-3">
          <View className="w-10 h-10 rounded-full bg-dark-card justify-center items-center border border-white/10">
            <Ionicons name="search" size={20} color="white" />
          </View>
          {/* Dummy Avatar */}
          <View className="w-10 h-10 rounded-full bg-primary justify-center items-center overflow-hidden">
             <Text className="text-white font-bold">U</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="p-6 pt-2">
          
          {/* Top Creators - Mock Data Visualization */}
          <View className="mb-8">
             <View className="flex-row justify-between items-end mb-4">
                <Text className="text-white font-semibold text-lg">Top Creators</Text>
                <Text className="text-primary text-xs font-bold">View All</Text>
             </View>
             <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <View key={i} className="items-center mr-4">
                     <View className={`w-16 h-16 rounded-full p-0.5 border-2 ${i === 1 ? 'border-primary' : 'border-transparent'}`}>
                        <View className="w-full h-full rounded-full bg-gray-200" />
                     </View>
                     <Text className="text-gray-400 text-xs mt-2">Author {i}</Text>
                  </View>
                ))}
             </ScrollView>
          </View>

          {/* Trending Stories */}
          <View className="mb-8">
            <View className="flex-row justify-between items-end mb-4">
              <Text className="text-white font-semibold text-xl">My Collection</Text>
              <Text className="text-primary text-xs font-bold">View All</Text>
            </View>
            
            <FlatList
              horizontal
              data={stories}
              renderItem={({ item }) => <StoryCard story={item} />}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            />
          </View>

          {/* Continue Reading Section (New Arrivals for now) */}
          <View className="mb-8">
            <Text className="text-white font-semibold text-xl mb-4">New Arrivals</Text>
            <FlatList
              horizontal
              data={stories} 
              renderItem={({ item }) => <StoryCard story={item} />}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            />
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
