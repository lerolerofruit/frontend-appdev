import { useState, useEffect } from 'react';
import { getSalesInvoices } from '../../api/invoices';
import StatCard from '../../components/StatCard';
import { FileText, TrendingUp } from 'lucide-react';

export default function StaffDashboard() {
  const [stats, setStats] = useState({ invoices: 0, todayInvoices: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [inv] = await Promise.all([getSalesInvoices()]);
        const today = new Date().toDateString();
        setStats({
          invoices: inv.data.length,
          todayInvoices: inv.data.filter(i => new Date(i.invoiceDate).toDateString() === today).length,
        });
      } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-slate-400">Loading…</div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-2 gap-4">
          <StatCard label="Total Invoices" value={stats.invoices} icon={FileText} color="teal" />
          <StatCard label="Today's Invoices" value={stats.todayInvoices} icon={TrendingUp} color="cyan" />
        </div>
      )}
    </div>
  );
}
