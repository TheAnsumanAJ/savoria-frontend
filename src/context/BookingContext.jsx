import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserReservations, getUserOrders } from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const BookingContext = createContext();

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const { user } = useAuth();
  const socket = useSocket();
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

  // Real-time refresh when socket event received
  useEffect(() => {
    if (socket) {
      socket.on('order-status-update', () => {
        fetchUserData(); // Refresh data on status change
      });

      return () => socket.off('order-status-update');
    }
  }, [socket]);

  return (
    <BookingContext.Provider value={{ reservations, orders, loading, refreshData: fetchUserData }}>
      {children}
    </BookingContext.Provider>
  );
};
