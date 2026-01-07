import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchStoryDetails, Story } from '../../../src/api/stories';
import ReaderControls from '../../../src/components/reader/ReaderControls';
import { smartSplitSentences } from '../../../src/utils/textUtils';
import { extractColorsFromImage, ExtractedColors } from '../../../src/utils/colorExtractor';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ReaderScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);
    const [layouts, setLayouts] = useState<number[]>([]);

    // Safe params extraction
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const chapterIndexParam = Array.isArray(params.chapterIndex) ? params.chapterIndex[0] : params.chapterIndex;

    const [story, setStory] = useState<Story | null>(null);
    const [sentences, setSentences] = useState<string[]>([]);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [colors, setColors] = useState<ExtractedColors>({
        primary: '#0a0a0a',
        secondary: '#0f0f0f',
        background: '#000000',
        accent: '#1DB954',
    });

    // Initial Load
    useEffect(() => {
        if (id) loadContent();
        return () => {
            Speech.stop();
        };
    }, [id, chapterIndexParam]);

    const loadContent = async () => {
        try {
            setLoading(true);
            const data = await fetchStoryDetails(id as string);
            setStory(data as Story);
            
            // Extract ACTUAL colors from the cover image pixels
            if (data.coverImage) {
                const extractedColors = await extractColorsFromImage(data.coverImage);
                setColors(extractedColors);
            }
            
            if (data.chapters && data.chapters.length > 0) {
                const index = Number(chapterIndexParam) || 0;
                if (index >= 0 && index < data.chapters.length) {
                    const chContent = data.chapters[index].content;
                    const split = smartSplitSentences(chContent);
                    setSentences(split);
                } else {
                     // Fallback to first chapter
                     const split = smartSplitSentences(data.chapters[0].content);
                     setSentences(split);
                }
            } else {
                 setSentences(["No content available."]);
            }
            setLoading(false);
            // Reset state on new chapter load
            setCurrentSentenceIndex(0);
            setIsPlaying(false);
        } catch (e) {
            console.error("Failed to load story content", e);
            setLoading(false);
        }
    };

    // Auto-Scroll (Central Focus)
    useEffect(() => {
        if (layouts[currentSentenceIndex] && scrollViewRef.current) {
            // Calculate position to center the text: Target Y - (Screen Half Height) + (Text Half Height approx)
            // A crude approximation is better: standard offset
            scrollViewRef.current.scrollTo({
                y: layouts[currentSentenceIndex] - (SCREEN_HEIGHT * 0.3), 
                animated: true,
            });
        }
    }, [currentSentenceIndex, layouts]);

    // Playback Loop
    useEffect(() => {
        if (isPlaying && sentences.length > 0) {
            readSentence(currentSentenceIndex);
        } else {
            Speech.stop();
        }
    }, [isPlaying]);

    // Trigger read on index change if playing
    useEffect(() => {
        if (isPlaying) {
             Speech.stop(); 
             readSentence(currentSentenceIndex);
        }
    }, [currentSentenceIndex]);

    const readSentence = async (index: number) => {
        if (index >= sentences.length) {
            // End of chapter -> Go next or stop
            handleEndOfChapter();
            return;
        }

        const text = sentences[index];
        Speech.speak(text, {
            rate: playbackSpeed,
            onDone: () => {
                // Advance to next sentence
                setCurrentSentenceIndex(prev => {
                     const next = prev + 1;
                     if (next < sentences.length) return next;
                     
                     // If we reached end here (param check), loop logic handles end of chapter
                     // But we can just increment to length, and the next read call catches it
                     return next;
                });
            },
            onError: (e) => {
                console.log("Speech Error", e);
                setIsPlaying(false);
            }
        });
    };

    const handleEndOfChapter = () => {
        if (!story?.chapters) {
            setIsPlaying(false);
            return;
        }
        const currentIdx = Number(chapterIndexParam) || 0;
        if (currentIdx < story.chapters.length - 1) {
            // Auto-advance
            // We give a small pause or toast? For now, direct jump.
            router.replace({ pathname: `/story/${id}/read`, params: { chapterIndex: currentIdx + 1 } });
        } else {
            // End of book
            setIsPlaying(false);
        }
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            Speech.stop();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
        }
    };

    const changeSpeed = () => {
        const speeds = [0.8, 1.0, 1.2, 1.5, 2.0];
        const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
        setPlaybackSpeed(speeds[nextIndex]);
    };

    const handleSentencePress = (index: number) => {
        Speech.stop();
        setCurrentSentenceIndex(index);
        setIsPlaying(true);
    };

    // Navigation Utils
    const goToNextChapter = () => {
        if (!story?.chapters) return;
        const currentIdx = Number(chapterIndexParam) || 0;
        if (currentIdx < story.chapters.length - 1) {
            router.replace({ pathname: `/story/${id}/read`, params: { chapterIndex: currentIdx + 1 } });
        }
    };

    const goToPrevChapter = () => {
         const currentIdx = Number(chapterIndexParam) || 0;
         if (currentIdx > 0) {
            router.replace({ pathname: `/story/${id}/read`, params: { chapterIndex: currentIdx - 1 } });
         }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
                <ActivityIndicator color={colors.accent} size="large" />
            </View>
        );
    }

    const currentChapter = story?.chapters ? story.chapters[Number(chapterIndexParam)||0] : null;

    return (
        <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
            <LinearGradient
                colors={[colors.primary, colors.secondary, colors.background]}
                locations={[0, 0.3, 1]}
                className="absolute top-0 left-0 right-0 bottom-0"
            />
            <StatusBar barStyle="light-content" />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header: Minimal & Floating */}
            <View className="px-6 py-4 flex-row justify-between items-center z-10 absolute top-0 w-full" style={{ backgroundColor: colors.primary + '99' }}>
                 <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-white/10">
                    <Ionicons name="chevron-down" size={24} color="white" />
                </TouchableOpacity>
                <View className="items-center flex-1 mx-4">
                   <Text className="text-white/60 text-xs font-bold uppercase tracking-widest mb-0.5">Playing From Story</Text>
                   <Text className="text-white font-bold text-sm" numberOfLines={1}>{story?.title}</Text>
                </View>
                <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-white/10">
                    <Ionicons name="ellipsis-horizontal" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Main Content: Focused Reading */}
            <ScrollView 
                ref={scrollViewRef}
                className="flex-1 px-6"
                contentContainerStyle={{ paddingTop: 100, paddingBottom: 200 }} 
                showsVerticalScrollIndicator={false}
            >
                {/* Chapter Title */}
                {currentChapter && (
                    <Text className="text-white font-serif text-2xl font-bold text-center mb-10 opacity-90">
                        {currentChapter.title}
                    </Text>
                )}

                {sentences.map((sentence, index) => {
                    const isActive = index === currentSentenceIndex;
                    return (
                        <TouchableOpacity 
                            key={index} 
                            onPress={() => handleSentencePress(index)}
                            onLayout={(event) => {
                                const y = event.nativeEvent.layout.y;
                                setLayouts(prev => {
                                    const newLayouts = [...prev];
                                    newLayouts[index] = y;
                                    return newLayouts;
                                });
                            }}
                            activeOpacity={0.9}
                            className="mb-8"
                        >
                            <Text 
                                className={`font-serif text-3xl leading-10 transition-all duration-500
                                    ${isActive ? 'text-white' : 'text-gray-600'}`}
                                style={{ 
                                    // Dynamic styling for active vs inactive
                                    opacity: isActive ? 1 : 0.99,
                                    transform: [{ scale: isActive ? 1.05 : 1.0 }],
                                }}
                            >
                                {sentence}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
            
            {/* Gradient Fade for bottom controls */}
            <LinearGradient
                colors={['transparent', colors.background + 'E6', colors.background]}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 250 }}
                pointerEvents="none"
            />

            {/* Controls: Fixed Bottom Sheet Style */}
            <View className="absolute bottom-0 w-full px-6 pb-8">
                {/* Progress / Navigation Info */}
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-gray-400 text-xs font-medium">
                        {currentSentenceIndex + 1} / {sentences.length}
                    </Text>
                    <View className="flex-row items-center gap-2">
                        {/* Chapter Pills */}
                         <TouchableOpacity onPress={goToPrevChapter} disabled={(Number(chapterIndexParam)||0) <= 0}>
                            <Ionicons name="play-skip-back" size={20} color={(Number(chapterIndexParam)||0) > 0 ? "white" : "#333"} />
                         </TouchableOpacity>
                         <Text className="text-gray-400 text-xs font-medium">Ep { (Number(chapterIndexParam)||0) + 1}</Text>
                         <TouchableOpacity onPress={goToNextChapter} disabled={!story?.chapters || (Number(chapterIndexParam)||0) >= story.chapters.length - 1}>
                            <Ionicons name="play-skip-forward" size={20} color={(!story?.chapters || (Number(chapterIndexParam)||0) >= story.chapters.length - 1) ? "#333" : "white"} />
                         </TouchableOpacity>
                    </View>
                </View>

                {/* Main Player Controls */}
                <ReaderControls 
                    isPlaying={isPlaying}
                    onPlayPause={togglePlayPause}
                    onNext={() => setCurrentSentenceIndex(prev => Math.min(prev + 1, sentences.length - 1))}
                    onPrev={() => setCurrentSentenceIndex(prev => Math.max(prev - 1, 0))}
                    playbackSpeed={playbackSpeed}
                    onSpeedChange={changeSpeed}
                />
            </View>
        </SafeAreaView>
    );
}
