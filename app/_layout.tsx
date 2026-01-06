import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import './globals.css';
import { AuthProvider } from '../src/contexts/AuthContext';

SystemUI.setBackgroundColorAsync('#0F0F1A');

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0F0F1A' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="category/[id]" options={{ presentation: 'card', headerShown: false }} />
        <Stack.Screen name="story/[id]" options={{ presentation: 'card', headerShown: false }} />
        <Stack.Screen name="story/reader" options={{ presentation: 'fullScreenModal', headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
