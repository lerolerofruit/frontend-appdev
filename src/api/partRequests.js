import api from './axios';

export const createPartRequest = (payload) => {
  return api.post('/PartRequests', payload);
};

export const getMyPartRequests = () => {
  return api.get('/PartRequests/my');
};

export const getAllPartRequests = () => {
  return api.get('/PartRequests');
};

export const updatePartRequestStatus = (id, status) => {
  return api.put(`/PartRequests/${id}`, { status });
};
