import { useState, useEffect } from 'react';
import { getStaff, registerStaff, updateStaffStatus, updateStaffRole } from '../../api/auth';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { Users, Plus, ToggleLeft, ToggleRight, ShieldCheck } from 'lucide-react';

const empty = { fullName: '', email: '', phoneNumber: '', password: '', role: 'Staff' };

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try { const r = await getStaff(); setStaff(r.data); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await registerStaff(form); await load(); setModal(false); setForm(empty);
    } catch (err) { setError(err.response?.data?.message || 'Failed to register staff.'); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (s) => { await updateStaffStatus(s.id, !s.isActive); await load(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Staff</h1>
          
        </div>
        <button onClick={() => { setForm(empty); setError(''); setModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="py-10 text-center text-gray-400 text-sm">Loading…</div>
        ) : staff.length === 0 ? (
          <EmptyState icon={Users} title="No staff yet" description="Register your first staff member." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th">Name</th><th className="th">Email</th><th className="th">Phone</th>
                  <th className="th">Role</th><th className="th">Status</th><th className="th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id} className="tr">
                    <td className="td font-medium text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                        {s.fullName?.[0]?.toUpperCase()}
                      </div>
                      {s.fullName}
                    </td>
                    <td className="td">{s.email}</td>
                    <td className="td">{s.phoneNumber || '—'}</td>
                    <td className="td">
                      <span className={s.role === 'Admin' ? 'badge-purple' : 'badge-blue'}>{s.role}</span>
                    </td>
                    <td className="td">{s.isActive ? <span className="badge-green">Active</span> : <span className="badge-red">Inactive</span>}</td>
                    <td className="td">
                      <button onClick={() => toggleStatus(s)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        {s.isActive ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} className="text-gray-400" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal title="Register Staff" onClose={() => setModal(false)}>
          {error && <div className="mb-4 p-3 bg-red-50 rounded-xl text-sm text-red-600">{error}</div>}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" required value={form.fullName} onChange={set('fullName')} placeholder="Jane Smith" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" required value={form.email} onChange={set('email')} placeholder="staff@email.com" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phoneNumber} onChange={set('phoneNumber')} placeholder="+1 234 567 8900" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" required value={form.password} onChange={set('password')} placeholder="••••••••" />
              </div>
              <div>
                <label className="label">Role</label>
                <select className="input" value={form.role} onChange={set('role')}>
                  <option value="Staff">Staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Registering…' : 'Register Staff'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
