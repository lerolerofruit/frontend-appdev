import api from './axios';

const requireId = (id, action) => {
  if (!id) {
    throw new Error(`Cannot ${action}: missing invoice id.`);
  }
  return id;
};

export const getPurchaseInvoices = () => api.get('/purchaseinvoices');
export const getPurchaseInvoice = (id) => api.get(`/purchaseinvoices/${requireId(id, 'get purchase invoice')}`);
export const createPurchaseInvoice = (data) => api.post('/purchaseinvoices', data);
export const deletePurchaseInvoice = (id) => api.delete(`/purchaseinvoices/${requireId(id, 'delete purchase invoice')}`);

export const getSalesInvoices = (customerId) =>
  api.get('/salesinvoices', { params: customerId ? { customerId } : {} });
export const getSalesInvoice = (id) => api.get(`/salesinvoices/${requireId(id, 'get sales invoice')}`);
export const createSalesInvoice = (data) => api.post('/salesinvoices', data);
// Invoice email sending and separate customer history endpoints removed for Milestone 1
export const sendSalesInvoiceEmail = (id) => api.post(`/salesinvoices/${requireId(id, 'send sales invoice email')}/send-email`);
export const deleteSalesInvoice = (id) => api.delete(`/salesinvoices/${requireId(id, 'delete sales invoice')}`);
