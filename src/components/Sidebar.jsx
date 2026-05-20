import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Package, Building2, FileText, Users,
  Calendar, LogOut, Wrench, BarChart3, Inbox, Bell
} from 'lucide-react';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/parts', label: 'Parts', icon: Package },
  { to: '/admin/vendors', label: 'Vendors', icon: Building2 },
  { to: '/admin/purchase-invoices', label: 'Purchase Invoices', icon: FileText },
  { to: '/admin/sales-invoices', label: 'Sales Invoices', icon: FileText },
  { to: '/admin/staff', label: 'Staff', icon: Users },
  { to: '/admin/financial-reports', label: 'Financial Reports', icon: BarChart3 },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/part-requests', label: 'Part Requests', icon: Inbox },
];
const staffLinks = [
  { to: '/staff', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/staff/customers', label: 'Customers', icon: Users },
  { to: '/staff/customer-reports', label: 'Customer Reports', icon: BarChart3 },
  { to: '/staff/sales-invoices', label: 'Sales Invoices', icon: FileText },
  { to: '/staff/part-requests', label: 'Part Requests', icon: Inbox },
];
const customerLinks = [
  { to: '/customer', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/customer/vehicles', label: 'My Vehicles', icon: Wrench },
  { to: '/customer/appointments', label: 'Appointments', icon: Calendar },
  { to: '/customer/part-requests', label: 'Request Parts', icon: Inbox },
];
const roleLinks = { Admin: adminLinks, Staff: staffLinks, Customer: customerLinks };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = roleLinks[user?.role] || [];

  return (
    <aside className="w-60 min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-40"
      style={{ background: '#ffffff', borderRight: '1px solid #e2e8f0' }}>

      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)' }}>
            <Wrench size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-slate-900 text-sm tracking-tight">AutoIMS</span>
        </div>
      </div>

      {/* Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} style={{ color: isActive ? '#0f766e' : '#cbd5e1' }} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3" style={{ borderTop: '1px solid #e2e8f0' }}>
        <div className="px-3 py-2 mb-2">
          <p className="text-xs font-medium text-slate-600 truncate">{user?.email}</p>
          <p className="text-xs mt-1 font-semibold text-teal-700">{user?.role}</p>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-slate-600 hover:text-red-600 hover:bg-red-50">
          <LogOut size={16} strokeWidth={2} /> Sign out
        </button>
      </div>
    </aside>
  );
}
