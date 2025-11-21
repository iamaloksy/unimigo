import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/config/api';
import { useAuthStore } from '../../src/store/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const otp = params.otp as string;
  const setUser = useAuthStore((state) => state.setUser);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    universityId: '',
    department: '',
    year: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!profile.firstName || !profile.lastName) {
      Alert.alert('Error', 'Please enter your first and last name');
      return;
    }
    if (!profile.universityId) {
      Alert.alert('Error', 'Please enter your university ID');
      return;
    }
    if (!profile.department) {
      Alert.alert('Error', 'Please enter your department');
      return;
    }
    if (!profile.year) {
      Alert.alert('Error', 'Please select your year');
      return;
    }
    if (!profile.phone || profile.phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        email,
        otp,
        name: `${profile.firstName} ${profile.lastName}`,
        department: profile.department,
        year: parseInt(profile.year),
        phone: profile.phone,
        universityId: profile.universityId,
      });

      await setUser(response.data.user, response.data.token, response.data.university);
      
      Alert.alert('Success', 'Registration successful!');
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Your Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.subtitle}>Let's get to know you better!</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={profile.firstName}
                onChangeText={(text) => setProfile({ ...profile, firstName: text })}
                placeholder="John"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                value={profile.lastName}
                onChangeText={(text) => setProfile({ ...profile, lastName: text })}
                placeholder="Doe"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>University ID *</Text>
            <TextInput
              style={styles.input}
              value={profile.universityId}
              onChangeText={(text) => setProfile({ ...profile, universityId: text })}
              placeholder="e.g. 12345678"
              keyboardType="default"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Department *</Text>
            <TextInput
              style={styles.input}
              value={profile.department}
              onChangeText={(text) => setProfile({ ...profile, department: text })}
              placeholder="e.g. Computer Science"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Year *</Text>
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
            <Text style={styles.label}>Mobile Number *</Text>
            <TextInput
              style={styles.input}
              value={profile.phone}
              onChangeText={(text) => setProfile({ ...profile, phone: text })}
              placeholder="+91 1234567890"
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>College Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              editable={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.registerButtonText}>Complete Registration</Text>
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
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 20,
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
  inputDisabled: {
    backgroundColor: '#F0F0F0',
    color: '#999',
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
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00B4D8',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
