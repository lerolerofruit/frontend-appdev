import api from "./axios";

// Customer Endpoints
export const getAppointments = () => api.get("/customer/appointments");
export const bookAppointment = (data) =>
  api.post("/customer/appointments", data);
export const updateAppointment = (id, data) =>
  api.put(`/customer/appointments/${id}`, data);
export const cancelAppointment = (id) =>
  api.delete(`/customer/appointments/${id}`);

// Admin Endpoints
export const getAllAppointments = () => api.get("/admin/appointments");
export const getAppointmentById = (id) => api.get(`/admin/appointments/${id}`);
export const updateAppointmentStatus = (id, data) =>
  api.put(`/admin/appointments/${id}`, data);

// Staff Endpoints
export const getStaffAppointments = () => api.get("/staff/appointments");
export const getStaffAppointmentById = (id) =>
  api.get(`/staff/appointments/${id}`);
export const updateStaffAppointmentStatus = (id, data) =>
  api.put(`/staff/appointments/${id}`, data);
export const deleteStaffAppointment = (id) =>
  api.delete(`/staff/appointments/${id}`);
