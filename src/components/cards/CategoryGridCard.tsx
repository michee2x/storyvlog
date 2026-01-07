import { LinearGradient } from 'expo-linear-gradient';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Category } from '../../api/categories';

interface Props {
    category: Category;
    onPress: () => void;
}

export default function CategoryGridCard({ category, onPress }: Props) {
    return (
        <TouchableOpacity 
            onPress={onPress}
            className="w-[48%] mb-3 h-20 rounded-xl overflow-hidden flex-row bg-white/5 border border-white/5 active:bg-white/10"
        >
            {/* Image Side */}
            <View className="w-20 h-full">
                <Image 
                    source={{ uri: category.image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500' }} 
                    className="w-full h-full"
                    resizeMode="cover"
                />
            </View>
            
            {/* Text Side */}
            <View className="flex-1 justify-center px-3">
                <Text className="text-white font-bold text-sm leading-tight" numberOfLines={2}>
                    {category.name}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
