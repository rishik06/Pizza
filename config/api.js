import { Platform } from 'react-native';

// API Configuration
// For iOS Simulator: use localhost
// For Android Emulator: use 10.0.2.2
// For physical devices: use your computer's IP address (e.g., http://192.168.1.XXX:3000)
const API_BASE_URL = Platform.select({
  ios: 'http://localhost:3000',
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000',
});

export const API_ENDPOINTS = {
  PIZZAS: `${API_BASE_URL}/api/pizzas`,
  CART: `${API_BASE_URL}/api/cart`,
  CHECKOUT: `${API_BASE_URL}/api/checkout`,
  PAYMENT: `${API_BASE_URL}/api/payment`,
};

