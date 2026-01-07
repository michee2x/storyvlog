import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface ReaderControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    onNext: () => void;
    onPrev: () => void;
    playbackSpeed: number;
    onSpeedChange: () => void;
}

export default function ReaderControls({ 
    isPlaying, 
    onPlayPause, 
    onNext, 
    onPrev, 
    playbackSpeed, 
    onSpeedChange 
}: ReaderControlsProps) {
    return (
        <View className="absolute bottom-10 left-6 right-6 bg-dark-card/90 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg shadow-black/50">
            {/* Top Row: Timestamps & Speed */}
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-400 text-xs font-medium">Auto-Scroll ON</Text>
                <TouchableOpacity onPress={onSpeedChange} className="bg-white/10 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">{playbackSpeed}x Speed</Text>
                </TouchableOpacity>
            </View>

            {/* Controls Row */}
            <View className="flex-row items-center justify-between px-4">
                {/* Previous Button (Rewind) */}
                <TouchableOpacity onPress={onPrev} className="p-2">
                    <Ionicons name="play-skip-back" size={24} color="#FFF" opacity={0.7} />
                </TouchableOpacity>

                {/* Play/Pause Button (Main) */}
                <TouchableOpacity 
                    onPress={onPlayPause}
                    className="w-16 h-16 bg-primary rounded-full items-center justify-center shadow-lg shadow-primary/40"
                >
                    <Ionicons 
                        name={isPlaying ? "pause" : "play"} 
                        size={32} 
                        color="white" 
                        style={{ marginLeft: isPlaying ? 0 : 4 }} 
                    />
                </TouchableOpacity>

                {/* Next Button (Forward) */}
                <TouchableOpacity onPress={onNext} className="p-2">
                    <Ionicons name="play-skip-forward" size={24} color="#FFF" opacity={0.7} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
