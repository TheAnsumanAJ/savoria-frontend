import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserReservations, getUserOrders } from '../services/api';
import { useAuth } from './AuthContext';

const BookingContext = createContext();

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUserData = async () => {
    if (!user) {
      setReservations([]);
      setOrders([]);
      return;
    }
    
    setLoading(true);
    try {
      const [resData, orderData] = await Promise.all([
        getUserReservations(user.email),
        getUserOrders(user.email)
      ]);
      setReservations(resData.data);
      setOrders(orderData.data);
    } catch (err) {
      console.error("Failed to fetch user data", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch immediately when user changes
  useEffect(() => {
    fetchUserData();
  }, [user]);

  return (
    <BookingContext.Provider value={{ reservations, orders, loading, refreshData: fetchUserData }}>
      {children}
    </BookingContext.Provider>
  );
};
