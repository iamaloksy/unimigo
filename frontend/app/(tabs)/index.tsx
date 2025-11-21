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
          <Text style={styles.sectionTitle}>Features</Text>

          <View style={styles.roommateCards}>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/roommate')}>
              <Ionicons name="search" size={28} color="#00B4D8" />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>🔍 Find Roommate</Text>
                <Text style={styles.actionSubtitle}>Browse roommate listings</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#CCC" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionCard, styles.postCard]} onPress={() => router.push('/post-roommate')}>
              <Ionicons name="add-circle" size={28} color="#00B4D8" />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>📝 Post Listing</Text>
                <Text style={styles.actionSubtitle}>Add new roommate listing</Text>
              </View>
              <Ionicons name="add" size={24} color="#00B4D8" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.actionCard}onPress={() => router.push('/marketplace')}>
            <Ionicons name="cart" size={28} color="#FF7A00" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Buy & Sell</Text>
              <Text style={styles.actionSubtitle}>Campus marketplace for books, cycles & more</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="school" size={28} color="#9333EA" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Study Partner</Text>
              <Text style={styles.actionSubtitle}>Find AI-matched study partners for your courses</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="megaphone" size={28} color="#10B981" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>University Wall</Text>
              <Text style={styles.actionSubtitle}>Campus feed with posts and announcements</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="chatbubbles" size={28} color="#3B82F6" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Messages</Text>
              <Text style={styles.actionSubtitle}>Chat with verified students from your university</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/profile')}>
            <Ionicons name="person" size={28} color="#8B5CF6" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>My Profile</Text>
              <Text style={styles.actionSubtitle}>Update your profile and preferences</Text>
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

        {/* Quick Stats */}
        <View style={styles.quickStatsSection}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.quickStatsGrid}>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>0</Text>
              <Text style={styles.quickStatLabel}>Active Posts</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>0</Text>
              <Text style={styles.quickStatLabel}>Connections</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>0</Text>
              <Text style={styles.quickStatLabel}>Messages</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>0</Text>
              <Text style={styles.quickStatLabel}>Matches</Text>
            </View>
          </View>
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
  roommateCards: {
    marginBottom: 12,
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
  quickStatsSection: {
    padding: 16,
    paddingBottom: 32,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00B4D8',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
