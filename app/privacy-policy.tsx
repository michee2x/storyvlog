import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const Section = ({ title, content }: { title: string, content: string }) => (
    <View className="mb-6">
      <Text className="text-white text-lg font-bold mb-2">{title}</Text>
      <Text className="text-gray-400 leading-6">{content}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/10">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-white/10 rounded-full justify-center items-center"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Privacy & Policy</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        <Text className="text-gray-400 text-sm mb-6">Last updated: January 8, 2026</Text>

        <Section 
          title="1. Introduction" 
          content="Welcome to StoryVlog. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our application and tell you about your privacy rights and how the law protects you."
        />

        <Section 
          title="2. Data We Collect" 
          content="We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows: Identity Data (username, image), Contact Data (email address), and Usage Data (how you use our app)."
        />

        <Section 
          title="3. How We Use Your Data" 
          content="We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances: Where we need to perform the contract we are about to enter into or have entered into with you."
        />

        <Section 
          title="4. Data Security" 
          content="We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed."
        />

        <Section 
          title="5. Your Rights" 
          content="Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent."
        />

        {/* Bottom spacer */}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
