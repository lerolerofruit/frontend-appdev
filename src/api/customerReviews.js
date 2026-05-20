import api from "./axios";

export const getPublicCustomerReviews = () => api.get("/CustomerReviews");
export const getMyCustomerReviews = () => api.get("/CustomerReviews/my");
export const createCustomerReview = (data) =>
  api.post("/CustomerReviews", data);
export const deleteCustomerReview = (id) =>
  api.delete(`/CustomerReviews/${id}`);
