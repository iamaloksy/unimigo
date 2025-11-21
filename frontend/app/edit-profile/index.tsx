import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../src/store/authStore';
import api from '../../src/config/api';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    department: '',
    year: '',
    phone: '',
    profileImage: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setUploading(true);
      try {
        const { data } = await api.post('/auth/upload-profile-image', {
          imageBase64: `data:image/jpeg;base64,${result.assets[0].base64}`,
        });
        setProfile({ ...profile, profileImage: data.imageUrl });
        Alert.alert('Success', 'Photo uploaded! Background removed automatically.');
      } catch (error: any) {
        Alert.alert('Error', 'Failed to upload image');
      } finally {
        setUploading(false);
      }
    }
  };

  useEffect(() => {
    if (user) {
      const nameParts = user.name?.split(' ') || ['', ''];
      setProfile({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        bio: user.bio || '',
        department: user.department || '',
        year: user.year?.toString() || '',
        phone: user.phone || '',
        profileImage: user.profileImage || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!profile.firstName || !profile.lastName) {
      Alert.alert('Error', 'First and last name are required');
      return;
    }
    
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', {
        name: `${profile.firstName} ${profile.lastName}`,
        bio: profile.bio,
        department: profile.department,
        year: profile.year,
        phone: profile.phone,
        profileImage: profile.profileImage,
      });
      
      await setUser(data.user, null, null);
      
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
            {profile.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={40} color="#00B4D8" />
              </View>
            )}
            {uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color="#FFFFFF" size="large" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.imageHint}>Tap to upload (BG removed automatically)</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={profile.firstName}
                onChangeText={(text) => setProfile({ ...profile, firstName: text })}
                placeholder="John"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={profile.lastName}
                onChangeText={(text) => setProfile({ ...profile, lastName: text })}
                placeholder="Doe"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={profile.bio}
              onChangeText={(text) => setProfile({ ...profile, bio: text })}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Department</Text>
            <TextInput
              style={styles.input}
              value={profile.department}
              onChangeText={(text) => setProfile({ ...profile, department: text })}
              placeholder="e.g. Computer Science"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Year</Text>
            <View style={styles.yearButtons}>
              {['1', '2', '3', '4'].map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearButton,
                    profile.year === year && styles.yearButtonActive,
                  ]}
                  onPress={() => setProfile({ ...profile, year })}
                >
                  <Text
                    style={[
                      styles.yearButtonText,
                      profile.year === year && styles.yearButtonTextActive,
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={profile.phone}
              onChangeText={(text) => setProfile({ ...profile, phone: text })}
              placeholder="+91 1234567890"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Profile Image URL</Text>
            <TextInput
              style={styles.input}
              value={profile.profileImage}
              onChangeText={(text) => setProfile({ ...profile, profileImage: text })}
              placeholder="https://example.com/image.jpg"
              keyboardType="url"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="save" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  yearButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  yearButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    alignItems: 'center',
  },
  yearButtonActive: {
    borderColor: '#00B4D8',
    backgroundColor: '#E6F7FB',
  },
  yearButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  yearButtonTextActive: {
    color: '#00B4D8',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00B4D8',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#00B4D8',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E6F7FB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#00B4D8',
    borderStyle: 'dashed',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
});
