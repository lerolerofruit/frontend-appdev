import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Package, Building2, FileText, Users,
  Calendar, LogOut, Wrench, BarChart3, Inbox
} from 'lucide-react';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/parts', label: 'Parts', icon: Package },
  { to: '/admin/vendors', label: 'Vendors', icon: Building2 },
  { to: '/admin/purchase-invoices', label: 'Purchase Invoices', icon: FileText },
  { to: '/admin/staff', label: 'Staff', icon: Users },
  { to: '/admin/financial-reports', label: 'Financial Reports', icon: BarChart3 },
  { to: '/admin/part-requests', label: 'Part Requests', icon: Inbox },
];
const staffLinks = [
  { to: '/staff', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/staff/customers', label: 'Customers', icon: Users },
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
    <aside style={{ background: '#0d1f1a', borderRight: '1px solid rgba(255,255,255,0.04)' }}
      className="w-60 min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-40">

      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#14b8a6,#059669)' }}>
            <Wrench size={15} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-wide">AutoIMS</span>
        </div>
      </div>

      {/* Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                isActive
                  ? 'font-semibold'
                  : 'font-normal text-white/45 hover:text-white/75 hover:bg-white/5'
              }`
            }
            style={({ isActive }) => isActive
              ? { background: 'rgba(20,184,166,0.12)', color: '#5eead4' }
              : {}
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} style={{ color: isActive ? '#2dd4bf' : 'rgba(255,255,255,0.35)' }} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-medium text-white/60 truncate">{user?.email}</p>
          <p className="text-xs mt-0.5" style={{ color: '#2dd4bf' }}>{user?.role}</p>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-colors"
          style={{ color: 'rgba(248,113,113,0.7)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171'; }}
          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(248,113,113,0.7)'; }}>
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}
