import api from './axios';

export const getFinancialReport = (period = 'monthly') => {
  return api.get(`/AdminReports/financial?period=${period}`);
};
