import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export type ReaderMode = 'immersive' | 'classic';
export type ScrollMode = 'vertical' | 'horizontal';
export type ReaderTheme = 'light' | 'dark' | 'sepia';

export interface ReaderConfig {
    mode: ReaderMode;
    scroll: ScrollMode;
    theme: ReaderTheme;
    fontSize: number;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    config: ReaderConfig;
    onUpdate: (newConfig: Partial<ReaderConfig>) => void;
}

export default function ReaderSettings({ visible, onClose, config, onUpdate }: Props) {
    if (!visible) return null;

    const themes = [
        { id: 'light', color: '#FFFFFF', border: '#E5E7EB', text: '#000' },
        { id: 'sepia', color: '#F4ECD8', border: '#D3C4A5', text: '#5D4037' },
        { id: 'dark', color: '#1A1A1A', border: '#333333', text: '#FFF' },
    ];

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 bg-black/60 justify-end">
                    <TouchableWithoutFeedback>
                        <View className="bg-neutral-900 rounded-t-3xl p-6 pb-10 border-t border-white/10">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-white text-lg font-bold">Reading Preferences</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close" size={24} color="white" />
                                </TouchableOpacity>
                            </View>

                            {/* Mode Toggle */}
                            <View className="mb-6">
                                <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">View Mode</Text>
                                <View className="flex-row bg-white/10 p-1 rounded-xl">
                                    <TouchableOpacity 
                                        className={`flex-1 py-3 items-center rounded-lg ${config.mode === 'immersive' ? 'bg-primary' : 'bg-transparent'}`}
                                        onPress={() => onUpdate({ mode: 'immersive' })}
                                    >
                                        <Ionicons name="musical-notes" size={18} color={config.mode === 'immersive' ? 'white' : 'gray'} />
                                        <Text className={`text-xs font-bold mt-1 ${config.mode === 'immersive' ? 'text-white' : 'text-gray-400'}`}>Immersive</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        className={`flex-1 py-3 items-center rounded-lg ${config.mode === 'classic' ? 'bg-primary' : 'bg-transparent'}`}
                                        onPress={() => onUpdate({ mode: 'classic' })}
                                    >
                                        <Ionicons name="book" size={18} color={config.mode === 'classic' ? 'white' : 'gray'} />
                                        <Text className={`text-xs font-bold mt-1 ${config.mode === 'classic' ? 'text-white' : 'text-gray-400'}`}>Classic</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {config.mode === 'classic' && (
                                <>
                                    {/* Scroll Direction */}
                                    <View className="mb-6">
                                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Scroll Direction</Text>
                                        <View className="flex-row gap-3">
                                            <TouchableOpacity 
                                                className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border ${config.scroll === 'vertical' ? 'bg-white text-black border-white' : 'bg-transparent border-white/20'}`}
                                                onPress={() => onUpdate({ scroll: 'vertical' })}
                                            >
                                                <Ionicons name="arrow-down" size={16} color={config.scroll === 'vertical' ? 'black' : 'gray'} style={{ marginRight: 6 }} />
                                                <Text className={`font-bold ${config.scroll === 'vertical' ? 'text-black' : 'text-gray-400'}`}>Vertical</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border ${config.scroll === 'horizontal' ? 'bg-white text-black border-white' : 'bg-transparent border-white/20'}`}
                                                onPress={() => onUpdate({ scroll: 'horizontal' })}
                                            >
                                                <Ionicons name="arrow-forward" size={16} color={config.scroll === 'horizontal' ? 'black' : 'gray'} style={{ marginRight: 6 }} />
                                                <Text className={`font-bold ${config.scroll === 'horizontal' ? 'text-black' : 'text-gray-400'}`}>Paged</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Theme */}
                                    <View className="mb-6">
                                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Page Theme</Text>
                                        <View className="flex-row gap-4">
                                            {themes.map(t => (
                                                <TouchableOpacity 
                                                    key={t.id}
                                                    onPress={() => onUpdate({ theme: t.id as any })}
                                                    style={{ backgroundColor: t.color, borderColor: config.theme === t.id ? '#FF2D55' : t.border }}
                                                    className={`w-12 h-12 rounded-full border-2 justify-center items-center`}
                                                >
                                                    {config.theme === t.id && <Ionicons name="checkmark" size={20} color={t.id === 'light' || t.id === 'sepia' ? 'black' : 'white'} />}
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                    
                                     {/* Font Size */}
                                     <View className="mb-2">
                                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Font Size</Text>
                                        <View className="flex-row bg-white/10 rounded-xl items-center p-1">
                                            <TouchableOpacity 
                                                className="p-4 flex-1 items-center"
                                                onPress={() => onUpdate({ fontSize: Math.max(12, config.fontSize - 2) })}
                                            >
                                                <Text className="text-gray-300 text-sm font-bold">A-</Text>
                                            </TouchableOpacity>
                                            <Text className="text-white font-bold w-10 text-center">{config.fontSize}</Text>
                                            <TouchableOpacity 
                                                className="p-4 flex-1 items-center"
                                                onPress={() => onUpdate({ fontSize: Math.min(32, config.fontSize + 2) })}
                                            >
                                                <Text className="text-white text-lg font-bold">A+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
