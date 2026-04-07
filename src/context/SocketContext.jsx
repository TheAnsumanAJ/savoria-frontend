import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { showToast } from '../components/ui/ToastContainer';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Only connect if user is authenticated
    if (user) {
      const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
      const newSocket = io(SOCKET_URL, {
        query: { userId: user.id, email: user.email, role: user.role }
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('🔌 Connected to Savoria Real-time Server');
        // Join private room
        newSocket.emit('join', user.email);
        if (user.role === 'manager') {
          newSocket.emit('join', 'managers');
        }
      });

      newSocket.on('order-status-update', (data) => {
        showToast(`Order status updated: ${data.status}! ✨`);
        // We could trigger a data refresh here if we had a global refresh function
        // For now, the toast notification is the primary goal.
      });

      newSocket.on('new-order-alert', (data) => {
        if (user.role === 'manager') {
          showToast(`🔔 New Order received: #${data.orderId.slice(-6)}`, 'info');
        }
      });

      return () => newSocket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
