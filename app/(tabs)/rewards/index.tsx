import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RewardsScreen() {
  const tasks = [
    { icon: "book", title: "Read 3 Chapters", reward: "+50", done: true },
    { icon: "share-social", title: "Share a Story", reward: "+100", done: false },
    { icon: "play-circle", title: "Watch an Ad", reward: "+20", done: false },
    { icon: "person-add", title: "Invite a Friend", reward: "+500", done: false },
  ];

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header */}
        <View className="px-6 py-6 items-center">
            <Text className="text-white text-xl font-bold mb-1">Rewards Center</Text>
            <Text className="text-gray-400 text-sm">Earn stars to unlock premium stories</Text>
        </View>

        {/* Balance Card */}
        <View className="px-6 mb-8">
            <LinearGradient
                colors={['#FF2D55', '#FF5B79']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-full rounded-3xl p-6 shadow-lg shadow-primary/30"
            >
                <View className="flex-row justify-between items-start">
                    <View>
                        <Text className="text-white/80 font-bold mb-1">Total Balance</Text>
                        <Text className="text-white text-4xl font-extrabold">1,240</Text>
                    </View>
                    <View className="bg-white/20 p-2 rounded-full">
                        <Ionicons name="star" size={24} color="white" />
                    </View>
                </View>
                <TouchableOpacity className="mt-6 bg-black/20 self-start px-4 py-2 rounded-full">
                    <Text className="text-white font-bold text-xs">REDEEM NOW</Text>
                </TouchableOpacity>
            </LinearGradient>
        </View>

        {/* Daily Streak */}
        <View className="px-6 mb-8">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white font-bold text-lg">Daily Streak</Text>
                <Text className="text-primary font-bold">Day 4</Text>
            </View>
            <View className="flex-row justify-between bg-dark-card p-4 rounded-2xl border border-white/5">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                    const active = i < 4;
                    const current = i === 3;
                    return (
                        <View key={i} className="items-center">
                            <Text className="text-gray-500 text-xs mb-2">{day}</Text>
                            <View className={`w-8 h-8 rounded-full justify-center items-center ${current ? 'bg-primary' : active ? 'bg-primary/20' : 'bg-white/5'}`}>
                                {active ? (
                                    <Ionicons name="checkmark" size={14} color={current ? "white" : "#FF2D55"} />
                                ) : (
                                    <View className="w-2 h-2 rounded-full bg-white/10" />
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>

        {/* Tasks */}
        <View className="px-6">
            <Text className="text-white font-bold text-lg mb-4">Quick Tasks</Text>
            {tasks.map((task, index) => (
                <View key={index} className="flex-row items-center bg-dark-card p-4 rounded-2xl mb-3 border border-white/5">
                    <View className="w-10 h-10 rounded-full bg-white/5 justify-center items-center mr-4">
                        <Ionicons name={task.icon as any} size={20} color={task.done ? "#4ADE80" : "white"} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white font-bold text-base">{task.title}</Text>
                        <Text className="text-primary font-bold text-sm">{task.reward} Stars</Text>
                    </View>
                    <TouchableOpacity className={`px-4 py-2 rounded-full ${task.done ? 'bg-white/5' : 'bg-primary'}`}>
                        <Text className={`font-bold text-xs ${task.done ? 'text-gray-400' : 'text-white'}`}>
                            {task.done ? 'DONE' : 'CLAIM'}
                        </Text>
                    </TouchableOpacity>
                </View>
            ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
