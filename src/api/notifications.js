import api from './axios';

export const getLowStockParts = () => api.get('/notifications/low-stock');

export const getOverdueCredits = () => api.get('/notifications/overdue-credits');
