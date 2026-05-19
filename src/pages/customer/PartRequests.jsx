import { useState, useEffect } from 'react';
import { createPartRequest, getMyPartRequests, deletePartRequest } from '../../api/partRequests';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { Plus, Package, AlertCircle, Trash2 } from 'lucide-react';

const empty = { requestedPartName: '', requestedPartNumber: '', quantity: 1 };

const normalizeRequests = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.$values)) return data.$values;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export default function PartRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await getMyPartRequests();
      setRequests(normalizeRequests(r.data));
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

  const openCreate = () => {
    setForm(empty);
    setError('');
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        requestedPartName: form.requestedPartName.trim(),
        requestedPartNumber: form.requestedPartNumber.trim(),
        quantity: form.quantity || 1,
      };
      await createPartRequest(payload);
      await load();
      setModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setSaving(false);
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

  const handleDelete = async (id) => {
    const ok = window.confirm('Remove this part request? This cannot be undone.');
    if (!ok) return;

    setDeleting(id);
    setError('');
    try {
      await deletePartRequest(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove request.');
    } finally {
      setDeleting(null);
    }
  };


  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Unavailable Part Requests</h1>
          <p className="text-sm text-slate-500 mt-1">Request parts that are currently unavailable</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Request
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading…</div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No part requests yet"
            description="Request unavailable parts to get notified when they arrive."
          />
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Package size={18} className="text-violet-500 flex-shrink-0" />
                        <h3 className="font-semibold text-slate-900">{req.requestedPartName}</h3>
                    </div>
                    {req.requestedPartNumber && (
                      <p className="text-sm text-slate-600 mb-2">
                        <span className="text-slate-500">Part #:</span> {req.requestedPartNumber}
                      </p>
                    )}
                    <p className="text-sm text-slate-600 mb-2">
                      <span className="text-slate-500">Qty:</span> {req.quantity}
                    </p>
                    <p className="text-xs text-slate-400">
                      Requested on {new Date(req.requestedOn || req.requestDate || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">{getStatusBadge(req.status)}</div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    className="btn-danger text-xs px-2 py-1"
                    disabled={deleting === req.id}
                    onClick={() => handleDelete(req.id)}
                  >
                    <Trash2 size={14} />
                    {deleting === req.id ? 'Removing…' : 'Remove'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <Modal title="Request Unavailable Part" onClose={() => setModal(false)}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-xl text-sm text-red-600 flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Part Name *</label>
                <input
                  className="input"
                  required
                  value={form.requestedPartName}
                  onChange={e => setForm({ ...form, requestedPartName: e.target.value })}
                placeholder="e.g., Brake Pad Set, Air Filter"
              />
            </div>
              <div>
                <label className="label">Quantity</label>
                <input
                  type="number"
                  className="input"
                  min="1"
                  required
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="label">Part Number *</label>
                <input
                  className="input"
                  required
                  value={form.requestedPartNumber}
                  onChange={e => setForm({ ...form, requestedPartNumber: e.target.value })}
                  placeholder="e.g., BP-2024-001"
                />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
