import { useState, useEffect } from 'react';
import { getVendors, createVendor, updateVendor, updateVendorStatus } from '../../api/vendors';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { Building2, Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';

const empty = { name: '', contactPerson: '', email: '', phoneNumber: '', address: '' };

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try { const r = await getVendors(true); setVendors(r.data); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setError(''); setModal('create'); };
  const openEdit = (v) => { setForm({ ...v, _id: v.id }); setError(''); setModal('edit'); };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { name: form.name, contactPerson: form.contactPerson || null, email: form.email || null, phoneNumber: form.phoneNumber || null, address: form.address || null };
      if (modal === 'create') await createVendor(payload);
      else await updateVendor(form._id, payload);
      await load(); setModal(null);
    } catch (err) { setError(err.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (v) => { await updateVendorStatus(v.id, !v.isActive); await load(); };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Vendors</h1>
          <p className="text-slate-600 mt-1">Manage supplier and vendor information</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 flex-shrink-0">
          <Plus size={18} strokeWidth={2.5} /> Add Vendor
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="py-10 text-center text-gray-400 text-sm">Loading…</div>
        ) : vendors.length === 0 ? (
          <EmptyState icon={Building2} title="No vendors yet" description="Add your first vendor to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th">Name</th><th className="th">Contact</th><th className="th">Email</th>
                  <th className="th">Phone</th><th className="th">Status</th><th className="th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map(v => (
                  <tr key={v.id} className="tr">
                    <td className="td font-medium text-gray-900">{v.name}</td>
                    <td className="td">{v.contactPerson || '—'}</td>
                    <td className="td">{v.email || '—'}</td>
                    <td className="td">{v.phoneNumber || '—'}</td>
                    <td className="td">{v.isActive ? <span className="badge-green">Active</span> : <span className="badge-red">Inactive</span>}</td>
                    <td className="td">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(v)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil size={14} className="text-gray-500" /></button>
                        <button onClick={() => toggleStatus(v)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                          {v.isActive ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} className="text-gray-400" />}
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

      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'Add Vendor' : 'Edit Vendor'} onClose={() => setModal(null)}>
          {error && <div className="mb-4 p-3 bg-red-50 rounded-xl text-sm text-red-600">{error}</div>}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label">Vendor Name *</label>
              <input className="input" required value={form.name} onChange={set('name')} placeholder="AutoParts Co." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Contact Person</label>
                <input className="input" value={form.contactPerson} onChange={set('contactPerson')} placeholder="Jane Smith" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phoneNumber} onChange={set('phoneNumber')} placeholder="+1 234 567 8900" />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="vendor@email.com" />
            </div>
            <div>
              <label className="label">Address</label>
              <input className="input" value={form.address} onChange={set('address')} placeholder="123 Main St" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Vendor'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
