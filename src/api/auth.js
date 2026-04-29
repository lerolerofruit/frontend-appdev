import api from './axios';

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getStaff = () => api.get('/auth/staff');
export const registerStaff = (data) => api.post('/auth/register-staff', data);
export const updateStaffStatus = (staffId, isActive) =>
  api.patch(`/auth/staff/${staffId}/status`, { isActive });
export const updateStaffRole = (staffId, role) =>
  api.patch(`/auth/staff/${staffId}/role`, { role });
