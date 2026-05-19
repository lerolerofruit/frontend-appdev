import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSalesInvoices } from '../../api/invoices';
import StatCard from '../../components/StatCard';
import { FileText, TrendingUp, BarChart3 } from 'lucide-react';

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
        <>
          <div className="grid grid-cols-2 xl:grid-cols-2 gap-4">
            <StatCard label="Total Invoices" value={stats.invoices} icon={FileText} color="teal" />
            <StatCard label="Today's Invoices" value={stats.todayInvoices} icon={TrendingUp} color="cyan" />
          </div>

          <div className="mt-4 card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <BarChart3 size={18} className="text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Customer Reports</p>
                  <p className="text-sm text-slate-500">Regular customers, high spenders, and pending credits</p>
                </div>
              </div>
              <Link to="/staff/customer-reports" className="btn-primary">Open Reports</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
