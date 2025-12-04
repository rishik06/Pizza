import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { pizzas, categories } from '../data/pizzas';
import { colors } from '../constants/colors';

export default function MenuScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToCart } = useCart();

  const filteredPizzas = pizzas.filter((pizza) => {
    const matchesSearch =
      pizza.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pizza.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || pizza.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>The Pizzeria Menu</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search pizzas..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.pizzaList} showsVerticalScrollIndicator={false}>
        {filteredPizzas.map((pizza) => (
          <View key={pizza.id} style={styles.pizzaCard}>
            <Image source={{ uri: pizza.image }} style={styles.pizzaImage} />
            <View style={styles.pizzaInfo}>
              <Text style={styles.pizzaName}>{pizza.name}</Text>
              <Text style={styles.pizzaDescription}>{pizza.description}</Text>
              <Text style={styles.pizzaPrice}>${pizza.price.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addToCart(pizza)}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  categoryContainer: {
    maxHeight: 50,
    marginBottom: 8,
  },
  categoryContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: colors.white,
  },
  pizzaList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  pizzaCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pizzaImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  pizzaInfo: {
    flex: 1,
  },
  pizzaName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  pizzaDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  pizzaPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
});

