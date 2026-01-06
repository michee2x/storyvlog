import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Story } from '../../api/stories';

interface Props {
  story: Story;
  index: number;
}

export default function TrendingStoryCard({ story, index }: Props) {
  return (
    <Link href={`/story/${story.id}`} asChild>
      <TouchableOpacity className="flex-row items-center mb-4 bg-dark-card p-3 rounded-xl border border-white/5 mx-6">
        {/* Rank Number */}
        <Text className={`text-2xl font-bold mr-4 italic ${index < 3 ? 'text-primary' : 'text-gray-600'}`}>
          #{index + 1}
        </Text>
        
        {/* Story Image */}
        <Image 
          source={story.coverImage} 
          className="w-16 h-20 rounded-lg"
          resizeMode="cover"
        />
        
        {/* Story Details */}
        <View className="flex-1 ml-4 justify-center">
          <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>
            {story.title}
          </Text>
          <Text className="text-gray-400 text-xs mb-2" numberOfLines={1}>
            {story.author}
          </Text>
          
          <View className="flex-row items-center space-x-3 gap-3">
            <View className="flex-row items-center">
              <Ionicons name="eye-outline" size={12} color="#8E8E93" />
              <Text className="text-gray-500 text-xs ml-1">{story.views}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="heart-outline" size={12} color="#8E8E93" />
              <Text className="text-gray-500 text-xs ml-1">{story.likes}</Text>
            </View>
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#444" />
      </TouchableOpacity>
    </Link>
  );
}
