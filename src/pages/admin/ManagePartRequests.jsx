import { useState, useEffect } from 'react';
import { getAllPartRequests, updatePartRequestStatus, deletePartRequest } from '../../api/partRequests';
import EmptyState from '../../components/EmptyState';
import { Package, Search, Trash2 } from 'lucide-react';

const normalizeRequests = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.$values)) return data.$values;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export default function ManagePartRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllPartRequests();
      setRequests(normalizeRequests(res.data));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load part requests.');
      setRequests([]);
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

  const handleDelete = async (id) => {
    const ok = window.confirm('Remove this part request? This cannot be undone.');
    if (!ok) return;

    setDeleting(id);
    setError('');
    try {
      await deletePartRequest(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove part request.');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: <span className="badge-yellow">Pending</span>,
      Approved: <span className="badge-blue">Approved</span>,
      Rejected: <span className="badge-red">Rejected</span>,
      Fulfilled: <span className="badge-green">Fulfilled</span>,
    };
    return badges[status] || <span className="badge-gray">{status}</span>;
  };

  const statuses = ['Pending', 'Approved', 'Rejected', 'Fulfilled'];

  const filtered = requests.filter(req => {
    const partName = req.partName || req.requestedPartName || '';
    const partNumber = req.requestedPartNumber || '';
    const customerEmail = req.customerEmail || req.requestedByEmail || '';
    const customerName = req.customerName || req.requestedByName || '';
    const searchTerm = search.toLowerCase();
    const matchesSearch = partName.toLowerCase().includes(searchTerm) ||
      partNumber.toLowerCase().includes(searchTerm) ||
      customerEmail.toLowerCase().includes(searchTerm) ||
      customerName.toLowerCase().includes(searchTerm);
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
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
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
                  <th className="th">Requested By</th>
                  <th className="th">Part Number</th>
                  <th className="th">Quantity</th>
                  <th className="th">Requested</th>
                  <th className="th">Status</th>
                  <th className="th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(req => (
                  <tr key={req.id} className="tr">
                    <td className="td font-medium text-gray-900">{req.partName || req.requestedPartName || '—'}</td>
                    <td className="td text-gray-600">
                      <p className="font-medium text-sm">{req.customerName || req.requestedByName || '—'}</p>
                      <p className="text-xs text-gray-500">{req.customerEmail || req.requestedByEmail || '—'}</p>
                    </td>
                    <td className="td text-gray-600">{req.requestedPartNumber || '—'}</td>
                    <td className="td text-gray-600">{req.quantity ?? '—'}</td>
                    <td className="td text-gray-500 text-sm">
                      {new Date(req.requestDate || req.requestedOn || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="td">{getStatusBadge(req.status)}</td>
                    <td className="td">
                      <div className="flex gap-1">
                        <select
                          className="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer"
                          value={req.status}
                          onChange={e => handleStatusChange(req.id, e.target.value)}
                          disabled={updating === req.id || deleting === req.id}
                        >
                          {statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn-danger text-xs px-2 py-1"
                          onClick={() => handleDelete(req.id)}
                          disabled={deleting === req.id || updating === req.id}
                          title="Remove request"
                        >
                          <Trash2 size={14} />
                        </button>
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
