import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchStoryDetails, Story } from '../../../src/api/stories';
import ReaderControls from '../../../src/components/reader/ReaderControls';
import ReaderSettings, { ReaderConfig } from '../../../src/components/reader/ReaderSettings';
import { extractColorsFromImage, ExtractedColors } from '../../../src/utils/colorExtractor';
import { smartSplitSentences } from '../../../src/utils/textUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Helper to get theme styles
const getThemeStyles = (theme: string) => {
    switch (theme) {
        case 'light': return { bg: '#FFFFFF', text: '#1a1a1a' };
        case 'sepia': return { bg: '#F4ECD8', text: '#5D4037' };
        case 'dark': 
        default: return { bg: '#1A1A1A', text: '#E5E5E5' };
    }
};

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'reader_settings_v1';

export default function ReaderScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const immersiveScrollRef = useRef<ScrollView>(null);
    const [layouts, setLayouts] = useState<number[]>([]);

    // Safe params extraction
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const chapterIndexParam = Array.isArray(params.chapterIndex) ? params.chapterIndex[0] : params.chapterIndex;

    const [story, setStory] = useState<Story | null>(null);
    const [sentences, setSentences] = useState<string[]>([]);
    // Plain text content for classic mode
    const [fullChapterText, setFullChapterText] = useState<string>(""); 
    
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    
    // Settings State
    const [showSettings, setShowSettings] = useState(false);
    const [config, setConfigState] = useState<ReaderConfig>({
        mode: 'immersive', // Default
        scroll: 'vertical',
        theme: 'dark',
        fontSize: 18
    });

    // Wrapper to save settings
    const setConfig = (newConfig: Partial<ReaderConfig> | ((prev: ReaderConfig) => ReaderConfig)) => {
        setConfigState(prev => {
            const updated = typeof newConfig === 'function' ? newConfig(prev) : { ...prev, ...newConfig };
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(e => console.error("Failed to save settings", e));
            return updated;
        });
    };

    // Load Settings
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then(json => {
            if (json) {
                try {
                    const saved = JSON.parse(json);
                    setConfigState(prev => ({ ...prev, ...saved }));
                } catch (e) {
                    console.error("Failed to parse settings", e);
                }
            }
        });
    }, []);

    const [colors, setColors] = useState<ExtractedColors>({
        primary: '#0a0a0a',
        secondary: '#0f0f0f',
        background: '#000000',
        accent: '#FF2D55',
    });

    const themeStyles = getThemeStyles(config.theme);

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
                    setFullChapterText(chContent);
                    const split = smartSplitSentences(chContent);
                    setSentences(split);
                } else {
                     // Fallback to first chapter
                     const chContent = data.chapters[0].content;
                     setFullChapterText(chContent);
                     const split = smartSplitSentences(chContent);
                     setSentences(split);
                }
            } else {
                 setSentences(["No content available."]);
                 setFullChapterText("No content available.");
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

    // Auto-Scroll (Central Focus for Immersive)
    useEffect(() => {
        if (config.mode === 'immersive' && layouts[currentSentenceIndex] && immersiveScrollRef.current) {
            immersiveScrollRef.current.scrollTo({
                y: layouts[currentSentenceIndex] - (SCREEN_HEIGHT * 0.3), 
                animated: true,
            });
        }
    }, [currentSentenceIndex, layouts, config.mode]);

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
            router.replace({ pathname: `/story/${id}/read`, params: { chapterIndex: currentIdx + 1 } });
        } else {
            setIsPlaying(false);
        }
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            Speech.stop();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            // Switch to immersive if ensuring sync
            if (config.mode !== 'immersive') {
                 // Optional: Auto switch to immersive on play?
                 // setConfig(p => ({...p, mode: 'immersive'}));
            }
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

    // --- RENDERERS ---

    const renderImmersiveMode = () => (
        <View className="flex-1">
             <LinearGradient
                colors={[colors.primary, colors.secondary, colors.background]}
                locations={[0, 0.3, 1]}
                className="absolute top-0 left-0 right-0 bottom-0"
            />
             <ScrollView 
                ref={immersiveScrollRef}
                className="flex-1 px-6"
                contentContainerStyle={{ paddingTop: 100, paddingBottom: 200 }} 
                showsVerticalScrollIndicator={false}
            >
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

            {/* Controls */}
            <View className="absolute bottom-0 w-full px-6 pb-8">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-gray-400 text-xs font-medium">
                        {currentSentenceIndex + 1} / {sentences.length}
                    </Text>
                    <View className="flex-row items-center gap-2">
                         <TouchableOpacity onPress={goToPrevChapter} disabled={(Number(chapterIndexParam)||0) <= 0}>
                            <Ionicons name="play-skip-back" size={20} color={(Number(chapterIndexParam)||0) > 0 ? "white" : "#333"} />
                         </TouchableOpacity>
                         <Text className="text-gray-400 text-xs font-medium">Ep { (Number(chapterIndexParam)||0) + 1}</Text>
                         <TouchableOpacity onPress={goToNextChapter} disabled={!story?.chapters || (Number(chapterIndexParam)||0) >= story.chapters.length - 1}>
                            <Ionicons name="play-skip-forward" size={20} color={(!story?.chapters || (Number(chapterIndexParam)||0) >= story.chapters.length - 1) ? "#333" : "white"} />
                         </TouchableOpacity>
                    </View>
                </View>

                <ReaderControls 
                    isPlaying={isPlaying}
                    onPlayPause={togglePlayPause}
                    onNext={() => setCurrentSentenceIndex(prev => Math.min(prev + 1, sentences.length - 1))}
                    onPrev={() => setCurrentSentenceIndex(prev => Math.max(prev - 1, 0))}
                    playbackSpeed={playbackSpeed}
                    onSpeedChange={changeSpeed}
                />
            </View>
        </View>
    );

    const renderClassicMode = () => {
        // Horizontal Paged Mode
        if (config.scroll === 'horizontal') {
            // Primitive simple pager: Ideally use PagerView, but FlatList horizontal with snapping works for MVP
            // Split full text into "Pages" approx? No, let's keep it simple: One long horizontal scroll? 
            // Or just split paragraphs into pages. 
            // For now: Horizontal List of BLOCKS/Paragraphs.
             
            // Better approach for Horizontal: Split by paragraphs, render one paragraph per screen? 
            // Or just a horizontal scroll view where you scroll horizontally to read line by line? No, that's bad UX.
            // Horizontal usually means "Pages".
            // Let's implement a very simple "Page" splitter.
            const pages = fullChapterText.split('\n\n').filter(p => p.trim().length > 0);
            
            return (
                <View className="flex-1" style={{ backgroundColor: themeStyles.bg }}>
                     <FlatList 
                        data={pages}
                        horizontal
                        pagingEnabled
                        keyExtractor={(_, i) => i.toString()}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                            <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 24, paddingTop: 40, height: '100%' }}>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={{ minHeight: SCREEN_HEIGHT * 0.7, justifyContent: 'center' }}>
                                         <Text 
                                            style={{ 
                                                color: themeStyles.text, 
                                                fontSize: config.fontSize, 
                                                lineHeight: config.fontSize * 1.6,
                                                fontFamily: 'serif' 
                                            }}
                                        >
                                            {item}
                                        </Text>
                                    </View>
                                    <Text style={{ textAlign: 'center', color: themeStyles.text, opacity: 0.5, marginTop: 20, marginBottom: 40 }}>
                                        {index + 1} / {pages.length}
                                    </Text>
                                </ScrollView>
                            </View>
                        )}
                     />
                     {/* Chapter Nav Overlay */}
                      <View className="absolute bottom-6 w-full px-6 flex-row justify-between opacity-50">
                        <TouchableOpacity onPress={goToPrevChapter}><Ionicons name="chevron-back" size={24} color={themeStyles.text} /></TouchableOpacity>
                        <TouchableOpacity onPress={goToNextChapter}><Ionicons name="chevron-forward" size={24} color={themeStyles.text} /></TouchableOpacity>
                     </View>
                </View>
            );
        }

        // Vertical Scroll Mode (Standard)
        return (
            <ScrollView 
                className="flex-1 px-6" 
                contentContainerStyle={{ paddingTop: 40, paddingBottom: 100 }}
                style={{ backgroundColor: themeStyles.bg }}
            >
                {currentChapter && (
                    <Text className="text-2xl font-bold font-serif mb-8 text-center" style={{ color: themeStyles.text }}>
                        {currentChapter.title}
                    </Text>
                )}
                <Text style={{ 
                    color: themeStyles.text, 
                    fontSize: config.fontSize, 
                    lineHeight: config.fontSize * 1.6,
                    fontFamily: 'serif',
                    marginBottom: 40
                }}>
                    {fullChapterText}
                </Text>

                {/* Chapter Nav */}
                <View className="flex-row justify-between items-center py-8 border-t" style={{ borderColor: themeStyles.text + '20' }}>
                     <TouchableOpacity 
                        onPress={goToPrevChapter} 
                        className="flex-row items-center p-3 rounded-lg"
                        style={{ backgroundColor: themeStyles.text + '10' }}
                    >
                         <Ionicons name="chevron-back" size={20} color={themeStyles.text} />
                         <Text style={{ color: themeStyles.text, marginLeft: 8, fontWeight: 'bold' }}>Prev</Text>
                     </TouchableOpacity>

                     <TouchableOpacity 
                        onPress={goToNextChapter} 
                        className="flex-row items-center p-3 rounded-lg"
                        style={{ backgroundColor: themeStyles.text + '10' }}
                    >
                         <Text style={{ color: themeStyles.text, marginRight: 8, fontWeight: 'bold' }}>Next</Text>
                         <Ionicons name="chevron-forward" size={20} color={themeStyles.text} />
                     </TouchableOpacity>
                </View>
            </ScrollView>
        );
    };

    return (
        <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: config.mode === 'immersive' ? colors.background : themeStyles.bg }}>
            <StatusBar barStyle={config.mode === 'immersive' || config.theme === 'dark' ? "light-content" : "dark-content"} />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View 
                className="px-6 py-4 flex-row justify-between items-center z-10 w-full" 
                style={{ 
                    backgroundColor: config.mode === 'immersive' ? colors.primary + '99' : themeStyles.bg,
                    borderBottomWidth: config.mode === 'classic' ? 1 : 0,
                    borderColor: themeStyles.text + '10'
                }}
            >
                 <TouchableOpacity onPress={() => router.back()} className={`w-10 h-10 items-center justify-center rounded-full ${config.mode === 'immersive' ? 'bg-white/10' : 'bg-gray-100'}`}>
                    <Ionicons name="chevron-down" size={24} color={config.mode === 'immersive' ? 'white' : 'black'} />
                </TouchableOpacity>
                
                <View className="items-center flex-1 mx-4">
                     {config.mode === 'immersive' ? (
                        <>
                           <Text className="text-white/60 text-xs font-bold uppercase tracking-widest mb-0.5">Now Playing</Text>
                           <Text className="text-white font-bold text-sm" numberOfLines={1}>{story?.title}</Text>
                        </>
                     ) : (
                        <Text className="font-serif font-bold text-base" numberOfLines={1} style={{ color: themeStyles.text }}>{story?.title}</Text>
                     )}
                </View>

                <TouchableOpacity 
                    onPress={() => setShowSettings(true)}
                    className={`w-10 h-10 items-center justify-center rounded-full ${config.mode === 'immersive' ? 'bg-white/10' : 'bg-gray-100'}`}
                >
                    <Ionicons name="settings-sharp" size={20} color={config.mode === 'immersive' ? 'white' : 'black'} />
                </TouchableOpacity>
            </View>

            {/* Settings Modal */}
            <ReaderSettings 
                visible={showSettings} 
                onClose={() => setShowSettings(false)}
                config={config}
                onUpdate={(newConfig) => setConfig(prev => ({ ...prev, ...newConfig }))}
            />

            {/* Content Switcher */}
            {config.mode === 'immersive' ? renderImmersiveMode() : renderClassicMode()}
            
        </SafeAreaView>
    );
}
