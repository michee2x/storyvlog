import { LinearGradient } from 'expo-linear-gradient';
import { Image, Text, TouchableOpacity } from 'react-native';
import { Category } from '../../api/categories';

interface Props {
    category: Category;
    onPress: () => void;
}

export default function CategoryGridCard({ category, onPress }: Props) {
    return (
        <TouchableOpacity 
            onPress={onPress}
            className="w-[48%] mb-3 h-24 rounded-xl overflow-hidden relative"
        >
            {/* Background Image */}
            <Image 
                source={{ uri: category.image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500' }} 
                className="absolute inset-0 w-full h-full"
                resizeMode="cover"
            />
            
            {/* Gradient Overlay for Text Visibility */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                className="absolute inset-0 justify-end p-3"
            >
                <Text className="text-white font-bold text-sm tracking-wide">{category.name}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
}
