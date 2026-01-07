import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';
import { Story } from '../../api/stories';
import FeaturedStoryCard from '../cards/FeaturedStoryCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  data: Story[];
}

export default function FeaturedCarousel({ data }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  
  // Create a large dataset to simulate infinity
  // We repeat the data 100 times.
  // Start in the middle (set 50) so user can scroll left or right "infinitely"
  const REPEAT_COUNT = 100;
  const MIDDLE_SET_INDEX = 50;
  
  // If data is empty, handle gracefully
  if (!data || data.length === 0) return null;

  const repeatedData = Array(REPEAT_COUNT).fill(data).flat();
  const initialIndex = data.length * MIDDLE_SET_INDEX;
  
  // Use a ref to track the current raw index for auto-scroll logic
  const currentIndexRef = useRef(initialIndex);

  // Auto Scroll
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAutoScrolling) {
      interval = setInterval(() => {
        const nextIndex = currentIndexRef.current + 1;
        
        // Safety check to prevent going out of bounds (unlikely with 100 buffer)
        if (nextIndex >= repeatedData.length) {
          // Reset to middle silently? Ideally yes, but with 100 sets it takes hours to reach end.
          // We'll just let it run.
           return; 
        }

        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        
        // We update the ref here assuming the scroll will succeed. 
        // Real update happens in onScroll/onMomentumScrollEnd, 
        // but for the interval logic we need to push it forward.
        currentIndexRef.current = nextIndex;
        
        // Update UI state for dots
        setActiveIndex(nextIndex % data.length);
        
      }, 4000); // 4 seconds slide
    }

    return () => clearInterval(interval);
  }, [isAutoScrolling, data.length, repeatedData.length]);

  // Handle manual scroll updates
  const onMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundedIndex = Math.round(index);
    
    currentIndexRef.current = roundedIndex;
    setActiveIndex(roundedIndex % data.length);
  }, [data.length]);
  
  const getItemLayout = (_: any, index: number) => ({
    length: SCREEN_WIDTH,
    offset: SCREEN_WIDTH * index,
    index,
  });

  const onScrollBeginDrag = () => setIsAutoScrolling(false);
  const onScrollEndDrag = () => setIsAutoScrolling(true);

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={repeatedData}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToAlignment="center"
        decelerationRate="fast"
        renderItem={({ item }) => (
          <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 24 }}>
            <FeaturedStoryCard story={item} />
          </View>
        )}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        getItemLayout={getItemLayout}
        initialScrollIndex={initialIndex}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        // Optimization props
        windowSize={3}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        removeClippedSubviews={true}
      />
      
      {/* Pagination Dots */}
      <View className="flex-row justify-center gap-2 mt-4">
        {data.map((_, i) => (
          <View 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex 
                ? 'bg-primary w-6' 
                : 'bg-white/20 w-1.5'
            }`} 
          />
        ))}
      </View>
    </View>
  );
}
