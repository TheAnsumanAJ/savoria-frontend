import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [onlineCart, setOnlineCart] = useState(() => {
    const saved = localStorage.getItem('savoria_online_cart');
    // Fallback to old localstorage key if present so users don't lose existing carts
    if (!saved) {
      const oldSaved = localStorage.getItem('savoria_cart');
      return oldSaved ? JSON.parse(oldSaved) : [];
    }
    return saved ? JSON.parse(saved) : [];
  });

  const [dineInCart, setDineInCart] = useState(() => {
    const saved = localStorage.getItem('savoria_dinein_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orderMode, setOrderMode] = useState('online');
  const [activeTable, setActiveTable] = useState(null);

  useEffect(() => {
    localStorage.setItem('savoria_online_cart', JSON.stringify(onlineCart));
  }, [onlineCart]);

  useEffect(() => {
    localStorage.setItem('savoria_dinein_cart', JSON.stringify(dineInCart));
  }, [dineInCart]);

  const activeCart = orderMode === 'dine-in' ? dineInCart : onlineCart;
  const setActiveCart = orderMode === 'dine-in' ? setDineInCart : setOnlineCart;

  const addToCart = (menuItem) => {
    setActiveCart(prev => {
      const existing = prev.find(item => item.menuItemId === menuItem._id);
      if (existing) {
        return prev.map(item => 
          item.menuItemId === menuItem._id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { 
        menuItemId: menuItem._id, 
        name: menuItem.name, 
        price: menuItem.price, 
        emoji: menuItem.emoji,
        quantity: 1 
      }];
    });
  };

  const removeFromCart = (itemId) => {
    setActiveCart(prev => prev.filter(item => item.menuItemId !== itemId));
  };

  const updateQuantity = (itemId, delta) => {
    setActiveCart(prev => prev.map(item => {
      if (item.menuItemId === itemId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const clearCart = () => setActiveCart([]);

  const totalItems = activeCart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = activeCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart: activeCart, orderMode, setOrderMode, activeTable, setActiveTable, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};
