import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../src/config/api';

type SharingType = '1BHK' | '2BHK' | '3BHK' | 'shared' | 'single';
type GenderPreference = 'male' | 'female' | 'any';

export default function PostScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rent, setRent] = useState('');
  const [address, setAddress] = useState('');
  const [sharingType, setSharingType] = useState<SharingType>('2BHK');
  const [genderPreference, setGenderPreference] = useState<GenderPreference>('any');
  const [phone, setPhone] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);

  const sharingTypes: SharingType[] = ['1BHK', '2BHK', '3BHK', 'shared', 'single'];
  const genderOptions: GenderPreference[] = ['male', 'female', 'any'];
  const amenityOptions = ['WiFi', 'AC', 'Washing Machine', 'Furnished', 'Parking', 'Security', 'Power Backup'];

  const toggleAmenity = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((a) => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !rent || !address) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const postData = {
        title,
        description,
        rent: parseInt(rent),
        location: { address },
        sharingType,
        genderPreference,
        amenities,
        contactInfo: { phone },
        images: [],
      };

      await api.post('/roommate/posts', postData);
      Alert.alert('Success', 'Your listing has been posted!', [
        { text: 'OK', onPress: () => router.push('/(tabs)') },
      ]);
      
      // Reset form
      setTitle('');
      setDescription('');
      setRent('');
      setAddress('');
      setPhone('');
      setAmenities([]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Listing</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2BHK Near Campus"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your room and requirements..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Rent per month (₹) *</Text>
            <TextInput
              style={styles.input}
              placeholder="8000"
              value={rent}
              onChangeText={setRent}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="Full address"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Sharing Type</Text>
            <View style={styles.optionsContainer}>
              {sharingTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionButton,
                    sharingType === type && styles.optionButtonActive,
                  ]}
                  onPress={() => setSharingType(type)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      sharingType === type && styles.optionTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Gender Preference</Text>
            <View style={styles.optionsContainer}>
              {genderOptions.map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.optionButton,
                    genderPreference === gender && styles.optionButtonActive,
                  ]}
                  onPress={() => setGenderPreference(gender)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      genderPreference === gender && styles.optionTextActive,
                    ]}
                  >
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {amenityOptions.map((amenity) => (
                <TouchableOpacity
                  key={amenity}
                  style={[
                    styles.amenityChip,
                    amenities.includes(amenity) && styles.amenityChipActive,
                  ]}
                  onPress={() => toggleAmenity(amenity)}
                >
                  <Text
                    style={[
                      styles.amenityText,
                      amenities.includes(amenity) && styles.amenityTextActive,
                    ]}
                  >
                    {amenity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Contact Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Post Listing</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFFFFF',
  },
  optionButtonActive: {
    backgroundColor: '#00B4D8',
    borderColor: '#00B4D8',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFFFFF',
  },
  amenityChipActive: {
    backgroundColor: '#00B4D8',
    borderColor: '#00B4D8',
  },
  amenityText: {
    fontSize: 13,
    color: '#666',
  },
  amenityTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#00B4D8',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});