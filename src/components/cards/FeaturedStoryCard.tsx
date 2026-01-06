import { Image, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Story } from '../../api/stories';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

interface Props {
  story: Story;
}

export default function FeaturedStoryCard({ story }: Props) {
  return (
    <Link href={`/story/${story.id}`} asChild>
      <TouchableOpacity className="w-[300px] h-[400px] mr-4 rounded-3xl overflow-hidden relative">
        <Image 
          source={story.coverImage} 
          className="w-full h-full"
          resizeMode="cover"
        />
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          className="absolute bottom-0 left-0 right-0 h-1/2 justify-end p-5"
        >
          <View className="flex-row items-center mb-2">
            <View className="bg-primary px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-bold uppercase">Featured</Text>
            </View>
            <View className="flex-row items-center ml-3">
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text className="text-white text-xs ml-1 font-bold">{story.rating || '4.5'}</Text>
            </View>
          </View>
          
          <Text className="text-white text-2xl font-bold mb-1 leading-tight" numberOfLines={2}>
            {story.title}
          </Text>
          <Text className="text-gray-300 text-sm mb-3">
            by {story.author}
          </Text>
          
          <Text className="text-gray-400 text-xs numberOfLines={2}" numberOfLines={2}>
            {story.description}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Link>
  );
}
