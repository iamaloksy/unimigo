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

type PostType = 'roommate' | 'marketplace';
type SharingType = '1BHK' | '2BHK' | '3BHK' | 'shared' | 'single';
type GenderPreference = 'male' | 'female' | 'any';
type MarketplaceCategory = 'electronics' | 'books' | 'furniture' | 'clothing' | 'sports' | 'other';
type Condition = 'new' | 'like-new' | 'good' | 'fair';

export default function PostScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [postType, setPostType] = useState<PostType>('roommate');
  
  // Roommate fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rent, setRent] = useState('');
  const [address, setAddress] = useState('');
  const [sharingType, setSharingType] = useState<SharingType>('2BHK');
  const [genderPreference, setGenderPreference] = useState<GenderPreference>('any');
  const [phone, setPhone] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);

  // Marketplace fields
  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<MarketplaceCategory>('electronics');
  const [condition, setCondition] = useState<Condition>('good');
  const [itemPhone, setItemPhone] = useState('');
  const [itemEmail, setItemEmail] = useState('');

  const sharingTypes: SharingType[] = ['1BHK', '2BHK', '3BHK', 'shared', 'single'];
  const genderOptions: GenderPreference[] = ['male', 'female', 'any'];
  const amenityOptions = ['WiFi', 'AC', 'Washing Machine', 'Furnished', 'Parking', 'Security', 'Power Backup'];
  const categories: MarketplaceCategory[] = ['electronics', 'books', 'furniture', 'clothing', 'sports', 'other'];
  const conditions: Condition[] = ['new', 'like-new', 'good', 'fair'];

  const toggleAmenity = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((a) => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleSubmit = async () => {
    if (postType === 'roommate') {
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
        Alert.alert('Success', 'Your roommate listing has been posted!', [
          { text: 'OK', onPress: () => router.push('/(tabs)/roommate') },
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
    } else {
      // Marketplace submission
      if (!itemTitle || !itemDescription || !price) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }

      setIsLoading(true);
      try {
        const itemData = {
          title: itemTitle,
          description: itemDescription,
          price: parseFloat(price),
          category,
          condition,
          contactInfo: {
            phone: itemPhone,
            email: itemEmail,
          },
          images: [],
        };

        await api.post('/marketplace/items', itemData);
        Alert.alert('Success', 'Your item has been listed!', [
          { text: 'OK', onPress: () => router.push('/(tabs)/marketplace') },
        ]);
        
        // Reset form
        setItemTitle('');
        setItemDescription('');
        setPrice('');
        setItemPhone('');
        setItemEmail('');
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.error || 'Failed to create listing');
      } finally {
        setIsLoading(false);
      }
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
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, postType === 'roommate' && styles.tabActive]}
              onPress={() => setPostType('roommate')}
            >
              <Ionicons 
                name="home" 
                size={18} 
                color={postType === 'roommate' ? '#00B4D8' : '#666'} 
              />
              <Text style={[styles.tabText, postType === 'roommate' && styles.tabTextActive]}>
                Roommate
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, postType === 'marketplace' && styles.tabActive]}
              onPress={() => setPostType('marketplace')}
            >
              <Ionicons 
                name="cart" 
                size={18} 
                color={postType === 'marketplace' ? '#00B4D8' : '#666'} 
              />
              <Text style={[styles.tabText, postType === 'marketplace' && styles.tabTextActive]}>
                Sell Item
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content}>
          {postType === 'roommate' ? renderRoommateForm() : renderMarketplaceForm()}

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
                <Text style={styles.submitButtonText}>
                  {postType === 'roommate' ? 'Post Listing' : 'List Item'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  function renderRoommateForm() {
    return (
      <>
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
      </>
    );
  }

  function renderMarketplaceForm() {
    return (
      <>
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., iPhone 13 Pro Max"
            value={itemTitle}
            onChangeText={setItemTitle}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your item, condition, and any details..."
            value={itemDescription}
            onChangeText={setItemDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Price (₹) *</Text>
          <TextInput
            style={styles.input}
            placeholder="15000"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.optionsContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.optionButton,
                  category === cat && styles.optionButtonActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.optionText,
                    category === cat && styles.optionTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Condition</Text>
          <View style={styles.optionsContainer}>
            {conditions.map((cond) => (
              <TouchableOpacity
                key={cond}
                style={[
                  styles.optionButton,
                  condition === cond && styles.optionButtonActive,
                ]}
                onPress={() => setCondition(cond)}
              >
                <Text
                  style={[
                    styles.optionText,
                    condition === cond && styles.optionTextActive,
                  ]}
                >
                  {cond}
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
            value={itemPhone}
            onChangeText={setItemPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Contact Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Your email"
            value={itemEmail}
            onChangeText={setItemEmail}
            keyboardType="email-address"
          />
        </View>
      </>
    );
  }
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
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#E6F7FB',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#00B4D8',
    fontWeight: 'bold',
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