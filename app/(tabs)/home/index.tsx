import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Category, fetchMainCategories } from '../../../src/api/categories';
import {
  fetchFeaturedStories,
  fetchStoriesByGenreSlug,
  fetchTrendingStories,
  Story
} from '../../../src/api/stories';
import FeaturedCarousel from '../../../src/components/home/FeaturedCarousel';
import FeaturedStoryCard from '../../../src/components/cards/FeaturedStoryCard';
import StoryCard from '../../../src/components/cards/StoryCard';
import TrendingStoryCard from '../../../src/components/cards/TrendingStoryCard';
import { useAuth } from '../../../src/contexts/AuthContext';
import { SkeletonFeatured } from '@/src/components/skeletons/CardSkeletons';

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
  const [activeCategory, setActiveCategory] = useState('All');

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  const loadData = async () => {
    try {
      // Parallel fetching for performance
      const [
        feat, 
        trend, 
        rom,
        fan,
        act,
        cat
      ] = await Promise.all([
        fetchFeaturedStories(),
        fetchTrendingStories(),
        fetchStoriesByGenreSlug('romance'),
        fetchStoriesByGenreSlug('fantasy'),
        fetchStoriesByGenreSlug('action'),
        fetchMainCategories()
      ]);
      
      setFeatured(feat);
      setTrending(trend);
      setRomancePicks(rom);
      setFantasyWorlds(fan);
      setActionDecks(act);
      setCategories([{ id: 'all', name: 'All', slug: 'all' }, ...cat]); 
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
    <View className="flex-row justify-between items-end mb-5 px-6">
      <Text className="text-white text-2xl font-bold tracking-tight">{title}</Text>
      {target && (
         <Link href={target as any} asChild>
            <TouchableOpacity>
               <Text className="text-primary font-bold text-sm">See All</Text>
            </TouchableOpacity>
         </Link>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
        <StatusBar barStyle="light-content" />
        <View className="px-6 py-3 flex-row justify-between items-center bg-dark-bg z-10 border-b border-white/5">
             <View>
               <View className="w-32 h-6 bg-white/10 rounded mb-1" />
             </View>
             <View className="w-10 h-10 rounded-full bg-white/10" />
        </View>
        <ScrollView className="flex-1 pt-6" showsVerticalScrollIndicator={false}>
           <View className="mb-10 px-6">
               <SkeletonFeatured />
           </View>
           <View className="mb-10 px-6 flex-row gap-3">
               {[1,2,3,4].map(i => <View key={i} className="w-20 h-8 bg-white/10 rounded-full" />)}
           </View>
           {[1, 2].map(i => <View key={i} className="h-64 mb-8 bg-white/5 mx-6 rounded-xl" />)}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center bg-dark-bg z-10">
        <View className="flex-row items-center gap-3">
             <View className="w-10 h-10 rounded-full bg-primary justify-center items-center border border-white/10">
                <Text className="text-white font-bold text-lg">{userInitial}</Text>
             </View>
             <View>
                <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">Welcome Back</Text>
                <Text className="text-white font-bold text-lg leading-5">Let's read something.</Text>
             </View>
        </View>
        <Link href="/(tabs)/search" asChild>
            <TouchableOpacity className="w-10 h-10 rounded-full bg-white/5 justify-center items-center border border-white/10">
                <Ionicons name="search" size={20} color="white" />
            </TouchableOpacity>
        </Link>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF2D55" />}
      >
        <View className="pt-4">
          
          {/* Hero Carousel */}
          <View className="mb-8">
             <FeaturedCarousel data={featured} />
          </View>

          {/* Category Pills (Filter Style) */}
          <View className="mb-10 pl-6">
             <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
                {categories.map((cat, index) => {
                   const isActive = activeCategory === cat.name;
                   return (
                      <TouchableOpacity 
                        key={cat.id}
                        onPress={() => {
                            setActiveCategory(cat.name);
                            if(cat.slug !== 'all') router.push(`/category/${cat.slug}`);
                        }}
                        className={`mr-3 px-5 py-2.5 rounded-full border ${isActive ? 'bg-white border-white' : 'bg-white/5 border-white/10'}`}
                      >
                         <Text className={`font-bold text-sm ${isActive ? 'text-black' : 'text-white'}`}>{cat.name}</Text>
                      </TouchableOpacity>
                   );
                })}
             </ScrollView>
          </View>

          {/* Trending */}
          <View className="mb-10">
            <SectionHeader title="Trending Now" target="/category/trending" />
            {trending.slice(0, 3).map((story, index) => (
              <TrendingStoryCard key={story.id} story={story} index={index} />
            ))}
          </View>

          {/* Romance */}
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

          {/* Action */}
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
          <View className="mx-6 py-8 items-center bg-white/5 rounded-3xl border border-white/5 mt-4 px-6">
             <Text className="text-white font-bold text-xl mb-2 text-center">Have a story to tell?</Text>
             <Text className="text-gray-400 text-center mb-6 text-sm">Join thousands of writers sharing their imagination.</Text>
             <TouchableOpacity 
               className="bg-primary px-8 py-4 rounded-full w-full items-center shadow-lg shadow-primary/20"
               onPress={() => router.push('/(tabs)/create')}
             >
                <Text className="text-white font-bold text-base">Start Writing</Text>
             </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
