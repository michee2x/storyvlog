import { Link } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Story } from '../../api/stories';

interface Props {
  story: Story;
}

export default function StoryCard({ story }: Props) {
  return (
    <Link href={`/story/${story.id}` as any} asChild>
      <TouchableOpacity className="mr-5 w-44 active:opacity-90">
        {/* Card Image */}
        <View className="w-44 h-64 rounded-2xl overflow-hidden shadow-lg bg-dark-card border border-white/10 mb-3">
          <Image
            source={story.coverImage}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        
        {/* Text Below Image */}
        <View>
            <Text className="text-white text-base font-bold leading-5 mb-1" numberOfLines={2}>
                {story.title}
            </Text>
            <Text className="text-gray-400 text-xs font-medium" numberOfLines={1}>
                {story.author}
            </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
