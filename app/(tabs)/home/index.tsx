import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Category, fetchMainCategories } from '../../../src/api/categories';
import {
  fetchFeaturedStories,
  fetchStoriesByGenreSlug,
  fetchTrendingStories,
  Story
} from '../../../src/api/stories';
import AdCard from '../../../src/components/ads/AdCard';
import CategoryGridCard from '../../../src/components/cards/CategoryGridCard';
import FeaturedStoryCard from '../../../src/components/cards/FeaturedStoryCard';
import StoryCard from '../../../src/components/cards/StoryCard';
import TrendingStoryCard from '../../../src/components/cards/TrendingStoryCard';
import { SkeletonCard, SkeletonCategory, SkeletonFeatured, SkeletonTrending } from '../../../src/components/skeletons/CardSkeletons';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Data States
  const [featured, setFeatured] = useState<Story[]>([]);
  const [trending, setTrending] = useState<Story[]>([]);
  const [romancePicks, setRomancePicks] = useState<Story[]>([]);
  const [fantasyWorlds, setFantasyWorlds] = useState<Story[]>([]);
  const [actionDecks, setActionDecks] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  const loadData = async () => {
    try {
      // Parallel fetching for performance
      const [
        featData, 
        trendData, 
        romanceData,
        fantasyData,
        actionData,
        catData
      ] = await Promise.all([
        fetchFeaturedStories(),
        fetchTrendingStories(),
        fetchStoriesByGenreSlug('romance'),
        fetchStoriesByGenreSlug('fantasy'),
        fetchStoriesByGenreSlug('action'),
        fetchMainCategories()
      ]);
      
      setFeatured(featData);
      setTrending(trendData);
      setRomancePicks(romanceData);
      setFantasyWorlds(fantasyData);
      setActionDecks(actionData);
      setCategories(catData.slice(0, 4)); // Top 4 categories for grid
    } catch (error) {
      console.error("Failed to load home data", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Reusable Section Header
  const SectionHeader = ({ title, target }: { title: string, target?: string }) => (
    <View className="flex-row justify-between items-center mb-4 px-6">
      <Text className="text-white text-lg font-bold">{title}</Text>
      {target && (
         <Link href={target as any} asChild>
            <TouchableOpacity className="p-1">
               <Ionicons name="chevron-forward" size={20} color="#FF2D55" />
            </TouchableOpacity>
         </Link>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
        <StatusBar barStyle="light-content" />
        
        {/* Header Skeleton */}
        <View className="px-6 py-3 flex-row justify-between items-center bg-dark-bg z-10 border-b border-white/5">
             <View>
               <View className="w-32 h-6 bg-white/10 rounded mb-1" />
               <View className="w-24 h-4 bg-white/5 rounded" />
             </View>
            <View className="flex-row gap-4">
               <View className="w-10 h-10 rounded-full bg-white/10" />
               <View className="w-10 h-10 rounded-full bg-white/10" />
            </View>
        </View>

        <ScrollView className="flex-1 pt-6" showsVerticalScrollIndicator={false}>
           
           {/* Featured Section Skeleton */}
           <View className="mb-10 px-6">
               <View className="w-32 h-6 bg-white/10 rounded mb-4" />
               <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                   <SkeletonFeatured />
                   <SkeletonFeatured />
               </ScrollView>
           </View>

           {/* Categories Skeleton */}
           <View className="mb-10 px-6">
              <View className="flex-row justify-between mb-4">
                 <View className="w-32 h-6 bg-white/10 rounded" />
                 <View className="w-8 h-6 bg-white/5 rounded" />
              </View>
              <View className="flex-row flex-wrap justify-between">
                 {[1, 2, 3, 4].map(i => <SkeletonCategory key={i} />)}
              </View>
           </View>

           {/* Trending Skeleton */}
           <View className="mb-10">
              <View className="flex-row justify-between mb-4 px-6">
                 <View className="w-32 h-6 bg-white/10 rounded" />
              </View>
              {[1, 2, 3].map(i => <SkeletonTrending key={i} />)}
           </View>

           {/* Horizontal Lists Skeleton */}
           <View className="mb-8">
               <View className="flex-row justify-between mb-4 px-6">
                 <View className="w-32 h-6 bg-white/10 rounded" />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                  {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </ScrollView>
           </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Dynamic Header */}
      <View className="px-6 py-3 flex-row justify-between items-center bg-dark-bg z-10 border-b border-white/5">
        <View>
          <Text className="text-xl font-bold text-white">Daily Picks</Text>
          <Text className="text-sm text-gray-400">Curated just for you</Text>
        </View>
        <View className="flex-row items-center gap-4">
          <Link href="/(tabs)/search" asChild>
            <TouchableOpacity className="w-10 h-10 rounded-full bg-dark-card justify-center items-center border border-white/10">
              <Ionicons name="search" size={20} color="white" />
            </TouchableOpacity>
          </Link>
          <Link href="/(tabs)/profile" asChild>
            <TouchableOpacity className="w-10 h-10 rounded-full bg-primary justify-center items-center border border-white/10">
              <Text className="text-white font-bold text-lg">{userInitial}</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF2D55" />}
      >
        <View className="pt-6">
          
          {/* Featured Hero (Carousel) */}
          <View className="mb-10">
             <Text className="text-white text-lg font-bold mb-4 px-6">Featured</Text>
             <FlatList 
                horizontal
                data={featured}
                renderItem={({ item }) => <FeaturedStoryCard story={item} />}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24 }}
                snapToInterval={316}
                decelerationRate="fast"
             />
          </View>

          {/* Categories Grid (Webtoon Style) */}
          <View className="mb-10 px-6">
             <SectionHeader title="Dive Into Genres" target="/(tabs)/search" />
             <View className="flex-row flex-wrap justify-between">
                {categories.map((cat) => (
                  <CategoryGridCard 
                    key={cat.id} 
                    category={cat}
                    onPress={() => router.push(`/category/${cat.slug}`)}
                  />
                ))}
            </View>
          </View>

          {/* Trending (Vertical Rank) */}
          <View className="mb-10">
            <SectionHeader title="Trending Now" target="/category/trending" />
            {trending.slice(0, 3).map((story, index) => (
              <TrendingStoryCard key={story.id} story={story} index={index} />
            ))}
          </View>

          {/* Ad Placement 1 */}
          <View className="mb-10 px-6">
             <Text className="text-gray-500 text-[10px] font-bold mb-2 uppercase tracking-widest pl-1">Sponsored</Text>
             <AdCard />
          </View>

          {/* Romance Section */}
          <View className="mb-8">
            <SectionHeader title="Romance Picks" target="/category/romance" />
            <FlatList
              horizontal
              data={romancePicks}
              renderItem={({ item }) => <StoryCard story={item} />}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            />
          </View>

          {/* Fantasy Section */}
          <View className="mb-8">
            <SectionHeader title="Fantasy Worlds" target="/category/fantasy" />
            <FlatList
              horizontal
              data={fantasyWorlds}
              renderItem={({ item }) => <StoryCard story={item} />}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            />
          </View>

          {/* Action Section */}
           <View className="mb-8">
            <SectionHeader title="Action & Adventure" target="/category/action" />
            <FlatList
              horizontal
              data={actionDecks}
              renderItem={({ item }) => <StoryCard story={item} />}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            />
          </View>

          {/* Footer CTA */}
          <View className="px-6 py-6 items-center border-t border-white/5 mt-4">
             <Text className="text-gray-400 text-center mb-4 text-sm">Create your own stories and share them with the world.</Text>
             <TouchableOpacity 
               className="bg-white/5 px-8 py-4 rounded-full border border-white/10 w-full items-center"
               onPress={() => router.push('/(tabs)/create')}
             >
                <Text className="text-white font-bold">Start Writing</Text>
             </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
