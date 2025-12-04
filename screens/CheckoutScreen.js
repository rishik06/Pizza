import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { colors } from '../constants/colors';
import { API_ENDPOINTS } from '../config/api';

export default function CheckoutScreen({ navigation }) {
  const [deliveryType, setDeliveryType] = useState('Delivery');
  const [timeOption, setTimeOption] = useState('ASAP');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [processing, setProcessing] = useState(false);
  const { getCartTotal, cartId, userId } = useCart();
  const { subtotal, tax, deliveryFee, total } = getCartTotal();

  const locations = [
    'Downtown Location',
    'Uptown Location',
    'Riverside Location',
  ];

  const handleContinueToPayment = async () => {
    if (!cartId) {
      Alert.alert('Error', 'Cart not found. Please go back and try again.');
      return;
    }

    if (deliveryType === 'Pickup' && !selectedLocation) {
      Alert.alert('Error', 'Please select a pickup location.');
      return;
    }

    try {
      setProcessing(true);
      
      const address = {
        type: deliveryType,
        deliveryAddress: deliveryType === 'Delivery' 
          ? '123 Main Street, Apt 4B, New York, NY 10001'
          : null,
        pickupLocation: deliveryType === 'Pickup' ? selectedLocation : null,
        timeOption,
      };

      const response = await fetch(API_ENDPOINTS.CHECKOUT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: cartId,
          address,
          userId,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        navigation.navigate('Payment');
      } else {
        Alert.alert('Error', result.error || 'Failed to process checkout. Please try again.');
      }
    } catch (error) {
      console.error('Error processing checkout:', error);
      Alert.alert('Error', 'Failed to process checkout. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                deliveryType === 'Delivery' && styles.toggleButtonActive,
              ]}
              onPress={() => setDeliveryType('Delivery')}
            >
              <Text
                style={[
                  styles.toggleText,
                  deliveryType === 'Delivery' && styles.toggleTextActive,
                ]}
              >
                Delivery
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                deliveryType === 'Pickup' && styles.toggleButtonActive,
              ]}
              onPress={() => setDeliveryType('Pickup')}
            >
              <Text
                style={[
                  styles.toggleText,
                  deliveryType === 'Pickup' && styles.toggleTextActive,
                ]}
              >
                Pickup
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {deliveryType === 'Delivery' ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📍</Text>
              <Text style={styles.cardTitle}>Delivery Address</Text>
            </View>
            <View style={styles.addressContainer}>
              <Text style={styles.addressLine}>123 Main Street</Text>
              <Text style={styles.addressLine}>Apt 4B, New York, NY 10001</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📍</Text>
              <Text style={styles.cardTitle}>Pickup Location</Text>
            </View>
            {locations.map((location) => (
              <TouchableOpacity
                key={location}
                style={styles.radioContainer}
                onPress={() => setSelectedLocation(location)}
              >
                <View style={styles.radio}>
                  {selectedLocation === location && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.radioText}>{location}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🕐</Text>
            <Text style={styles.cardTitle}>When do you want it?</Text>
          </View>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                timeOption === 'ASAP' && styles.toggleButtonActive,
              ]}
              onPress={() => setTimeOption('ASAP')}
            >
              <Text
                style={[
                  styles.toggleText,
                  timeOption === 'ASAP' && styles.toggleTextActive,
                ]}
              >
                ASAP
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                timeOption === 'Schedule' && styles.toggleButtonActive,
              ]}
              onPress={() => setTimeOption('Schedule')}
            >
              <Text
                style={[
                  styles.toggleText,
                  timeOption === 'Schedule' && styles.toggleTextActive,
                ]}
              >
                Schedule
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, processing && styles.continueButtonDisabled]}
          onPress={handleContinueToPayment}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.continueButtonText}>Continue to Payment</Text>
              <Text style={styles.continueButtonIcon}>→</Text>
            </>
          )}
        </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  toggleTextActive: {
    color: colors.white,
  },
  addressContainer: {
    marginBottom: 12,
  },
  addressLine: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 4,
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  radioText: {
    fontSize: 16,
    color: colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 16,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: 16,
    color: colors.text,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  continueButtonIcon: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
});

