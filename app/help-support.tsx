import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HelpSupportScreen() {
  const router = useRouter();

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@storyvlog.com');
  };

  const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
    <View className="mb-6 bg-dark-card p-4 rounded-xl border border-white/5">
      <Text className="text-white font-bold mb-2">{question}</Text>
      <Text className="text-gray-400 text-sm leading-5">{answer}</Text>
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
        <Text className="text-white text-lg font-bold">Help & Support</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        
        {/* Contact Options */}
        <Text className="text-gray-500 text-xs font-bold uppercase mb-4 ml-2">Contact Us</Text>
        <View className="flex-row mb-8 space-x-4 gap-4">
          <TouchableOpacity 
            onPress={handleEmailSupport}
            className="flex-1 bg-primary/20 p-4 rounded-xl items-center border border-primary/30 active:opacity-80"
          >
            <Ionicons name="mail" size={24} color="#FF2D55" className="mb-2" />
            <Text className="text-white font-semibold">Email Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 bg-blue-500/20 p-4 rounded-xl items-center border border-blue-500/30 active:opacity-80"
          >
            <Ionicons name="chatbubbles" size={24} color="#3B82F6" className="mb-2" />
            <Text className="text-white font-semibold">Live Chat</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text className="text-gray-500 text-xs font-bold uppercase mb-4 ml-2">Frequently Asked Questions</Text>
        
        <FAQItem 
          question="How do I upload a story?" 
          answer="Go to the Create tab, select your video or image, add a title and description, and tap Publish." 
        />
        
        <FAQItem 
          question="How can I change my profile picture?" 
          answer="Navigate to your Profile tab, tap 'Edit Profile', and click on the camera icon on your avatar." 
        />
        
        <FAQItem 
          question="Is StoryVlog free to use?" 
          answer="Yes, StoryVlog is free to download and use. Some premium features may require a subscription." 
        />

        <FAQItem 
          question="How do I delete my account?" 
          answer="Please contact our support team via email to request account deletion. We process these requests within 24 hours." 
        />

        {/* Bottom spacer */}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
