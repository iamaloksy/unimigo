import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../src/config/api';

interface University {
  _id: string;
  name: string;
  domain: string;
  logoUrl?: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [loadingUniversities, setLoadingUniversities] = useState(true);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      console.log('Fetching universities...');
      const response = await api.get('/universities/list');
      console.log('Universities loaded:', response.data.length);
      setUniversities(response.data);
    } catch (error: any) {
      console.error('Fetch universities error:', error);
      Alert.alert(
        'Connection Error', 
        'Cannot connect to server. Please check if backend is running.',
        [
          { text: 'Retry', onPress: fetchUniversities },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoadingUniversities(false);
    }
  };

  const handleSendOTP = async () => {
    if (!selectedUniversity) {
      Alert.alert('Error', 'Please select your university first');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!email.endsWith(`@${selectedUniversity.domain}`)) {
      Alert.alert('Error', `Please use your ${selectedUniversity.name} email (@${selectedUniversity.domain})`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/request-otp', { email });
      
      if (response.data.needsOnboarding) {
        Alert.alert(
          'University Not Found',
          'Your university is not yet onboarded. Please contact admin.',
        );
      } else {
        Alert.alert('Success', 'Please check your email for OTP');
        router.push({
          pathname: '/auth/verify',
          params: { email },
        });
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to send OTP. Please try again.'
      );
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
        <View style={styles.content}>
          <Text style={styles.logo}>UNIMIGO</Text>
          <Text style={styles.tagline}>Your Campus, Your Circle</Text>
          
          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>
              Select your university and login
            </Text>

            {loadingUniversities ? (
              <View style={{ marginVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#00B4D8" />
                <Text style={{ marginTop: 12, color: '#666' }}>Loading universities...</Text>
              </View>
            ) : universities.length === 0 ? (
              <View style={{ marginVertical: 40, alignItems: 'center' }}>
                <Text style={{ color: '#999', marginBottom: 16 }}>No universities found</Text>
                <TouchableOpacity onPress={fetchUniversities} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.label}>Select Your University</Text>
                <ScrollView style={styles.universityList} nestedScrollEnabled>
                  {universities.map((uni) => (
                    <TouchableOpacity
                      key={uni._id}
                      style={[
                        styles.universityCard,
                        selectedUniversity?._id === uni._id && styles.universityCardSelected,
                      ]}
                      onPress={() => setSelectedUniversity(uni)}
                    >
                      <View style={styles.universityCardContent}>
                        {uni.logoUrl ? (
                          <Image 
                            source={{ uri: uni.logoUrl }} 
                            style={styles.universityLogo}
                            resizeMode="contain"
                          />
                        ) : (
                          <View style={styles.universityLogoPlaceholder}>
                            <Text style={styles.universityLogoText}>
                              {uni.name.charAt(0)}
                            </Text>
                          </View>
                        )}
                        <View style={styles.universityInfo}>
                          <Text style={[
                            styles.universityName,
                            selectedUniversity?._id === uni._id && styles.universityNameSelected,
                          ]}>
                            {uni.name}
                          </Text>
                          <Text style={styles.universityDomain}>@{uni.domain}</Text>
                        </View>
                      </View>
                      {selectedUniversity?._id === uni._id && (
                        <View style={styles.checkmark}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {selectedUniversity && (
                  <>
                    <Text style={styles.label}>University Email</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={`your.name@${selectedUniversity.domain}`}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                  </>
                )}
              </>
            )}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.note}>
              Only verified university emails are allowed
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00B4D8',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#F8F8F8',
  },
  button: {
    backgroundColor: '#00B4D8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  universityList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  universityCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  universityCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  universityLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  universityLogoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#00B4D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  universityLogoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  universityInfo: {
    flex: 1,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00B4D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  universityCardSelected: {
    borderColor: '#00B4D8',
    backgroundColor: '#E6F7FB',
  },
  universityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  universityNameSelected: {
    color: '#00B4D8',
  },
  universityDomain: {
    fontSize: 14,
    color: '#666',
  },
  retryButton: {
    backgroundColor: '#00B4D8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});