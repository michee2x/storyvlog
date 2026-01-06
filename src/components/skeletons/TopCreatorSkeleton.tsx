import { View, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

export default function TopCreatorSkeleton() {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <View className="items-center mr-4">
      <Animated.View 
        style={{ opacity }} 
        className="w-16 h-16 rounded-full bg-white/10"
      />
      <Animated.View 
        style={{ opacity }} 
        className="w-12 h-3 bg-white/10 rounded mt-2"
      />
    </View>
  );
}
