import axios from 'axios';

// Create axios instance attached to backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Interceptor to attach JWT token to every request securely
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('savoria_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Menu Service
export const getMenu = () => api.get('/menu');
export const updateMenuItem = (id, data) => api.put(`/menu/${id}`, data);
export const addMenuItem = (data) => api.post('/menu', data);
export const seedMenu = () => api.post('/menu/seed');

// Auth Service
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const logoutUser = () => api.post('/auth/logout');

// Reservation Service
export const createReservation = (data) => api.post('/reservations', data);
export const getAllReservations = () => api.get('/reservations');
export const getUserReservations = (email) => api.get(`/reservations/user/${email}`);
export const updateReservationStatus = (id, status) => api.patch(`/reservations/${id}/status`, { status });
export const cancelReservation = (id) => api.delete(`/reservations/${id}`);

// Order Service
export const createOrder = (data) => api.post('/orders', data);
export const getUserOrders = (email) => api.get(`/orders/user/${email}`);
export const getReservationOrders = (reservationId) => api.get(`/orders/reservation/${reservationId}`);
export const getAllOrders = () => api.get('/orders');
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });
export const cancelOrder = (id) => api.delete(`/orders/${id}`);

export default api;
