import { ScrollView, View } from 'react-native';

const SkeletonItem = () => (
    <View className="mr-4">
        {/* Cover Image Skeleton */}
        <View className="w-28 h-40 bg-white/10 rounded-lg mb-2" />
        {/* Title Skeleton */}
        <View className="w-24 h-4 bg-white/10 rounded mb-1" />
        {/* Author/Subtitle Skeleton */}
        <View className="w-16 h-3 bg-white/5 rounded" />
    </View>
);

export default function HomeSectionSkeleton({ title = true }: { title?: boolean }) {
    return (
        <View className="mb-8 pl-6">
            {/* Section Header Skeleton */}
            {title && (
                <View className="flex-row justify-between items-end mb-4 pr-6">
                    <View className="w-32 h-6 bg-white/10 rounded" />
                    <View className="w-16 h-4 bg-white/5 rounded" />
                </View>
            )}
            
            {/* Horizontal List Skeleton */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[1, 2, 3, 4].map((item) => (
                    <SkeletonItem key={item} />
                ))}
            </ScrollView>
        </View>
    );
}
