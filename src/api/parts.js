import api from './axios';

export const getParts = (includeInactive = true) =>
  api.get('/parts', { params: { includeInactive } });
export const getPart = (id) => api.get(`/parts/${id}`);
export const createPart = (data) => api.post('/parts', data);
export const updatePart = (id, data) => api.put(`/parts/${id}`, data);
export const updatePartStatus = (id, isActive) =>
  api.patch(`/parts/${id}/status`, { isActive });
export const deletePart = (id) => api.delete(`/parts/${id}`);
