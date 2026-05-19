import { useState, useEffect } from 'react';
import { getLowStockParts, getOverdueCredits } from '../../api/notifications';
import EmptyState from '../../components/EmptyState';
import { AlertCircle, Clock } from 'lucide-react';

export default function Notifications() {
  const [lowStock, setLowStock] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('low-stock');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [low, over] = await Promise.all([
        getLowStockParts(),
        getOverdueCredits()
      ]);
      setLowStock(low.data);
      setOverdue(over.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <div className="p-6"><div className="text-center text-gray-400">Loading…</div></div>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-6">Notifications</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('low-stock')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'low-stock'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Low Stock ({lowStock.length})
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'overdue'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Overdue Credits ({overdue.length})
        </button>
      </div>

      {activeTab === 'low-stock' && (
        <div className="card">
          {lowStock.length === 0 ? (
            <EmptyState icon={AlertCircle} title="No low-stock items" description="All parts are well-stocked." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="th">Part #</th>
                    <th className="th">Name</th>
                    <th className="th">Current Stock</th>
                    <th className="th">Reorder Level</th>
                    <th className="th">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map(part => (
                    <tr key={part.partId} className="tr">
                      <td className="td font-mono text-xs text-gray-500">{part.partNumber}</td>
                      <td className="td font-medium text-gray-900">{part.partName}</td>
                      <td className="td">
                        <span className="text-red-600 font-semibold">{part.currentStockQuantity}</span>
                      </td>
                      <td className="td text-gray-600">{part.reorderLevel}</td>
                      <td className="td">Rs. {part.sellingPrice?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'overdue' && (
        <div className="card">
          {overdue.length === 0 ? (
            <EmptyState icon={Clock} title="No overdue credits" description="All credit payments are on track." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="th">Customer</th>
                    <th className="th">Email</th>
                    <th className="th">Invoice #</th>
                    <th className="th">Invoice Date</th>
                    <th className="th">Due Amount</th>
                    <th className="th">Days Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {overdue.map(inv => (
                    <tr key={inv.invoiceId} className="tr">
                      <td className="td font-medium text-gray-900">{inv.customerName}</td>
                      <td className="td text-gray-600 text-sm">{inv.customerEmail}</td>
                      <td className="td font-mono text-xs text-gray-500">{inv.invoiceNumber}</td>
                      <td className="td text-sm text-gray-600">
                        {new Date(inv.invoiceDate).toLocaleDateString()}
                      </td>
                      <td className="td font-semibold text-red-600">
                        Rs. {inv.dueAmount?.toLocaleString()}
                      </td>
                      <td className="td">
                        <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium">
                          {inv.daysOverdue} days
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
