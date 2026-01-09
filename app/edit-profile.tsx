import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '../src/hooks/useProfile';

export default function EditProfileScreen() {
  const router = useRouter();
  const { session } = useAuth(); // Changed from 'user' to 'session' to match context export
  const user = session?.user;
  
  // React Query Hooks
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  // Local State for Form
  const [username, setUsername] = useState('');
  const [uploading, setUploading] = useState(false);
  const [tempAvatar, setTempAvatar] = useState<string | null>(null); // For immediate preview

  // Sync state with fetched data
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    
    // Use the mutation hook
    updateProfileMutation.mutate(
      { username },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Profile updated successfully', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        },
        onError: (error) => {
          Alert.alert('Error', error.message);
        }
      }
    );
  };

  const pickImage = async () => {
    Alert.alert(
      "Update Profile Picture",
      "Choose an option",
      [
        { text: "Camera", onPress: launchCamera },
        { text: "Gallery", onPress: launchImageLibrary },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const launchCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Camera access is needed to take a photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      handleImageSelected(result.assets[0].uri);
    }
  };

  const launchImageLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Gallery access is needed to select a photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
       mediaTypes: ImagePicker.MediaTypeOptions.Images,
       allowsEditing: true,
       aspect: [1, 1],
       quality: 1,
    });

    if (!result.canceled) {
      handleImageSelected(result.assets[0].uri);
    }
  };

  const handleImageSelected = async (uri: string) => {
    if (!user) return;
    setUploading(true);
    // Show immediate preview
    setTempAvatar(uri);

    try {
      // 1. Compress
      const manipulated = await manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.8, format: SaveFormat.JPEG }
      );
      
      const fileUri = manipulated.uri;
      const fileExt = fileUri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // 2. Upload to Supabase Storage
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: `image/${fileExt}`
      } as any);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, formData);

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 4. Update Profile via Mutation
      updateProfileMutation.mutate(
        { avatar_url: data.publicUrl },
        {
            onSuccess: () => {
                setTempAvatar(null); // Clear temp, let real data take over
                Alert.alert('Success', 'Profile photo updated!');
            },
            onError: (err) => {
                setTempAvatar(null);
                Alert.alert("Update Failed", err.message);
            }
        }
      );

    } catch (error: any) {
      Alert.alert("Upload Failed", error.message);
      setTempAvatar(null); // Revert on fail
    } finally {
      setUploading(false);
    }
  };

  if (isProfileLoading) {
     return (
        <View className="flex-1 bg-dark-bg justify-center items-center">
            <ActivityIndicator size="large" color="#FF2D55" />
        </View>
     );
  }

  // Determine avatar to show: Temp (optimistic) > Saved Profile > Fallback Initials
  const displayAvatar = tempAvatar || profile?.avatar_url;

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
          disabled={updateProfileMutation.isPending}
          className={`px-4 py-2 rounded-full ${updateProfileMutation.isPending ? 'bg-gray-600' : 'bg-primary'}`}
        >
          <Text className="text-white font-bold text-sm">
            {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Profile Picture Section */}
        <View className="items-center mt-8 mb-8">
          <View className="relative">
            <View className="w-24 h-24 rounded-full bg-gray-700 border-4 border-dark-bg mb-4 overflow-hidden">
              {displayAvatar ? (
                <Image
                  source={{ uri: displayAvatar }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
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
