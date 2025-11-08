import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import api from '../../src/config/api';
import { RoommatePost } from '../../src/types';

export default function HomeScreen() {
  const router = useRouter();
  const { user, university } = useAuthStore();
  const [posts, setPosts] = useState<RoommatePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = async () => {
    try {
      const response = await api.get('/roommate/posts?limit=10');
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B4D8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <View style={styles.universityBadge}>
          <Text style={styles.universityName}>{university?.name}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="ribbon" size={32} color="#00B4D8" />
            <Text style={styles.statValue}>{user?.trustScore}</Text>
            <Text style={styles.statLabel}>Trust Score</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="home" size={32} color="#FF7A00" />
            <Text style={styles.statValue}>{posts.length}</Text>
            <Text style={styles.statLabel}>Listings</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/roommate')}
          >
            <Ionicons name="search" size={24} color="#00B4D8" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Find Roommate</Text>
              <Text style={styles.actionSubtitle}>
                Browse listings and find your perfect match
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/post')}
          >
            <Ionicons name="add-circle" size={24} color="#FF7A00" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Post Listing</Text>
              <Text style={styles.actionSubtitle}>
                Share your room or search for roommates
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Listings</Text>
          {posts.slice(0, 3).map((post) => (
            <View key={post._id} style={styles.postCard}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postRent}>₹{post.rent}/month</Text>
              <Text style={styles.postLocation}>{post.location.address}</Text>
              <View style={styles.postMeta}>
                <Text style={styles.postType}>{post.sharingType}</Text>
                <Text style={styles.postGender}>{post.genderPreference}</Text>
              </View>
            </View>
          ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  universityBadge: {
    backgroundColor: '#00B4D8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  universityName: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  postRent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00B4D8',
    marginBottom: 4,
  },
  postLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  postMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  postType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  postGender: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});