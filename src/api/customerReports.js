import api from './axios';

export const getRegularCustomersReport = () => {
  return api.get('/CustomerReports/regular-customers');
};

export const getHighSpendersReport = () => {
  return api.get('/CustomerReports/high-spenders');
};

export const getPendingCreditsReport = () => {
  return api.get('/CustomerReports/pending-credits');
};
