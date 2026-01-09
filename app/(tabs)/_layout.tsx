import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

export default function TabsLayout() {
  const primaryColor = '#FF2D55';
  const inactiveColor = '#8E8E93';
  const backgroundColor = '#0F0F1A';

  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: backgroundColor,
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
        tabBarShowLabel: false, // Minimalist look
        sceneStyle: { backgroundColor: backgroundColor } // Fix white flash in tabs
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search/index"
        options={{
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "search" : "search-outline"} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rewards/index"
        options={{
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "gift" : "gift-outline"} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
              <UnreadBadge />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

function UnreadBadge() {
  const { useUnreadNotificationCount } = require('../../src/hooks/useNotifications');
  const { data: count } = useUnreadNotificationCount();

  if (!count || count === 0) return null;

  return (
    <View className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF2D55] rounded-full border-2 border-[#0F0F1A] shadow-sm justify-center items-center">
      {/* Shiny reflection effect */}
      <View className="absolute top-0.5 right-0.5 w-1 h-1 bg-white/40 rounded-full" />
    </View>
  );
}


