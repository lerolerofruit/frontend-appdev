import { useEffect, useMemo, useState } from 'react';
import {
  getRegularCustomersReport,
  getHighSpendersReport,
  getPendingCreditsReport,
} from '../../api/customerReports';
import EmptyState from '../../components/EmptyState';
import { Users, TrendingUp, CreditCard } from 'lucide-react';

const tabs = [
  { id: 'regular', label: 'Regular Customers' },
  { id: 'high', label: 'High Spenders' },
  { id: 'pending', label: 'Pending Credits' },
];

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '—';
  return `Rs. ${Number(value).toLocaleString()}`;
};

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.$values)) return data.$values;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export default function CustomerReports() {
  const [activeTab, setActiveTab] = useState('regular');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regularCustomers, setRegularCustomers] = useState([]);
  const [highSpenders, setHighSpenders] = useState([]);
  const [pendingCredits, setPendingCredits] = useState([]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [regularRes, highRes, pendingRes] = await Promise.all([
        getRegularCustomersReport(),
        getHighSpendersReport(),
        getPendingCreditsReport(),
      ]);

      setRegularCustomers(normalizeList(regularRes.data));
      setHighSpenders(normalizeList(highRes.data));
      setPendingCredits(normalizeList(pendingRes.data));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customer reports.');
      setRegularCustomers([]);
      setHighSpenders([]);
      setPendingCredits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const currentRows = useMemo(() => {
    if (activeTab === 'regular') return regularCustomers;
    if (activeTab === 'high') return highSpenders;
    return pendingCredits;
  }, [activeTab, regularCustomers, highSpenders, pendingCredits]);

  const tabIcon = activeTab === 'regular' ? Users : activeTab === 'high' ? TrendingUp : CreditCard;

  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Customer Reports</h1>
        <button onClick={load} className="btn-secondary">Refresh</button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="card mb-4">
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="py-14 text-center text-sm text-gray-400">Loading customer reports…</div>
        ) : currentRows.length === 0 ? (
          <EmptyState
            icon={tabIcon}
            title="No report data"
            description="No matching records were found for this report."
          />
        ) : activeTab === 'regular' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th">Customer</th>
                  <th className="th">Contact</th>
                  <th className="th">Total Invoices</th>
                  <th className="th">Last Purchase</th>
                </tr>
              </thead>
              <tbody>
                {regularCustomers.map((row) => (
                  <tr key={row.customerId} className="tr">
                    <td className="td font-medium text-gray-900">{row.fullName}</td>
                    <td className="td text-sm text-gray-600">
                      <p>{row.email || '—'}</p>
                      <p className="text-xs text-gray-500">{row.phoneNumber || '—'}</p>
                    </td>
                    <td className="td text-gray-700">{row.totalInvoices ?? row.invoiceCount ?? 0}</td>
                    <td className="td text-gray-600">{formatDate(row.lastPurchaseDate || row.lastPurchaseAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'high' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th">Customer</th>
                  <th className="th">Contact</th>
                  <th className="th">Total Spent</th>
                  <th className="th">Invoice Count</th>
                  <th className="th">Last Purchase</th>
                </tr>
              </thead>
              <tbody>
                {highSpenders.map((row) => (
                  <tr key={row.customerId} className="tr">
                    <td className="td font-medium text-gray-900">{row.fullName}</td>
                    <td className="td text-sm text-gray-600">
                      <p>{row.email || '—'}</p>
                      <p className="text-xs text-gray-500">{row.phoneNumber || '—'}</p>
                    </td>
                    <td className="td font-semibold text-gray-900">{formatCurrency(row.totalSpend)}</td>
                    <td className="td text-gray-700">{row.invoiceCount ?? 0}</td>
                    <td className="td text-gray-600">{formatDate(row.lastPurchaseDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th">Customer</th>
                  <th className="th">Contact</th>
                  <th className="th">Invoice</th>
                  <th className="th">Invoice Date</th>
                  <th className="th">Due Amount</th>
                  <th className="th">Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingCredits.map((row) => (
                  <tr key={row.invoiceId} className="tr">
                    <td className="td font-medium text-gray-900">{row.fullName}</td>
                    <td className="td text-sm text-gray-600">
                      <p>{row.email || '—'}</p>
                      <p className="text-xs text-gray-500">{row.phoneNumber || '—'}</p>
                    </td>
                    <td className="td text-gray-700">
                      <p className="font-mono text-xs">{row.invoiceId}</p>
                      <p className="text-xs text-gray-500">{row.invoiceNumber || '—'}</p>
                    </td>
                    <td className="td text-gray-600">{formatDate(row.invoiceDate)}</td>
                    <td className="td font-semibold text-amber-700">{formatCurrency(row.dueAmount)}</td>
                    <td className="td">
                      <span className={
                        row.paymentStatus === 'Paid'
                          ? 'badge-green'
                          : row.paymentStatus === 'PartiallyPaid'
                            ? 'badge-yellow'
                            : 'badge-red'
                      }
                      >
                        {row.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
