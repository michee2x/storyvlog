import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

export default function StoryCardSkeleton() {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <View className="mr-5 w-44">
      {/* Card Container - EXACT match to StoryCard */}
      <View className="w-44 h-64 rounded-2xl overflow-hidden shadow-lg bg-dark-card border border-white/10">
        {/* Placeholder for image with pulse */}
        <Animated.View style={{ opacity }} className="w-full h-full bg-white/5" />
        
        {/* Gradient Overlay - matching StoryCard exactly */}
        <LinearGradient
          colors={['transparent', 'rgba(15, 15, 26, 0.9)']}
          className="absolute bottom-0 left-0 right-0 h-32 justify-end p-3"
        >
          {/* Title skeleton - 2 lines like real card */}
          <Animated.View style={{ opacity }}>
            <View className="h-5 bg-white/20 rounded w-4/5 mb-1" />
            <View className="h-5 bg-white/20 rounded w-3/5 mb-2" />
          </Animated.View>
          {/* Author skeleton */}
          <Animated.View style={{ opacity }}>
            <View className="h-4 bg-primary/30 rounded w-2/5" />
          </Animated.View>
        </LinearGradient>
      </View>
    </View>
  );
}
