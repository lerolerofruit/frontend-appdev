import { useState, useEffect } from 'react';
import { getFinancialReport } from '../../api/reports';
import StatCard from '../../components/StatCard';
import { TrendingUp, DollarSign, ShoppingCart, FileText, CreditCard } from 'lucide-react';

export default function FinancialReports() {
  const [period, setPeriod] = useState('monthly');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getFinancialReport(period);
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load financial report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [period]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Financial Reports</h1>
        <div className="flex gap-2">
          {['daily', 'monthly', 'yearly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">
          Loading financial report…
        </div>
      ) : report ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Total Sales Revenue"
            value={formatCurrency(report.totalSalesRevenue)}
            icon={TrendingUp}
            color="emerald"
          />
          <StatCard
            label="Total Purchase Cost"
            value={formatCurrency(report.totalPurchaseCost)}
            icon={ShoppingCart}
            color="sky"
          />
          <StatCard
            label="Estimated Profit"
            value={formatCurrency(report.estimatedProfit)}
            icon={DollarSign}
            color="amber"
          />
          <StatCard
            label="Sales Invoices"
            value={report.numberOfSalesInvoices}
            icon={FileText}
            color="violet"
            sub={`${report.numberOfSalesInvoices} invoices`}
          />
          <StatCard
            label="Purchase Invoices"
            value={report.numberOfPurchaseInvoices}
            icon={FileText}
            color="rose"
            sub={`${report.numberOfPurchaseInvoices} invoices`}
          />
          <StatCard
            label="Paid Amount"
            value={formatCurrency(report.paidSalesAmount)}
            icon={CreditCard}
            color="teal"
          />
          <StatCard
            label="Pending/Credit Amount"
            value={formatCurrency(report.pendingSalesAmount)}
            icon={CreditCard}
            color="cyan"
          />
        </div>
      ) : (
        <div className="py-20 text-center text-sm text-slate-400">
          No data available
        </div>
      )}
    </div>
  );
}
