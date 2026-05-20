import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import AdminDashboard from './pages/admin/Dashboard';
import Parts from './pages/admin/Parts';
import Vendors from './pages/admin/Vendors';
import PurchaseInvoices from './pages/admin/PurchaseInvoices';
import AdminSalesInvoices from './pages/admin/SalesInvoices';
import Staff from './pages/admin/Staff';
import FinancialReports from './pages/admin/FinancialReports';
import ManagePartRequests from './pages/admin/ManagePartRequests';
import Notifications from './pages/admin/Notifications';

import StaffDashboard from './pages/staff/Dashboard';
import StaffAppointments from './pages/staff/Appointments';
import Customers from './pages/staff/Customers';
import SalesInvoices from './pages/staff/SalesInvoices';
import CustomerReports from './pages/staff/CustomerReports';

import CustomerDashboard from './pages/customer/Dashboard';
import Vehicles from './pages/customer/Vehicles';
import Appointments from './pages/customer/Appointments';
import PartRequests from './pages/customer/PartRequests';
import CustomerReviews from './pages/customer/Reviews';
import PublicReviews from './pages/public/PublicReviews';

function ProtectedRoute({ children, roles }) {
  const { user, isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function RootRedirect() {
  const { user, isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  const routes = { Admin: '/admin', Staff: '/staff', Customer: '/customer' };
  return <Navigate to={routes[user?.role] || '/login'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reviews" element={<PublicReviews />} />

          <Route path="/admin" element={<ProtectedRoute roles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/parts" element={<ProtectedRoute roles={['Admin']}><Parts /></ProtectedRoute>} />
          <Route path="/admin/vendors" element={<ProtectedRoute roles={['Admin']}><Vendors /></ProtectedRoute>} />
          <Route path="/admin/purchase-invoices" element={<ProtectedRoute roles={['Admin']}><PurchaseInvoices /></ProtectedRoute>} />
          <Route path="/admin/sales-invoices" element={<ProtectedRoute roles={['Admin']}><AdminSalesInvoices /></ProtectedRoute>} />
          <Route path="/admin/staff" element={<ProtectedRoute roles={['Admin']}><Staff /></ProtectedRoute>} />
          <Route path="/admin/financial-reports" element={<ProtectedRoute roles={['Admin']}><FinancialReports /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute roles={['Admin']}><Notifications /></ProtectedRoute>} />
          <Route path="/admin/part-requests" element={<ProtectedRoute roles={['Admin']}><ManagePartRequests /></ProtectedRoute>} />

          <Route path="/staff" element={<ProtectedRoute roles={['Staff']}><StaffDashboard /></ProtectedRoute>} />
          <Route path="/staff/appointments" element={<ProtectedRoute roles={['Staff']}><StaffAppointments /></ProtectedRoute>} />
          <Route path="/staff/customers" element={<ProtectedRoute roles={['Staff']}><Customers /></ProtectedRoute>} />
          <Route path="/staff/sales-invoices" element={<ProtectedRoute roles={['Staff']}><SalesInvoices /></ProtectedRoute>} />
          <Route path="/staff/customer-reports" element={<ProtectedRoute roles={['Staff']}><CustomerReports /></ProtectedRoute>} />
          <Route path="/staff/part-requests" element={<ProtectedRoute roles={['Staff']}><ManagePartRequests /></ProtectedRoute>} />

          <Route path="/customer" element={<ProtectedRoute roles={['Customer']}><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/customer/vehicles" element={<ProtectedRoute roles={['Customer']}><Vehicles /></ProtectedRoute>} />
          <Route path="/customer/appointments" element={<ProtectedRoute roles={['Customer']}><Appointments /></ProtectedRoute>} />
          <Route path="/customer/part-requests" element={<ProtectedRoute roles={['Customer']}><PartRequests /></ProtectedRoute>} />
          <Route path="/customer/reviews" element={<ProtectedRoute roles={['Customer']}><CustomerReviews /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
