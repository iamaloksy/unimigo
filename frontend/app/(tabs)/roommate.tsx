import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/config/api';
import { RoommatePost } from '../../src/types';

export default function RoommateScreen() {
  const [posts, setPosts] = useState<RoommatePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');

  const loadPosts = async () => {
    try {
      let queryParams = '?limit=50';
      if (minRent) queryParams += `&minRent=${minRent}`;
      if (maxRent) queryParams += `&maxRent=${maxRent}`;
      
      const response = await api.get(`/roommate/posts${queryParams}`);
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

  const applyFilters = () => {
    setIsLoading(true);
    loadPosts();
  };

  const renderPost = ({ item }: { item: RoommatePost }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View>
          <Text style={styles.postTitle}>{item.title}</Text>
          <Text style={styles.postAuthor}>
            by {item.authorId.name} • Trust: {item.authorId.trustScore}
          </Text>
        </View>
        {item.available ? (
          <View style={styles.availableBadge}>
            <Text style={styles.availableText}>Available</Text>
          </View>
        ) : (
          <View style={styles.fullBadge}>
            <Text style={styles.fullText}>Full</Text>
          </View>
        )}
      </View>

      <Text style={styles.postDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.postDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.detailText}>{item.location.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash" size={16} color="#00B4D8" />
          <Text style={styles.rentText}>₹{item.rent}/month</Text>
        </View>
      </View>

      <View style={styles.postMeta}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.sharingType}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.genderPreference}</Text>
        </View>
        {item.amenities.slice(0, 2).map((amenity, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{amenity}</Text>
          </View>
        ))}
      </View>

      {item.contactInfo && (
        <View style={styles.contactSection}>
          {item.contactInfo.phone && (
            <Text style={styles.contactText}>Phone: {item.contactInfo.phone}</Text>
          )}
          {item.contactInfo.email && (
            <Text style={styles.contactText}>Email: {item.contactInfo.email}</Text>
          )}
        </View>
      )}
    </View>
  );

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
        <Text style={styles.headerTitle}>Find Roommates</Text>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <TextInput
            style={styles.filterInput}
            placeholder="Min Rent"
            value={minRent}
            onChangeText={setMinRent}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.filterInput}
            placeholder="Max Rent"
            value={maxRent}
            onChangeText={setMaxRent}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.filterButton} onPress={applyFilters}>
            <Ionicons name="filter" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="home-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No listings available</Text>
          </View>
        }
      />
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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#F8F8F8',
  },
  filterButton: {
    backgroundColor: '#00B4D8',
    width: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  postAuthor: {
    fontSize: 12,
    color: '#666',
  },
  availableBadge: {
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableText: {
    color: '#00B894',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fullBadge: {
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fullText: {
    color: '#E74C3C',
    fontSize: 12,
    fontWeight: 'bold',
  },
  postDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  postDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  rentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00B4D8',
    marginLeft: 8,
  },
  postMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  contactSection: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  contactText: {
    fontSize: 13,
    color: '#00B4D8',
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});