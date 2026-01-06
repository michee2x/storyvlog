import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdCard() {
  return (
    <TouchableOpacity className="w-[280px] h-[160px] mr-4 rounded-xl overflow-hidden relative border border-white/10">
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80' }} 
        className="w-full h-full opacity-60"
        resizeMode="cover"
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        className="absolute bottom-0 left-0 right-0 h-full justify-end p-4"
      >
        <View className="flex-row items-center justify-between mb-2">
            <View className="bg-yellow-500/90 px-2 py-0.5 rounded">
                <Text className="text-black text-[10px] font-bold">Ad</Text>
            </View>
        </View>
        
        <Text className="text-white font-bold text-lg mb-1">
          Premium Membership
        </Text>
        <Text className="text-gray-300 text-xs">
          Read ad-free and support creators.
        </Text>
        
        <View className="mt-3 bg-white px-4 py-2 rounded-full self-start">
            <Text className="text-black text-xs font-bold">Learn More</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
