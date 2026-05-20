import api from './axios';

export const getPurchaseInvoices = () => api.get('/purchaseinvoices');
export const getPurchaseInvoice = (id) => api.get(`/purchaseinvoices/${id}`);
export const createPurchaseInvoice = (data) => api.post('/purchaseinvoices', data);

export const getSalesInvoices = (customerId) =>
  api.get('/salesinvoices', { params: customerId ? { customerId } : {} });
export const getSalesInvoice = (id) => api.get(`/salesinvoices/${id}`);
export const createSalesInvoice = (data) => api.post('/salesinvoices', data);
// Invoice email sending and separate customer history endpoints removed for Milestone 1
export const sendSalesInvoiceEmail = (id) => api.post(`/salesinvoices/${id}/send-email`);
