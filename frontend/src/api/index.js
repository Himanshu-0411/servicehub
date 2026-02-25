import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect on public pages — also clear bad token so next request goes clean
      const publicPaths = ['/login', '/register', '/', '/register/provider'];
      const isPublic = publicPaths.some(p => window.location.pathname === p || window.location.pathname.startsWith(p));
      if (!isPublic) {
        localStorage.clear();
        window.location.href = '/login';
      } else {
        // On public pages just clear the bad token so the next request goes unauthenticated
        localStorage.removeItem('accessToken');
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/api/auth/login', data),
  registerUser: (data) => api.post('/api/auth/register/user', data),
  registerProvider: (data) => api.post('/api/auth/register/provider', data),
};

export const categoryApi = {
  getAll: () => api.get('/api/categories'),
};

export const providerApi = {
  list: (params) => api.get('/api/providers/public', { params }),
  getCities: () => api.get('/api/providers/cities'),
  getById: (id) => api.get(`/api/providers/public/${id}`),
  getReviews: (id, params) => api.get(`/api/providers/public/${id}/reviews`, { params }),
  getMyProfile: () => api.get('/api/provider/profile'),
  updateProfile: (data) => api.put('/api/provider/profile', data),
  getMyBookings: (params) => api.get('/api/provider/bookings', { params }),
  updateBookingStatus: (bookingId, status) =>
    api.patch(`/api/provider/bookings/${bookingId}/status`, null, { params: { status } }),
};

export const userApi = {
  getAddresses: () => api.get('/api/user/addresses'),
  addAddress: (data) => api.post('/api/user/addresses', data),
  updateAddress: (id, data) => api.put(`/api/user/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/api/user/addresses/${id}`),
  createBooking: (data) => api.post('/api/user/bookings', data),
  getBookings: (params) => api.get('/api/user/bookings', { params }),
  cancelBooking: (id) => api.patch(`/api/user/bookings/${id}/cancel`),
  submitReview: (data) => api.post('/api/user/reviews', data),
  // Payment
  initiatePayment: (bookingId) => api.post(`/api/user/payments/initiate/${bookingId}`),
  processPayment: (data) => api.post('/api/user/payments/process', data),
  getPaymentStatus: (bookingId) => api.get(`/api/user/payments/booking/${bookingId}`),
};

export const adminApi = {
  getStats: () => api.get('/api/admin/stats'),
  getProviders: (params) => api.get('/api/admin/providers', { params }),
  approveProvider: (id) => api.patch(`/api/admin/providers/${id}/approve`),
  rejectProvider: (id) => api.patch(`/api/admin/providers/${id}/reject`),
  toggleUserStatus: (id) => api.patch(`/api/admin/users/${id}/toggle-status`),
  getBookings: (params) => api.get('/api/admin/bookings', { params }),
  createCategory: (params) => api.post('/api/admin/categories', null, { params }),
  toggleCategory: (id) => api.patch(`/api/admin/categories/${id}/toggle`),
};

export default api;
