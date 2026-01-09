import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/contexts/AuthContext';
import { supabase } from '../src/lib/supabase';

interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  balance: number;
}

export default function EditProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form fields
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        console.log('Profile loaded:', data);
        setProfile(data);
        setUsername(data.username || '');
        setAvatarUrl(data.avatar_url || null);
        console.log('Avatar URL:', data.avatar_url);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [user?.id]);

  const pickImage = async () => {
    Alert.alert(
      'Profile Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Camera permission is required to take photos');
              return;
            }
            launchCamera();
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Gallery permission is required to choose photos');
              return;
            }
            launchImageLibrary();
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const launchCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const launchImageLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user?.id) return;

    try {
      setUploading(true);

      // Compress image
      const manipResult = await manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.8, format: SaveFormat.JPEG }
      );

      // Read file as base64
      const response = await fetch(manipResult.uri);
      const blob = await response.blob();
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });

      // Upload to Supabase Storage
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        Alert.alert('Upload Failed', `Supabase Storage Error: ${uploadError.message}`);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
        
      console.log('Generated Public URL:', publicUrl);
      // Debug alert
      Alert.alert('Debug', `Generated URL: ${publicUrl}`);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        Alert.alert('Update Failed', `DB Update Error: ${updateError.message}`);
        return;
      }

      // Update local state
      setAvatarUrl(publicUrl);
      Alert.alert('Success', 'Profile photo updated successfully!');

    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', `Unexpected Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    
    // Only update username for now (bio field might not exist in database)
    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', `Failed to update profile: ${error.message}`);
    } else {
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
    setSaving(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 justify-center items-center">
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Edit Profile</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          disabled={saving}
          className="px-4 py-2 rounded-full bg-primary"
        >
          <Text className="text-white font-bold text-sm">
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Profile Picture Section */}
        <View className="items-center mt-8 mb-8">
          <View className="relative">
            <View className="w-24 h-24 rounded-full bg-gray-700 border-4 border-dark-bg mb-4 overflow-hidden">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                  key={avatarUrl}
                />
              ) : (
                <View className="w-full h-full bg-primary justify-center items-center">
                  <Text className="text-4xl text-white font-bold">
                    {username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              {uploading && (
                <View className="absolute inset-0 bg-black/50 justify-center items-center">
                  <ActivityIndicator size="large" color="#FF2D55" />
                </View>
              )}
            </View>
            <TouchableOpacity 
              onPress={pickImage}
              disabled={uploading}
              className="absolute bottom-4 right-0 bg-white p-2 rounded-full border-2 border-dark-bg"
            >
              <Ionicons name="camera" size={16} color="black" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-400 text-sm">Tap to change profile photo</Text>
        </View>

        {/* Form Fields */}
        <View className="px-6">
          
          {/* Username */}
          <View className="mb-6">
            <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-2">Username</Text>
            <View className="bg-dark-card rounded-2xl border border-white/10 px-4 py-4">
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                placeholderTextColor="#52525B"
                className="text-white text-base"
              />
            </View>
          </View>

          {/* Email (Read-only) */}
          <View className="mb-6">
            <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-2">Email</Text>
            <View className="bg-dark-card rounded-2xl border border-white/10 px-4 py-4 opacity-50">
              <Text className="text-white text-base">{user?.email}</Text>
            </View>
            <Text className="text-gray-500 text-xs mt-2 ml-2">Email cannot be changed</Text>
          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
