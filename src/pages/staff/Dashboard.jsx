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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Track your sales invoices and customer activity</p>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-slate-400">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <StatCard label="Total Invoices" value={stats.invoices} icon={FileText} color="teal" />
            <StatCard label="Today's Invoices" value={stats.todayInvoices} icon={TrendingUp} color="cyan" />
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  <BarChart3 size={22} className="text-slate-600" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Customer Reports</p>
                  <p className="text-sm text-slate-500">View regular customers, high spenders, and pending credits</p>
                </div>
              </div>
              <Link to="/staff/customer-reports" className="btn-primary flex-shrink-0">View Reports</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
