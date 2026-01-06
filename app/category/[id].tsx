import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Category, fetchCategoryBySlug } from '../../src/api/categories';
import { fetchStoriesByCategory, Story } from '../../src/api/stories';

export default function CategoryDetailsScreen() {
    const { id } = useLocalSearchParams();
    const slug = typeof id === 'string' ? id : '';
    const router = useRouter();
    
    const [category, setCategory] = useState<Category | null>(null);
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeFilter, setActiveFilter] = useState('Trending');

    useEffect(() => {
        const loadCategoryData = async () => {
            if (!slug) {
                setLoading(false);
                setError(true);
                return;
            }
            
            try {
                setLoading(true);
                setError(false);
                const catData = await fetchCategoryBySlug(slug.toLowerCase().replace(/\s+/g, '-'));
                
                if (catData) {
                    setCategory(catData);
                    const storyData = await fetchStoriesByCategory(catData.id);
                    setStories(storyData);
                } else {
                    console.error("Category not found for slug:", slug);
                    setError(true);
                }
            } catch (err) {
                console.error("Error loading category:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        loadCategoryData();
    }, [slug]);

    const categoryTitle = category ? category.name : (typeof id === 'string' ? id.charAt(0).toUpperCase() + id.slice(1) : 'Category');

    // Filter and Sort Logic
    const getFilteredStories = () => {
        let filtered = [...stories];

        switch (activeFilter) {
            case 'Trending':
                // Sort by trending flag + rating
                return filtered.sort((a, b) => (b.is_trending ? 1 : 0) - (a.is_trending ? 1 : 0) || (b.rating || 0) - (a.rating || 0));
            case 'Popular':
                // Sort by views (parse string "1.2M" or "500K" back to numbers roughly for basic sort, or just default to likes/rating)
                // For simplicity, using rating and likes
                return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'New':
                // Sort by created_at desc
                return filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
            case 'Completed':
                return filtered.filter(s => s.status === 'completed');
            case 'Shorts':
                // Random definition for shorts: < 20 chapters
                return filtered.filter(s => (s.chapters_count || 0) < 20);
            default:
                return filtered;
        }
    };

    const displayStories = getFilteredStories();
    const topStory = displayStories.length > 0 ? displayStories[0] : null;
    const otherStories = displayStories.length > 0 ? displayStories.slice(1) : [];

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-dark-bg justify-center items-center">
                <StatusBar barStyle="light-content" />
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#FF2D55" />
            </SafeAreaView>
        );
    }

    const renderHeader = () => (
        <View>
            {/* Nav Header */}
            <View className="flex-row items-center px-4 py-3 bg-dark-bg z-10">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="chevron-back" size={28} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">{categoryTitle} Rankings</Text>
            </View>

            {/* Sub-Filters */}
            <View className="mb-4">
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                    className="border-b border-white/5 pb-3"
                >
                    {['Trending', 'Popular', 'New', 'Completed', 'Shorts'].map((filter) => (
                        <TouchableOpacity 
                            key={filter} 
                            onPress={() => setActiveFilter(filter)}
                            className={`mr-6 ${activeFilter === filter ? 'border-b-2 border-primary pb-1' : ''}`}
                        >
                            <Text className={`${activeFilter === filter ? 'text-white font-bold' : 'text-gray-400 font-medium'}`}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* #1 Top Pick */}
            {topStory && (
                <TouchableOpacity 
                    onPress={() => router.push(`/story/${topStory.id}`)}
                    className="mx-4 mb-6 bg-dark-card rounded-xl p-4 border border-primary/30 flex-row"
                >
                    <View className="relative">
                        <Image 
                            source={topStory.coverImage} 
                            className="w-24 h-36 rounded-lg"
                            resizeMode="cover"
                        />
                        <View className="absolute top-0 left-0 bg-primary px-2 py-1 rounded-tl-lg rounded-br-lg">
                            <Text className="text-white text-xs font-bold">#1</Text>
                        </View>
                    </View>
                    
                    <View className="flex-1 ml-4 justify-between py-1">
                        <View>
                            <Text className="text-white text-lg font-bold mb-1 leading-6" numberOfLines={2}>
                                {topStory.title}
                            </Text>
                            <Text className="text-gray-400 text-xs font-semibold mb-2">
                                by {topStory.author}
                            </Text>
                            <View className="flex-row items-center space-x-3 gap-3">
                                <View className="flex-row items-center bg-white/10 px-2 py-1 rounded">
                                    <Ionicons name="eye-outline" size={12} color="#ccc" />
                                    <Text className="text-gray-300 text-xs ml-1">{topStory.views}</Text>
                                </View>
                                <View className="flex-row items-center bg-white/10 px-2 py-1 rounded">
                                    <Ionicons name="heart-outline" size={12} color="#FF2D55" />
                                    <Text className="text-gray-300 text-xs ml-1">{topStory.likes}</Text>
                                </View>
                            </View>
                        </View>
                        
                        <Text className="text-gray-500 text-xs leading-4" numberOfLines={3}>
                            {topStory.description}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderItem = ({ item, index }: { item: Story, index: number }) => (
        <TouchableOpacity 
            onPress={() => router.push(`/story/${item.id}`)}
            className="flex-row items-center px-4 py-3 border-b border-white/5 mx-2"
        >
            <Text className={`text-xl font-bold w-10 text-center ${index < 2 ? 'text-primary' : 'text-gray-600'}`}>
                {index + 2}
            </Text>
            
            <Image 
                source={item.coverImage} 
                className="w-14 h-20 rounded-md"
                resizeMode="cover"
            />
            
            <View className="flex-1 ml-4 justify-center">
                <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>
                    {item.title}
                </Text>
                
                 <View className="flex-row items-center mb-1">
                    <Text className="text-gray-400 text-xs mr-2">by {item.author}</Text>
                </View>

                <View className="flex-row items-center">
                     <Text className="text-gray-500 text-xs mr-3">{item.views} views</Text>
                     <Text className="text-gray-500 text-xs">{item.likes} likes</Text>
                </View>
            </View>
            
            <View className="items-center">
                 <Ionicons name="chevron-forward" size={18} color="#333" />
            </View>
        </TouchableOpacity>
    );

    // Empty state component with props
    const EmptyState = ({ title, message, showButton = true }: { title: string, message: string, showButton?: boolean }) => (
        <View className="flex-1 items-center justify-center px-8 py-12">
            <View className="w-32 h-32 rounded-full bg-dark-card border-2 border-dashed border-white/10 items-center justify-center mb-6">
                <Ionicons name="documents-outline" size={48} color="#666" />
            </View>
            
            <Text className="text-white text-xl font-bold mb-2 text-center">{title}</Text>
            <Text className="text-gray-400 text-center text-sm leading-5 mb-6">{message}</Text>
            
            {showButton && (
                <TouchableOpacity 
                    onPress={() => router.back()}
                    className="bg-dark-card px-6 py-3 rounded-full border border-white/10"
                >
                    <Text className="text-white font-bold text-sm">Browse Other Categories</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    // Case 1: Category is totally empty (no stories at all from DB)
    if (!loading && stories.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
                <StatusBar barStyle="light-content" />
                <Stack.Screen options={{ headerShown: false }} />
                
                <View className="flex-row items-center px-4 py-3 bg-dark-bg z-10">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="chevron-back" size={28} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">{categoryTitle}</Text>
                </View>
                
                <EmptyState 
                    title="No Stories Yet"
                    message="This category is brand new and waiting for its first story. Check back soon!"
                />
            </SafeAreaView>
        );
    }
    
    // Case 2: Category has stories, but FILTER returns empty (e.g. no "Shorts")
    const isFilteredEmpty = displayStories.length === 0;

    return (
        <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
            <StatusBar barStyle="light-content" />
            <Stack.Screen options={{ headerShown: false }} />
            
            <FlatList
                data={otherStories}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={() => (
                    <View>
                        {renderHeader()}
                        {/* If filter is empty, show empty state just below header */}
                        {isFilteredEmpty && (
                            <EmptyState 
                                title={`No ${activeFilter === 'New' ? 'New' : activeFilter} Stories`}
                                message={`We couldn't find any stories matching "${activeFilter}" in this category.`}
                                showButton={false}
                            />
                        )}
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}
