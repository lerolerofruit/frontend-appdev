import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../../api/customers';
import { getAppointments } from '../../api/appointments';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import { Calendar, Pencil } from 'lucide-react';

export default function CustomerDashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ appointments: 0 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ fullName: '', phoneNumber: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([getProfile(), getAppointments()]);
      setProfile(p.data);
      setStats({ appointments: a.data.length });
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleUpdate = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await updateProfile(form); await load(); setModal(false); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="py-16 text-center text-sm text-slate-400">Loading…</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Welcome, {profile?.fullName.split(' ')[0]}</h1>
        <p className="text-slate-600 mt-1">Manage your appointments and account information</p>
      </div>

      {/* Profile */}
      <div className="card mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-lg flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)' }}>
            {profile?.fullName?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-lg text-slate-900">{profile?.fullName}</p>
            <p className="text-sm text-slate-500 mt-1">{profile?.email}</p>
            {profile?.phoneNumber && <p className="text-sm text-slate-500">{profile.phoneNumber}</p>}
          </div>
          {profile?.outstandingCredit > 0 && (
            <div className="text-right flex-shrink-0 bg-amber-50 rounded-lg p-3">
              <p className="text-xs text-slate-600 font-medium mb-1">Outstanding Credit</p>
              <p className="font-bold text-amber-600">Rs. {profile.outstandingCredit.toLocaleString()}</p>
            </div>
          )}
          <button onClick={() => { setForm({ fullName: profile.fullName, phoneNumber: profile.phoneNumber || '' }); setModal(true); }}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
            <Pencil size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StatCard label="Appointments" value={stats.appointments} icon={Calendar} color="cyan" />
      </div>

      {modal && (
        <Modal title="Edit Profile" onClose={() => setModal(false)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div><label className="label">Full Name</label><input className="input" required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
            <div><label className="label">Phone</label><input className="input" value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} /></div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
