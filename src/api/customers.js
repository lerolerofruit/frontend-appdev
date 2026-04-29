import api from './axios';

export const registerCustomerWithVehicle = (data) =>
  api.post('/customers/register-with-vehicle', data);
export const getProfile = () => api.get('/customers/profile');
export const updateProfile = (data) => api.put('/customers/profile', data);
export const getVehicles = () => api.get('/customers/vehicles');
export const addVehicle = (data) => api.post('/customers/vehicles', data);
export const updateVehicle = (id, data) => api.put(`/customers/vehicles/${id}`, data);

export const searchCustomers = (q) =>
  api.get('/staff/customers/search', { params: { q } });
export const getCustomerDetails = (id) => api.get(`/staff/customers/${id}`);
// Report endpoints removed from frontend for Milestone 1
