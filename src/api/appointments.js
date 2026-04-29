import api from './axios';

export const getAppointments = () => api.get('/customer/appointments');
export const bookAppointment = (data) => api.post('/customer/appointments', data);
