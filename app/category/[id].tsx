import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { STORIES } from '../../src/api/stories';

// Mock Ranking Data extending standard stories
const RANKED_STORIES = STORIES.map((story, index) => ({
    ...story,
    rank: index + 1,
    views: (Math.random() * 5 + 1).toFixed(1) + 'M',
    likes: (Math.random() * 900 + 100).toFixed(0) + 'K'
})).sort(() => Math.random() - 0.5); // Shuffle for demo

export default function CategoryDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const categoryTitle = typeof id === 'string' ? id.charAt(0).toUpperCase() + id.slice(1) : 'Category';

    // Separate top story from the rest - with safety check
    const topStory = RANKED_STORIES.length > 0 ? RANKED_STORIES[0] : null;
    const otherStories = RANKED_STORIES.slice(1);

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
                    {['Trending', 'Popular', 'New', 'Completed', 'Shorts'].map((filter, index) => (
                        <TouchableOpacity key={filter} className={`mr-6 ${index === 0 ? 'border-b-2 border-primary pb-1' : ''}`}>
                            <Text className={`${index === 0 ? 'text-white font-bold' : 'text-gray-400 font-medium'}`}>
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
                            className="w-24 h-32 rounded-lg"
                        />
                        {/* Rank Badge */}
                        <View className="absolute -top-2 -left-2 bg-primary w-8 h-8 rounded-full justify-center items-center border-2 border-dark-bg">
                            <Text className="text-white font-bold text-sm">1</Text>
                        </View>
                    </View>

                    <View className="flex-1 ml-4 justify-center">
                        <Text className="text-white font-bold text-lg leading-tight mb-1" numberOfLines={2}>
                            {topStory.title}
                        </Text>
                        <View className="flex-row items-center mb-2">
                            <Text className="text-primary text-xs font-bold mr-2">{categoryTitle}</Text>
                            <View className="flex-row items-center">
                                 <Ionicons name="heart" size={10} color="#FF2D55" />
                                 <Text className="text-gray-400 text-xs ml-1">{topStory.likes}</Text>
                            </View>
                        </View>
                        <Text className="text-gray-400 text-xs leading-4" numberOfLines={3}>
                            {topStory.description} once upon a time, that was the perfect description of this amazing story...
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderItem = ({ item, index }: { item: typeof RANKED_STORIES[0], index: number }) => (
        <TouchableOpacity 
            onPress={() => router.push(`/story/${item.id}`)}
            className="flex-row items-center px-4 py-3 mb-2"
        >
            {/* Rank Number */}
            <Text className={`text-xl font-bold w-8 text-center mr-2 ${item.rank <= 3 ? 'text-white' : 'text-gray-500'}`}>
                {index + 2}
            </Text>

            {/* Thumbnail */}
            <Image 
                source={item.coverImage} 
                className="w-16 h-20 rounded-md bg-gray-800"
            />

            {/* Info */}
            <View className="flex-1 ml-4 justify-center">
                <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>
                    {item.title}
                </Text>
                <View className="flex-row items-center">
                    <Text className="text-gray-500 text-xs mr-2">{categoryTitle}</Text>
                    <Ionicons name="heart" size={10} color={item.rank <= 3 ? "#FF2D55" : "#666"} />
                    <Text className="text-gray-500 text-xs ml-1">{item.likes}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
            <StatusBar barStyle="light-content" />
            <Stack.Screen options={{ headerShown: false }} />
            
            <FlatList
                data={otherStories}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}
