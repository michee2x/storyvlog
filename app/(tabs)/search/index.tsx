import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchStories, Story } from '../../../src/api/stories';
import { fetchMainCategories, Category } from '../../../src/api/categories';
import CategoryTile from '../../../src/components/cards/CategoryTile';
import StoryCard from '../../../src/components/cards/StoryCard';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  useEffect(() => {
    fetchStories().then(setStories);
    
    // Fetch categories from database
    fetchMainCategories().then(data => {
      setCategories(data);
      setLoadingCategories(false);
    });
  }, []);

  const filteredStories = stories.filter(story => 
     story.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     story.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="p-6 pb-2">
          <Text className="text-3xl font-bold text-white mb-6">Search</Text>
          
          {/* Search Bar */}
          <View className="flex-row items-center bg-dark-card border border-white/10 rounded-xl px-4 py-3 mb-8">
            <Ionicons name="search" size={20} color="#8E8E93" />
            <TextInput
              className="flex-1 ml-3 text-white text-base"
              placeholder="Series, creators, categories..."
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ lineHeight: 20 }} // Fix for text input height alignment
            />
            {searchQuery.length > 0 && (
               <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#8E8E93" />
               </TouchableOpacity>
            )}
          </View>

          {/* What Everyone's Searching */}
          <View className="mb-8">
             <Text className="text-white font-bold text-lg mb-4">What Everyone's Searching</Text>
             <FlatList
                horizontal
                data={stories} // Use fetched stories
                renderItem={({ item }) => (
                    <View className="mr-4">
                        <StoryCard story={item} />
                    </View>
                )}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
             />
          </View>

          {/* Browse Categories Grid */}
          <View>
             <Text className="text-white font-bold text-lg mb-4">Browse Categories</Text>
             {loadingCategories ? (
               <View className="flex-row flex-wrap -mx-1.5">
                 {[1, 2, 3, 4, 5, 6].map((i) => (
                   <View key={i} className="w-1/2 p-1.5">
                     <View className="h-24 bg-dark-card rounded-xl border border-white/10">
                       <ActivityIndicator size="small" color="#FF2D55" style={{ marginTop: 35 }} />
                     </View>
                   </View>
                 ))}
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

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
