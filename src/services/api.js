import axios from 'axios';

const rawUrl = process.env.REACT_APP_API_URL || 'https://igoback.onrender.com/api';
const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (localStorage.getItem('adminToken')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

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
export const assignOrderDriver = (id, deliveryUserId) => api.patch(`/orders/${id}/assign-driver`, { deliveryUserId });
export const verifyOrderPayment = (id, isPaid = true) => api.patch(`/orders/${id}/verify-payment`, { isPaid });
export const getBusinessDebtsReport = () => api.get('/orders/reports/business-debts');

// Menu Categories (Categorías internas de tienda)
export const getMenuCategoriesByBusiness = (businessId) => api.get(`/menu-category/business/${businessId}`);
export const createMenuCategory = (data) => api.post('/menu-category', data);
export const updateMenuCategory = (id, data) => api.patch(`/menu-category/${id}`, data);
export const deleteMenuCategory = (id) => api.delete(`/menu-category/${id}`);

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
export const getAllSettings = () => api.get('/settings');
export const getSetting = (key) => api.get(`/settings/${key}`);
export const updateSetting = (key, value) => api.patch(`/settings/${key}`, { value });
export const updateBulkSettings = (settings) => api.post('/settings/bulk', settings);
export const getActiveDrivers = () => api.get('/orders/active-drivers');


// Image Upload Services
const uploadToImgBBDirect = async (formData) => {
  const apiKey = '6dfbf7cb3ce7d636c4e9b06b5a89624e';
  const file = formData.get('file');
  if (!file) throw new Error('No se encontró archivo');

  const imgForm = new FormData();
  imgForm.append('image', file);
  if (file.name) {
    imgForm.append('name', file.name.split('.')[0]);
  }

  const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, imgForm);
  if (response.data && response.data.success && response.data.data) {
    const secureUrl = response.data.data.url || response.data.data.display_url;
    return { data: { secureUrl } };
  }
  throw new Error('Error al obtener URL de ImgBB');
};

export const uploadUserImage = async (formData) => {
  try {
    return await uploadToImgBBDirect(formData);
  } catch (e) {
    return api.post('/files/user', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const uploadProductImage = async (formData) => {
  try {
    return await uploadToImgBBDirect(formData);
  } catch (e) {
    return api.post('/files/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const uploadBusinessImage = async (formData) => {
  try {
    return await uploadToImgBBDirect(formData);
  } catch (e) {
    return api.post('/files/bussiness', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default api;


