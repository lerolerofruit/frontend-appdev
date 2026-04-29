import { useState, useEffect } from 'react';
import { getAppointments, bookAppointment } from '../../api/appointments';
import { getVehicles } from '../../api/customers';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { Calendar, Plus, Clock } from 'lucide-react';

const statusColors = { Pending: 'badge-yellow', Confirmed: 'badge-blue', Completed: 'badge-green', Cancelled: 'badge-red' };

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', appointmentDate: '', serviceType: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [a, v] = await Promise.all([getAppointments(), getVehicles()]);
      setAppointments(a.data); setVehicles(v.data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleBook = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await bookAppointment({ vehicleId: form.vehicleId, appointmentDate: form.appointmentDate, serviceType: form.serviceType, notes: form.notes || null });
      await load(); setModal(false); setForm({ vehicleId: '', appointmentDate: '', serviceType: '', notes: '' });
    } catch (err) { setError(err.response?.data?.message || 'Failed to book appointment.'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Appointments</h1>
          
        </div>
        <button onClick={() => { setForm({ vehicleId: '', appointmentDate: '', serviceType: '', notes: '' }); setError(''); setModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Book Appointment
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading…</div>
      ) : appointments.length === 0 ? (
        <div className="card"><EmptyState icon={Calendar} title="No appointments yet" description="Book your first service appointment." /></div>
      ) : (
        <div className="space-y-3">
          {appointments.map(a => (
            <div key={a.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center"><Clock size={18} className="text-sky-600" /></div>
                  <div>
                    <p className="font-semibold text-gray-900">{a.serviceType}</p>
                    <p className="text-sm text-gray-500">{new Date(a.appointmentDate).toLocaleString()}</p>
                  </div>
                </div>
                <span className={statusColors[a.status] || 'badge-gray'}>{a.status}</span>
              </div>
              {a.notes && <p className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">{a.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title="Book Appointment" onClose={() => setModal(false)}>
          {error && <div className="mb-4 p-3 bg-red-50 rounded-xl text-sm text-red-600">{error}</div>}
          <form onSubmit={handleBook} className="space-y-4">
            <div>
              <label className="label">Vehicle</label>
              <select className="input" required value={form.vehicleId} onChange={set('vehicleId')}>
                <option value="">Select vehicle</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} — {v.vehicleNumber}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Appointment Date & Time</label>
              <input className="input" type="datetime-local" required value={form.appointmentDate} onChange={set('appointmentDate')} />
            </div>
            <div>
              <label className="label">Service Type</label>
              <input className="input" required value={form.serviceType} onChange={set('serviceType')} placeholder="e.g. Oil Change, Brake Inspection" maxLength={120} />
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <textarea className="input resize-none" rows={3} value={form.notes} onChange={set('notes')} placeholder="Any additional details…" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Booking…' : 'Book Appointment'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
