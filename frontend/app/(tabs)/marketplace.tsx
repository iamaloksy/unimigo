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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/config/api';
import { MarketplaceItem } from '../../src/types';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'books', label: 'Books' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'sports', label: 'Sports' },
  { value: 'other', label: 'Other' },
];

const CONDITIONS = [
  { value: 'new', label: 'New', icon: '✨' },
  { value: 'like-new', label: 'Like New', icon: '⭐' },
  { value: 'good', label: 'Good', icon: '👍' },
  { value: 'fair', label: 'Fair', icon: '👌' },
];

export default function MarketplaceScreen() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const loadItems = async () => {
    try {
      let queryParams = '?limit=50';
      if (minPrice) queryParams += `&minPrice=${minPrice}`;
      if (maxPrice) queryParams += `&maxPrice=${maxPrice}`;
      if (selectedCategory !== 'all') queryParams += `&category=${selectedCategory}`;
      
      const response = await api.get(`/marketplace/items${queryParams}`);
      setItems(response.data.items);
    } catch (error) {
      console.error('Error loading marketplace items:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  const applyFilters = () => {
    setIsLoading(true);
    loadItems();
  };

  const getConditionDisplay = (condition: string) => {
    const conditionObj = CONDITIONS.find(c => c.value === condition);
    return conditionObj ? `${conditionObj.icon} ${conditionObj.label}` : condition;
  };

  const renderItem = ({ item }: { item: MarketplaceItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemSeller}>
            by {item.sellerId.name} • Trust: {item.sellerId.trustScore}
          </Text>
        </View>
        {item.available ? (
          <View style={styles.availableBadge}>
            <Text style={styles.availableText}>Available</Text>
          </View>
        ) : (
          <View style={styles.soldBadge}>
            <Text style={styles.soldText}>Sold</Text>
          </View>
        )}
      </View>

      <Text style={styles.itemDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.priceRow}>
        <Ionicons name="pricetag" size={20} color="#00B4D8" />
        <Text style={styles.priceText}>₹{item.price.toLocaleString()}</Text>
      </View>

      <View style={styles.itemMeta}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.category}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{getConditionDisplay(item.condition)}</Text>
        </View>
      </View>

      {item.contactInfo && (
        <View style={styles.contactSection}>
          {item.contactInfo.phone && (
            <View style={styles.contactRow}>
              <Ionicons name="call" size={14} color="#00B4D8" />
              <Text style={styles.contactText}>{item.contactInfo.phone}</Text>
            </View>
          )}
          {item.contactInfo.email && (
            <View style={styles.contactRow}>
              <Ionicons name="mail" size={14} color="#00B4D8" />
              <Text style={styles.contactText}>{item.contactInfo.email}</Text>
            </View>
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
        <Text style={styles.headerTitle}>Buy & Sell</Text>
        <Text style={styles.headerSubtitle}>Campus Marketplace</Text>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryButton,
                selectedCategory === cat.value && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(cat.value)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat.value && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.priceFilterRow}>
          <TextInput
            style={styles.filterInput}
            placeholder="Min ₹"
            value={minPrice}
            onChangeText={setMinPrice}
            keyboardType="numeric"
          />
          <Text style={styles.toText}>to</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="Max ₹"
            value={maxPrice}
            onChangeText={setMaxPrice}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.filterButton} onPress={applyFilters}>
            <Ionicons name="filter" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No items available</Text>
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
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#00B4D8',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  priceFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  filterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#F8F8F8',
  },
  toText: {
    color: '#666',
    fontSize: 14,
  },
  filterButton: {
    backgroundColor: '#00B4D8',
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemSeller: {
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
  soldBadge: {
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  soldText: {
    color: '#E74C3C',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00B4D8',
    marginLeft: 8,
  },
  itemMeta: {
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
    gap: 6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 13,
    color: '#00B4D8',
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
