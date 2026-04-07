import axios from 'axios';

// Create axios instance attached to backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
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
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const cancelOrder = (id) => api.delete(`/orders/${id}`);

// Payment Service
export const createRazorpayOrder = (data) => api.post('/payment/razorpay/order', data);
export const verifyPayment = (data) => api.post('/payment/razorpay/verify', data);
export const markAsCashPaid = (data) => api.post('/payment/cash/paid', data);
export const confirmCashPayment = (data) => api.post('/payment/cash/confirm', data);

// Reservation Level Payment
export const createRazorpayReservationOrder = (data) => api.post('/payment/razorpay/reservation/order', data);
export const verifyReservationPayment = (data) => api.post('/payment/razorpay/reservation/verify', data);
export const markReservationAsCashPaid = (data) => api.post('/payment/cash/reservation/paid', data);
export const confirmReservationCashPayment = (data) => api.post('/payment/cash/reservation/confirm', data);

export default api;
