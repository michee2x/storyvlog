import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Category, fetchMainCategories } from '../../../src/api/categories';
import { Profile, searchStories, searchUsers } from '../../../src/api/search';
import { fetchStories, Story } from '../../../src/api/stories';
import CategoryTile from '../../../src/components/cards/CategoryTile';
import StoryCard from '../../../src/components/cards/StoryCard';
import { SkeletonCard, SkeletonCategory } from '../../../src/components/skeletons/CardSkeletons';
import { useDebounce } from '../../../src/hooks/useDebounce';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);
  
  const [initialStories, setInitialStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [foundStories, setFoundStories] = useState<Story[]>([]);
  const [foundUsers, setFoundUsers] = useState<Profile[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'Top' | 'Videos' | 'People'>('Top');
  
  // Initial load request
  useEffect(() => {
    Promise.all([
        fetchStories(),
        fetchMainCategories()
    ]).then(([fetchedStories, fetchedCategories]) => {
        setInitialStories(fetchedStories);
        setCategories(fetchedCategories);
        setLoading(false);
    });
  }, []);

  // Search effect
  useEffect(() => {
    if (!debouncedQuery) {
        setFoundStories([]);
        setFoundUsers([]);
        return;
    }

    setSearching(true);
    async function performSearch() {
        // Execute searches in parallel
        const [stories, users] = await Promise.all([
            searchStories(debouncedQuery),
            searchUsers(debouncedQuery)
        ]);
        
        setFoundStories(stories);
        setFoundUsers(users);
        setSearching(false);
    }

    performSearch();
  }, [debouncedQuery]);

  const renderSearchResults = () => {
    if (searching) {
        return (
            <View className="py-20 items-center">
                <ActivityIndicator size="large" color="#FF2D55" />
                <Text className="text-gray-500 mt-4">Searching...</Text>
            </View>
        );
    }

    if (foundStories.length === 0 && foundUsers.length === 0 && debouncedQuery) {
        return (
            <View className="py-20 items-center">
                <Ionicons name="search" size={64} color="#333" />
                <Text className="text-gray-500 mt-4 font-bold text-lg">No Results Found</Text>
                <Text className="text-gray-600">Try searching for something else</Text>
            </View>
        );
    }

    return (
        <View>
            {/* Filter Tabs */}
            <View className="flex-row mb-6 border-b border-white/10 pb-2">
                {(['Top', 'Videos', 'People'] as const).map((tab) => (
                    <TouchableOpacity 
                        key={tab} 
                        onPress={() => setActiveTab(tab)}
                        className={`mr-6 pb-2 ${activeTab === tab ? 'border-b-2 border-primary' : ''}`}
                    >
                        <Text className={`${activeTab === tab ? 'text-primary font-bold' : 'text-gray-400'}`}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* People Results */}
            {(activeTab === 'Top' || activeTab === 'People') && foundUsers.length > 0 && (
                <View className="mb-8">
                    {activeTab === 'Top' && <Text className="text-white font-bold text-lg mb-4">People</Text>}
                    {foundUsers.map(user => (
                        <TouchableOpacity 
                            key={user.id} 
                            onPress={() => router.push(`/user/${user.id}`)}
                            className="flex-row items-center mb-4 bg-dark-card p-3 rounded-xl border border-white/5"
                        >
                            <Image 
                                source={{ uri: user.avatar_url }} 
                                style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#333' }} 
                            />
                            <View className="ml-3 flex-1">
                                <Text className="text-white font-bold text-base">{user.username}</Text>
                                <Text className="text-gray-500 text-xs" numberOfLines={1}>
                                    {user.bio || 'StoryVlog User'}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => router.push(`/user/${user.id}`)}
                                className="bg-white/10 px-4 py-2 rounded-full"
                            >
                                <Text className="text-white text-xs font-bold">View</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Stories Results */}
            {(activeTab === 'Top' || activeTab === 'Videos') && foundStories.length > 0 && (
                <View className="mb-6">
                    {activeTab === 'Top' && <Text className="text-white font-bold text-lg mb-4">Videos</Text>}
                    <View className="flex-row flex-wrap justify-between">
                         {foundStories.map(story => (
                            <View key={story.id} className="w-[48%] mb-4">
                                <StoryCard story={story} />
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View className="p-6 pb-2">
          {!searchQuery && <Text className="text-3xl font-bold text-white mb-6">Search</Text>}
          
          {/* Search Bar */}
          <View className="flex-row items-center bg-dark-card border border-white/10 rounded-xl px-4 py-3 mb-8">
            <Ionicons name="search" size={20} color="#8E8E93" />
            <TextInput
              className="flex-1 ml-3 text-white text-base"
              placeholder="Series, creators, categories..."
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ lineHeight: 20 }}
              autoFocus={false}
            />
            {searchQuery.length > 0 && (
               <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#8E8E93" />
               </TouchableOpacity>
            )}
          </View>

          {/* Render Content */}
          {searchQuery ? renderSearchResults() : (
              <>
                {/* What Everyone's Searching */}
                <View className="mb-8">
                    <Text className="text-white font-bold text-lg mb-4">What Everyone's Searching</Text>
                    {loading ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                        </ScrollView>
                    ) : (
                        <FlatList
                            horizontal
                            data={initialStories} 
                            renderItem={({ item }) => (
                                <View className="mr-4">
                                    <StoryCard story={item} />
                                </View>
                            )}
                            keyExtractor={item => item.id}
                            showsHorizontalScrollIndicator={false}
                        />
                    )}
                </View>

                {/* Browse Categories Grid */}
                <View>
                    <Text className="text-white font-bold text-lg mb-4">Browse Categories</Text>
                    {loading ? (
                    <View className="flex-row flex-wrap justify-between">
                        {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCategory key={i} />)}
                    </View>
                    ) : categories.length > 0 ? (
                    <View className="flex-row flex-wrap -mx-1.5">
                        {categories.map((cat) => (
                        <View key={cat.id} className="w-1/2">
                            <Link href={`/category/${cat.slug}`} asChild>
                            <CategoryTile 
                                title={cat.name} 
                                image={{ uri: cat.image_url }} 
                            />
                            </Link>
                        </View>
                        ))}
                    </View>
                    ) : (
                    <View className="items-center py-8">
                        <Ionicons name="folder-open-outline" size={48} color="#666" />
                        <Text className="text-gray-400 mt-3">No categories available</Text>
                    </View>
                    )}
                </View>
              </>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
