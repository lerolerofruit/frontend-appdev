import api from './axios';

export const getVendors = (includeInactive = true) =>
  api.get('/vendors', { params: { includeInactive } });
export const getVendor = (id) => api.get(`/vendors/${id}`);
export const createVendor = (data) => api.post('/vendors', data);
export const updateVendor = (id, data) => api.put(`/vendors/${id}`, data);
export const updateVendorStatus = (id, isActive) =>
  api.patch(`/vendors/${id}/status`, { isActive });
