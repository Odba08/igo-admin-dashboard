import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Services
export const loginAdmin = (email, password) => api.post('/auth/login', { email, password });

// Users / Workers Services
export const getUsers = () => api.get('/users');
export const createUser = (userData) => api.post('/users/register', userData);
export const updateUserRole = (id, roles) => api.patch(`/users/${id}`, { roles });
export const updateUserStatus = (id, isActive) => api.patch(`/users/${id}`, { isActive });
export const updateEmployeeStatus = (id, employeeStatus) => api.patch(`/users/${id}`, { employeeStatus });
export const updateUser = (id, data) => api.patch(`/users/${id}`, data);

// Orders Services
export const getOrders = () => api.get('/orders');
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrder = (id, data) => api.patch(`/orders/${id}`, data);

// Businesses & Products Services
export const getBusinesses = () => api.get('/business');
export const getProducts = () => api.get('/products');
export const getBusinessProducts = (businessId) => api.get(`/business/${businessId}/products`);
export const createBusinessProduct = (businessId, productData) => api.post(`/business/${businessId}/products`, productData);
export const updateBusinessProduct = (businessId, productId, productData) => api.patch(`/business/${businessId}/products/${productId}`, productData);
export const deleteBusinessProduct = (businessId, productId) => api.delete(`/business/${businessId}/products/${productId}`);
export const getCategories = () => api.get('/categories');
export const createBusiness = (businessData) => api.post('/business', businessData);
export const updateBusiness = (businessId, businessData) => api.patch(`/business/${businessId}`, businessData);

export const getBusinessByOwner = (ownerId) => api.get(`/business/owner/${ownerId}`);
export const deleteBusiness = (businessId) => api.delete(`/business/${businessId}`);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Settings Services
export const getSetting = (key) => api.get(`/settings/${key}`);
export const updateSetting = (key, value) => api.patch(`/settings/${key}`, { value });

// Image Upload Services
export const uploadUserImage = (formData) => api.post('/files/user', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const uploadProductImage = (formData) => api.post('/files/products', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const uploadBusinessImage = (formData) => api.post('/files/bussiness', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export default api;

