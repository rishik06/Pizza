import React, { createContext, useState, useContext } from 'react';
import { API_ENDPOINTS } from '../config/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Generate a simple user ID (in a real app, this would come from authentication)
const getUserId = () => {
  // Try to get from storage or generate a new one
  if (typeof window !== 'undefined' && window.localStorage) {
    let userId = window.localStorage.getItem('userId');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      window.localStorage.setItem('userId', userId);
    }
    return userId;
  }
  // Fallback for React Native - generate and store in memory
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [userId] = useState(() => getUserId());

  const getCartTotalFromItems = (items) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.08;
    const deliveryFee = 3.99;
    const total = subtotal + tax + deliveryFee;
    return { subtotal, tax, deliveryFee, total };
  };

  const syncCartToBackend = async (items, total) => {
    try {
      const response = await fetch(API_ENDPOINTS.CART, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          items,
          total,
          cartId,
        }),
      });

      const result = await response.json();
      if (result.orderId) {
        setCartId(result.orderId);
      }
      return result;
    } catch (error) {
      console.error('Error syncing cart to backend:', error);
      // Don't throw - allow local cart to continue working
      return null;
    }
  };

  const addToCart = async (item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      let newItems;
      if (existingItem) {
        newItems = prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newItems = [...prevItems, { ...item, quantity: 1 }];
      }
      
      // Sync to backend asynchronously
      const newTotal = getCartTotalFromItems(newItems).total;
      syncCartToBackend(newItems, newTotal);
      
      return newItems;
    });
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prevItems) => {
      const newItems = prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      
      // Sync to backend asynchronously
      const newTotal = getCartTotalFromItems(newItems).total;
      syncCartToBackend(newItems, newTotal);
      
      return newItems;
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.id !== id);
      
      // Sync to backend asynchronously
      const newTotal = getCartTotalFromItems(newItems).total;
      syncCartToBackend(newItems, newTotal);
      
      return newItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setCartId(null);
  };

  const getCartTotal = () => {
    return getCartTotalFromItems(cartItems);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const saveCartToBackend = async () => {
    const { total } = getCartTotal();
    return await syncCartToBackend(cartItems, total);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartId,
        userId,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartItemCount,
        saveCartToBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

