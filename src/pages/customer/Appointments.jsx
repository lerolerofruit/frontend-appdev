import { useState, useEffect } from 'react';
import { getAppointments, bookAppointment, updateAppointment, cancelAppointment } from '../../api/appointments';
import { getVehicles } from '../../api/customers';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { Calendar, Plus, Clock, Pencil, X, AlertCircle } from 'lucide-react';

const statusMap = {
  1: 'Pending',
  2: 'Confirmed',
  3: 'Completed',
  4: 'Cancelled'
};

const statusColors = { Pending: 'badge-yellow', Confirmed: 'badge-blue', Completed: 'badge-green', Cancelled: 'badge-red' };

const getStatusName = (status) => {
  if (typeof status === 'number') return statusMap[status] || 'Unknown';
  return status || 'Unknown';
};

const getStatusValue = (status) => {
  if (typeof status === 'number') return status;
  const entries = Object.entries(statusMap);
  const found = entries.find(([_, value]) => value === status);
  return found ? parseInt(found[0]) : 1;
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null, 'book', 'edit', 'detail', 'cancel'
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [form, setForm] = useState({ vehicleId: '', appointmentDate: '', serviceType: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [a, v] = await Promise.all([getAppointments(), getVehicles()]);
      setAppointments(a.data);
      setVehicles(v.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const openBook = () => {
    setForm({ vehicleId: '', appointmentDate: '', serviceType: '', notes: '' });
    setError('');
    setModal('book');
  };

  const openEdit = (a) => {
    setSelectedAppointment(a);
    const appointmentDateTime = new Date(a.appointmentDate);
    const localDatetime = new Date(appointmentDateTime.getTime() - appointmentDateTime.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setForm({
      vehicleId: a.vehicleId,
      appointmentDate: localDatetime,
      serviceType: a.serviceType,
      notes: a.notes || ''
    });
    setError('');
    setModal('edit');
  };

  const openDetail = (a) => {
    setSelectedAppointment(a);
    setModal('detail');
  };

  const openCancel = (a) => {
    setSelectedAppointment(a);
    setModal('cancel');
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const appointmentDate = new Date(form.appointmentDate);
      const utcDate = new Date(appointmentDate.getTime() - appointmentDate.getTimezoneOffset() * 60000).toISOString();

      await bookAppointment({
        vehicleId: form.vehicleId,
        appointmentDate: utcDate,
        serviceType: form.serviceType,
        notes: form.notes || null
      });
      await load();
      setModal(null);
      setForm({ vehicleId: '', appointmentDate: '', serviceType: '', notes: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const appointmentDate = new Date(form.appointmentDate);
      const utcDate = new Date(appointmentDate.getTime() - appointmentDate.getTimezoneOffset() * 60000).toISOString();

      await updateAppointment(selectedAppointment.id, {
        vehicleId: form.vehicleId,
        appointmentDate: utcDate,
        serviceType: form.serviceType,
        notes: form.notes || null
      });
      await load();
      setModal(null);
      setSelectedAppointment(null);
      setForm({ vehicleId: '', appointmentDate: '', serviceType: '', notes: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    setSaving(true);
    setError('');
    try {
      await cancelAppointment(selectedAppointment.id);
      await load();
      setModal(null);
      setSelectedAppointment(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setSaving(false);
    }
  };

  const getVehicleDisplay = (vehicleId) => {
    const v = vehicles.find(v => v.id === vehicleId);
    return v ? `${v.make} ${v.model} (${v.vehicleNumber})` : 'Unknown Vehicle';
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Service Appointments</h1>
          <p className="text-slate-600 mt-1">Book, view, and manage your service appointments</p>
        </div>
        <button
          onClick={openBook}
          className="btn-primary flex items-center gap-2 flex-shrink-0"
        >
          <Plus size={18} strokeWidth={2.5} /> Book Appointment
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading…</div>
      ) : appointments.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Calendar}
            title="No appointments yet"
            description="Book your first service appointment to get started."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(a => (
            <div key={a.id} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock size={18} className="text-sky-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{a.serviceType}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {new Date(a.appointmentDate).toLocaleDateString()} at{' '}
                      {new Date(a.appointmentDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Vehicle: {getVehicleDisplay(a.vehicleId)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={statusColors[getStatusName(a.status)] || 'badge-gray'}>{getStatusName(a.status)}</span>
                  <button
                    onClick={() => openDetail(a)}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    View
                  </button>
                  {getStatusName(a.status) === 'Pending' && (
                    <>
                      <button
                        onClick={() => openEdit(a)}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit appointment"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => openCancel(a)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel appointment"
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {a.notes && (
                <p className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">{a.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* View Details Modal */}
      {modal === 'detail' && selectedAppointment && (
        <Modal title="Appointment Details" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600 font-semibold mb-1">SERVICE TYPE</p>
              <p className="text-lg font-semibold text-gray-900">{selectedAppointment.serviceType}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">DATE & TIME</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(selectedAppointment.appointmentDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">STATUS</p>
                <p className={`inline-block ${statusColors[getStatusName(selectedAppointment.status)] || 'badge-gray'}`}>
                  {getStatusName(selectedAppointment.status)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 font-semibold mb-1">VEHICLE</p>
              <p className="text-sm font-medium text-gray-900">
                {getVehicleDisplay(selectedAppointment.vehicleId)}
              </p>
            </div>

            {selectedAppointment.notes && (
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">NOTES</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                  {selectedAppointment.notes}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setModal(null)} className="btn-secondary">
                Close
              </button>
              {getStatusName(selectedAppointment.status) === 'Pending' && (
                <>
                  <button onClick={() => { setModal('edit'); openEdit(selectedAppointment); }} className="btn-secondary flex items-center gap-2">
                    <Pencil size={16} /> Edit
                  </button>
                  <button onClick={() => setModal('cancel')} className="btn-danger flex items-center gap-2">
                    <X size={16} /> Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Modal */}
      {modal === 'cancel' && selectedAppointment && (
        <Modal title="Cancel Appointment" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="bg-red-50 rounded-xl p-4 flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Are you sure?</p>
                <p className="text-sm text-red-700 mt-1">
                  This will cancel your {selectedAppointment.serviceType} appointment on{' '}
                  {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}.
                </p>
              </div>
            </div>
            {error && (
              <div className="p-3 bg-red-50 rounded-xl text-sm text-red-600">{error}</div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setModal(null)}
                disabled={saving}
                className="btn-secondary"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="btn-danger"
              >
                {saving ? 'Cancelling…' : 'Cancel Appointment'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Book Appointment Modal */}
      {modal === 'book' && (
        <Modal title="Book Appointment" onClose={() => setModal(null)}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-xl text-sm text-red-600">{error}</div>
          )}
          <form onSubmit={handleBook} className="space-y-4">
            <div>
              <label className="label">Vehicle</label>
              <select
                className="input"
                required
                value={form.vehicleId}
                onChange={set('vehicleId')}
              >
                <option value="">Select vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} — {v.vehicleNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Appointment Date & Time</label>
              <input
                className="input"
                type="datetime-local"
                required
                value={form.appointmentDate}
                onChange={set('appointmentDate')}
              />
            </div>
            <div>
              <label className="label">Service Type</label>
              <input
                className="input"
                required
                value={form.serviceType}
                onChange={set('serviceType')}
                placeholder="e.g. Oil Change, Brake Inspection"
                maxLength={120}
              />
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <textarea
                className="input resize-none"
                rows={3}
                value={form.notes}
                onChange={set('notes')}
                placeholder="Any additional details…"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                disabled={saving}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Booking…' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Appointment Modal */}
      {modal === 'edit' && selectedAppointment && (
        <Modal title="Edit Appointment" onClose={() => setModal(null)}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-xl text-sm text-red-600">{error}</div>
          )}
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="label">Vehicle</label>
              <select
                className="input"
                required
                value={form.vehicleId}
                onChange={set('vehicleId')}
              >
                <option value="">Select vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} — {v.vehicleNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Appointment Date & Time</label>
              <input
                className="input"
                type="datetime-local"
                required
                value={form.appointmentDate}
                onChange={set('appointmentDate')}
              />
            </div>
            <div>
              <label className="label">Service Type</label>
              <input
                className="input"
                required
                value={form.serviceType}
                onChange={set('serviceType')}
                placeholder="e.g. Oil Change, Brake Inspection"
                maxLength={120}
              />
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <textarea
                className="input resize-none"
                rows={3}
                value={form.notes}
                onChange={set('notes')}
                placeholder="Any additional details…"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                disabled={saving}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Saving…' : 'Update Appointment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
