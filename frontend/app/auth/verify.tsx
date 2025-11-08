import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import api from '../../src/config/api';
import { useAuthStore } from '../../src/store/authStore';

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const handleVerify = async () => {
    if (!password || password.length < 6) {
      Alert.alert('Error', 'Please enter a password (min 6 characters)');
      return;
    }

    setIsLoading(true);
    try {
      const auth = getAuth();
      let firebaseUser;
      
      try {
        // Try to sign in first
        firebaseUser = await signInWithEmailAndPassword(auth, email, password);
      } catch (signInError: any) {
        if (signInError.code === 'auth/user-not-found') {
          // Create new user
          firebaseUser = await createUserWithEmailAndPassword(auth, email, password);
        } else {
          throw signInError;
        }
      }

      // Get Firebase ID token
      const token = await firebaseUser.user.getIdToken();

      // Verify with backend
      const response = await api.post('/auth/verify-otp', {
        email,
        firebaseToken: token,
        name: email.split('@')[0],
      });

      // Save user data
      await setUser(
        response.data.user,
        response.data.token,
        response.data.university
      );

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.error || error.message || 'Verification failed'
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
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>Enter password for {email}</Text>

          <TextInput
            style={styles.input}
            placeholder="Password (min 6 characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Change Email</Text>
          </TouchableOpacity>
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
  backButton: {
    padding: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#00B4D8',
    fontSize: 16,
  },
});