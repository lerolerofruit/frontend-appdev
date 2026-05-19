import { useState, useEffect } from 'react';
import { getAllPartRequests, updatePartRequestStatus } from '../../api/partRequests';
import EmptyState from '../../components/EmptyState';
import { Package, Search } from 'lucide-react';

export default function ManagePartRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllPartRequests();
      setRequests(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load part requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    try {
      await updatePartRequestStatus(id, newStatus);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: <span className="badge-yellow">Pending</span>,
      Reviewed: <span className="badge-blue">Reviewed</span>,
      Fulfilled: <span className="badge-green">Fulfilled</span>,
    };
    return badges[status] || <span className="badge-gray">{status}</span>;
  };

  const statuses = ['Pending', 'Reviewed', 'Fulfilled'];

  const filtered = requests.filter(req => {
    const matchesSearch = req.partName.toLowerCase().includes(search.toLowerCase()) ||
      req.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
      req.customerName?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || req.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-bold text-slate-900">Manage Part Requests</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="card">
        <div className="mb-5 flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Search part name, customer…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Fulfilled">Fulfilled</option>
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No part requests"
            description="No part requests match your search or filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th">Part Name</th>
                  <th className="th">Customer</th>
                  <th className="th">Vehicle</th>
                  <th className="th">Description</th>
                  <th className="th">Requested</th>
                  <th className="th">Status</th>
                  <th className="th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(req => (
                  <tr key={req.id} className="tr">
                    <td className="td font-medium text-gray-900">{req.partName}</td>
                    <td className="td text-gray-600">
                      <p className="font-medium text-sm">{req.customerName}</p>
                      <p className="text-xs text-gray-500">{req.customerEmail}</p>
                    </td>
                    <td className="td text-gray-600 text-sm">
                      {req.vehicleInfo ? `${req.vehicleInfo.make} ${req.vehicleInfo.model}` : '—'}
                    </td>
                    <td className="td text-gray-600 text-sm max-w-xs truncate">
                      {req.description || '—'}
                    </td>
                    <td className="td text-gray-500 text-sm">
                      {new Date(req.requestDate).toLocaleDateString()}
                    </td>
                    <td className="td">{getStatusBadge(req.status)}</td>
                    <td className="td">
                      <div className="flex gap-1">
                        <select
                          className="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer"
                          value={req.status}
                          onChange={e => handleStatusChange(req.id, e.target.value)}
                          disabled={updating === req.id}
                        >
                          {statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
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
