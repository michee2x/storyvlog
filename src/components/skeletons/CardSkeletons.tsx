import { View } from 'react-native';

export const SkeletonCard = () => (
  <View className="mr-5 w-44">
    {/* Image Skeleton */}
    <View className="w-44 h-64 rounded-2xl bg-white/5 overflow-hidden mb-3" />
    
    {/* Text Lines */}
    <View className="w-32 h-4 bg-white/10 rounded mb-2" />
    <View className="w-20 h-3 bg-white/5 rounded" />
  </View>
);

export const SkeletonCategory = () => (
  <View className="w-[48%] mb-3 h-24 rounded-xl bg-white/5 overflow-hidden" />
);

export const SkeletonFeatured = () => (
    <View className="w-[316px] mr-6">
        <View className="h-[460px] w-full rounded-[32px] bg-white/5 overflow-hidden" />
    </View>
);

export const SkeletonTrending = () => (
    <View className="flex-row items-center mb-6 px-6">
      <View className="w-8 mr-4 h-6 bg-white/5 rounded" />
      <View className="w-16 h-24 rounded-lg bg-white/5 mr-4" />
      <View className="flex-1">
        <View className="w-20 h-3 bg-white/10 rounded mb-2" />
        <View className="w-40 h-5 bg-white/10 rounded mb-2" />
        <View className="w-24 h-3 bg-white/5 rounded" />
      </View>
    </View>
);
