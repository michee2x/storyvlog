import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Story } from '../../api/stories';

interface Props {
  story: Story;
}

export default function StoryCard({ story }: Props) {
  return (
    <Link href={`/story/${story.id}` as any} asChild>
      <TouchableOpacity className="mr-5 w-44 relative active:opacity-90">
        {/* Card Container */ }
        <View className="w-44 h-64 rounded-2xl overflow-hidden shadow-lg bg-dark-card border border-white/10">
          <Image
            source={story.coverImage}
            className="w-full h-full"
            resizeMode="cover"
          />
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(15, 15, 26, 0.9)']}
            className="absolute bottom-0 left-0 right-0 h-32 justify-end p-3"
          >
            <Text className="text-white text-lg font-bold shadow-sm" numberOfLines={2}>{story.title}</Text>
            <Text className="text-primary text-sm font-semibold">{story.author}</Text>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
