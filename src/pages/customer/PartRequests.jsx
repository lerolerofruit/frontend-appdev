import { useState, useEffect } from 'react';
import { createPartRequest, getMyPartRequests } from '../../api/partRequests';
import { getVehicles } from '../../api/customers';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { Plus, Package, AlertCircle } from 'lucide-react';

const empty = { partName: '', vehicleId: '', description: '' };

export default function PartRequests() {
  const [requests, setRequests] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [r, v] = await Promise.all([getMyPartRequests(), getVehicles()]);
      setRequests(r.data);
      setVehicles(v.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load part requests.');
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
        partName: form.partName,
        vehicleId: form.vehicleId || null,
        description: form.description || null,
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
      Reviewed: <span className="badge-blue">Reviewed</span>,
      Fulfilled: <span className="badge-green">Fulfilled</span>,
    };
    return badges[status] || <span className="badge-gray">{status}</span>;
  };

  const getVehicleName = (vehicleId) => {
    if (!vehicleId) return '—';
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.vehicleNumber})` : '—';
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
                      <h3 className="font-semibold text-slate-900">{req.partName}</h3>
                    </div>
                    {req.vehicleId && (
                      <p className="text-sm text-slate-600 mb-2">
                        <span className="text-slate-500">Vehicle:</span> {getVehicleName(req.vehicleId)}
                      </p>
                    )}
                    {req.description && (
                      <p className="text-sm text-slate-600 mb-2">
                        <span className="text-slate-500">Description:</span> {req.description}
                      </p>
                    )}
                    <p className="text-xs text-slate-400">
                      Requested on {new Date(req.requestDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">{getStatusBadge(req.status)}</div>
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
                value={form.partName}
                onChange={e => setForm({ ...form, partName: e.target.value })}
                placeholder="e.g., Brake Pad Set, Air Filter"
              />
            </div>
            <div>
              <label className="label">Vehicle (Optional)</label>
              <select
                className="input"
                value={form.vehicleId}
                onChange={e => setForm({ ...form, vehicleId: e.target.value })}
              >
                <option value="">Select a vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.vehicleNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Description (Optional)</label>
              <textarea
                className="input"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="e.g., Why do you need this part? Any specific requirements?"
                rows={4}
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
