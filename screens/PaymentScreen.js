import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { colors } from '../constants/colors';
import { API_ENDPOINTS } from '../config/api';

export default function PaymentScreen({ navigation }) {
  const [paymentMethod, setPaymentMethod] = useState('newCard');
  const [promoCode, setPromoCode] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [processing, setProcessing] = useState(false);
  const { getCartTotal, clearCart, cartId, userId } = useCart();
  const { total } = getCartTotal();

  const handlePlaceOrder = async () => {
    if (!cartId) {
      Alert.alert('Error', 'Order not found. Please go back and try again.');
      return;
    }

    if (paymentMethod === 'newCard') {
      if (!cardNumber || !expiry || !cvv || !nameOnCard) {
        Alert.alert('Error', 'Please fill in all card details.');
        return;
      }
    }

    try {
      setProcessing(true);

      const paymentDetails = {
        method: paymentMethod,
        cardNumber: paymentMethod === 'newCard' ? cardNumber : null,
        expiry: paymentMethod === 'newCard' ? expiry : null,
        cvv: paymentMethod === 'newCard' ? cvv : null,
        nameOnCard: paymentMethod === 'newCard' ? nameOnCard : null,
        promoCode: promoCode || null,
      };

      const response = await fetch(API_ENDPOINTS.PAYMENT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: cartId,
          paymentDetails,
          userId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        clearCart();
        Alert.alert(
          'Success!',
          `Order placed successfully!\nOrder ID: ${result.orderId}\nPayment Reference: ${result.paymentReference}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to Menu tab by resetting navigation
                navigation.getParent()?.getParent()?.navigate('Menu');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to process payment. Please try again.');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.radioContainer}
            onPress={() => setPaymentMethod('savedCard')}
          >
            <View style={styles.radio}>
              {paymentMethod === 'savedCard' && (
                <View style={styles.radioInner} />
              )}
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentLabel}>Visa</Text>
              <Text style={styles.paymentDetails}>**** **** **** 4242</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.radioContainer}
            onPress={() => setPaymentMethod('newCard')}
          >
            <View style={styles.radio}>
              {paymentMethod === 'newCard' && (
                <View style={styles.radioInner} />
              )}
            </View>
            <Text style={styles.paymentLabel}>New Credit/Debit Card</Text>
          </TouchableOpacity>

          {paymentMethod === 'newCard' && (
            <View style={styles.cardForm}>
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                placeholderTextColor={colors.textLight}
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
              />
              <View style={styles.rowInputs}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="MM/YY"
                  placeholderTextColor={colors.textLight}
                  value={expiry}
                  onChangeText={setExpiry}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="CVV"
                  placeholderTextColor={colors.textLight}
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  secureTextEntry
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Name on Card"
                placeholderTextColor={colors.textLight}
                value={nameOnCard}
                onChangeText={setNameOnCard}
              />
            </View>
          )}
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.radioContainer}
            onPress={() => setPaymentMethod('digital')}
          >
            <View style={styles.radio}>
              {paymentMethod === 'digital' && (
                <View style={styles.radioInner} />
              )}
            </View>
            <Text style={styles.paymentLabel}>Digital Wallets</Text>
          </TouchableOpacity>

          {paymentMethod === 'digital' && (
            <View style={styles.digitalWallets}>
              <TouchableOpacity style={styles.walletButton}>
                <Text style={styles.walletButtonText}>Google Pay</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.walletButton}>
                <Text style={styles.walletButtonText}>Apple Pay</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.walletButton}>
                <Text style={styles.walletButtonText}>PayPal</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Promo Code</Text>
          <View style={styles.promoContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter code"
              placeholderTextColor={colors.textLight}
              value={promoCode}
              onChangeText={setPromoCode}
            />
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.orderTotal}>
          <Text style={styles.orderTotalLabel}>Total Amount Due</Text>
          <Text style={styles.orderTotalValue}>${total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderButton, processing && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.placeOrderIcon}>✓</Text>
              <Text style={styles.placeOrderText}>Place Order & Pay</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.securityNote}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>Secure Payment</Text>
        </View>
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
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  paymentDetails: {
    fontSize: 14,
    color: colors.textLight,
  },
  cardForm: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  digitalWallets: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  walletButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  walletButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  promoContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  promoInput: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  applyButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  orderTotal: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  orderTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  placeOrderButton: {
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
  placeOrderIcon: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  placeOrderText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  securityText: {
    fontSize: 14,
    color: colors.textLight,
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
});

