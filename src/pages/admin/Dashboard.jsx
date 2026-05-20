import { useState, useEffect } from 'react';
import { getParts } from '../../api/parts';
import { getVendors } from '../../api/vendors';
import { getPurchaseInvoices } from '../../api/invoices';
import { getStaff } from '../../api/auth';
import { getAllAppointments } from '../../api/appointments';
import StatCard from '../../components/StatCard';
import { Package, Building2, FileText, Users, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ parts: 0, vendors: 0, invoices: 0, staff: 0, appointments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, v, inv, s, a] = await Promise.all([
          getParts(true),
          getVendors(true),
          getPurchaseInvoices(),
          getStaff(),
          getAllAppointments()
        ]);
        setStats({
          parts: p.data.length,
          vendors: v.data.filter(x => x.isActive).length,
          invoices: inv.data.length,
          staff: s.data.length,
          appointments: a.data.length,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of your system metrics and statistics</p>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-slate-400">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
          <StatCard label="Parts" value={stats.parts} icon={Package} color="teal" />
          <StatCard label="Active Vendors" value={stats.vendors} icon={Building2} color="cyan" />
          <StatCard label="Purchase Invoices" value={stats.invoices} icon={FileText} color="blue" />
          <StatCard label="Staff Members" value={stats.staff} icon={Users} color="emerald" />
          <StatCard label="Service Appointments" value={stats.appointments} icon={Calendar} color="amber" />
          {/* Low Stock stat removed for Milestone 1 */}
        </div>
      )}
    </div>
  );
}
