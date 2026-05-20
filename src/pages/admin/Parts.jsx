import { useState, useEffect } from 'react';
import { getParts, createPart, updatePart, updatePartStatus, addStock, deletePart } from '../../api/parts';
import { getVendors } from '../../api/vendors';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { Package, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search } from 'lucide-react';

const empty = { partNumber: '', name: '', description: '', primaryVendorId: '', unitPrice: '', reorderLevel: 10, initialStockQuantity: 0 };

export default function Parts() {
  const [parts, setParts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [stockForm, setStockForm] = useState({ partId: null, partName: '', quantity: 1 });

  const load = async () => {
    setLoading(true);
    try {
      const [p, v] = await Promise.all([getParts(true), getVendors(false)]);
      setParts(p.data);
      setVendors(v.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setError(''); setModal('create'); };
  const openEdit = (p) => {
    setForm({ partNumber: p.partNumber, name: p.name, description: p.description || '', primaryVendorId: p.primaryVendorId || '', unitPrice: p.unitPrice, reorderLevel: p.reorderLevel, initialStockQuantity: p.stockQuantity, _id: p.id });
    setError(''); setModal('edit');
  };
  const openAddStock = (p) => {
    setStockForm({ partId: p.id, partName: p.name, quantity: 1 });
    setError(''); setModal('addStock');
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...form, unitPrice: parseFloat(form.unitPrice), reorderLevel: parseInt(form.reorderLevel), initialStockQuantity: parseInt(form.initialStockQuantity || 0), primaryVendorId: form.primaryVendorId || null };
      if (modal === 'create') await createPart(payload);
      else await updatePart(form._id, payload);
      await load(); setModal(null);
    } catch (err) { setError(err.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleAddStock = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await addStock(stockForm.partId, parseInt(stockForm.quantity));
      await load(); setModal(null);
    } catch (err) { setError(err.response?.data?.message || 'Failed to add stock.'); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (p) => {
    await updatePartStatus(p.id, !p.isActive); await load();
  };
  const handleDelete = async (id) => {
    if (!confirm('Delete this part?')) return;
    await deletePart(id); await load();
  };

  const filtered = parts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.partNumber.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Parts</h1>
          <p className="text-slate-600 mt-1">Manage inventory and vehicle parts</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 flex-shrink-0">
          <Plus size={18} strokeWidth={2.5} /> Add Part
        </button>
      </div>

      <div className="card">
        <div className="relative mb-5">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.5} />
          <input className="input pl-9" placeholder="Search parts…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {loading ? (
          <div className="py-10 text-center text-slate-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Package} title="No parts found" description="Add your first part to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">Part #</th><th className="th">Name</th><th className="th">Vendor</th>
                  <th className="th">Price</th><th className="th">Stock</th><th className="th">Reorder</th>
                  <th className="th">Status</th><th className="th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="tr">
                    <td className="td font-mono text-xs text-gray-500">{p.partNumber}</td>
                    <td className="td font-medium text-gray-900">{p.name}</td>
                    <td className="td text-gray-500">{p.primaryVendorName || '—'}</td>
                    <td className="td">Rs. {p.unitPrice?.toLocaleString()}</td>
                    <td className="td">
                      <span className={p.stockQuantity <= p.reorderLevel ? 'text-amber-600 font-semibold' : ''}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="td">{p.reorderLevel}</td>
                    <td className="td">
                      {p.isActive ? <span className="badge-green">Active</span> : <span className="badge-red">Inactive</span>}
                    </td>
                    <td className="td">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Edit">
                          <Pencil size={14} className="text-gray-500" />
                        </button>
                        <button onClick={() => openAddStock(p)} className="p-1.5 hover:bg-blue-50 rounded-lg" title="Add Stock">
                          <Plus size={14} className="text-blue-500" />
                        </button>
                        <button onClick={() => toggleStatus(p)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Toggle status">
                          {p.isActive ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} className="text-gray-400" />}
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg" title="Delete">
                          <Trash2 size={14} className="text-red-400" />
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
        <Modal title={modal === 'create' ? 'Add Part' : 'Edit Part'} onClose={() => setModal(null)}>
          {error && <div className="mb-4 p-3 bg-red-50 rounded-xl text-sm text-red-600">{error}</div>}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Part Number</label>
                <input className="input" required value={form.partNumber} onChange={set('partNumber')} placeholder="P-001" />
              </div>
              <div>
                <label className="label">Name</label>
                <input className="input" required value={form.name} onChange={set('name')} placeholder="Oil Filter" />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <input className="input" value={form.description} onChange={set('description')} placeholder="Optional description" />
            </div>
            <div>
              <label className="label">Primary Vendor</label>
              <select className="input" value={form.primaryVendorId} onChange={set('primaryVendorId')}>
                <option value="">— None —</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Unit Price</label>
                <input className="input" type="number" step="0.01" required value={form.unitPrice} onChange={set('unitPrice')} placeholder="0.00" />
              </div>
              <div>
                <label className="label">Reorder Level</label>
                <input className="input" type="number" required value={form.reorderLevel} onChange={set('reorderLevel')} />
              </div>
              {modal === 'create' && (
                <div>
                  <label className="label">Initial Stock</label>
                  <input className="input" type="number" value={form.initialStockQuantity} onChange={set('initialStockQuantity')} />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Part'}</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'addStock' && (
        <Modal title={`Add Stock - ${stockForm.partName}`} onClose={() => setModal(null)}>
          {error && <div className="mb-4 p-3 bg-red-50 rounded-xl text-sm text-red-600">{error}</div>}
          <form onSubmit={handleAddStock} className="space-y-4">
            <div>
              <label className="label">Quantity</label>
              <input 
                className="input" 
                type="number" 
                required 
                min="1"
                value={stockForm.quantity} 
                onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })} 
                placeholder="0" 
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Adding…' : 'Add Stock'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
