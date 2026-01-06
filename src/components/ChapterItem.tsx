import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { Chapter } from '../api/stories';

interface Props {
  chapter: Chapter;
  index: number;
  onPress: () => void;
}

export default function ChapterItem({ chapter, index, onPress }: Props) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="flex-row items-center p-4 border-b border-gray-100"
    >
      <View className="w-8 h-8 justify-center items-center bg-gray-100 rounded-full mr-4">
        <Text className="font-bold text-gray-600">{index + 1}</Text>
      </View>
      <View className="flex-1">
        <Text className="font-bold text-base">{chapter.title}</Text>
        <Text className="text-gray-500 text-sm">{chapter.duration}</Text>
      </View>
      <Ionicons name="play-circle-outline" size={24} color="#007AFF" />
    </TouchableOpacity>
  );
}
