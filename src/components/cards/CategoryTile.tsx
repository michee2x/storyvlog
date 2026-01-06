import { Image, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  title: string;
  image: any; // Using any for require() or uri
  onPress?: () => void;
}

export default function CategoryTile({ title, image, onPress }: Props) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="flex-1 h-24 bg-dark-card rounded-xl p-3 relative overflow-hidden mb-3 mx-1.5 border border-white/5"
    >
      <Text className="text-white font-bold text-sm max-w-[70%] z-10">{title}</Text>
      
      {/* Image positioned at bottom right */}
      <View className="absolute bottom-0 right-0 w-16 h-20 shadow-lg transform rotate-6 translate-x-0 translate-y-1">
         <Image 
            source={image}
            className="w-full h-full rounded-md"
            resizeMode="cover"
         />
      </View>
    </TouchableOpacity>
  );
}
