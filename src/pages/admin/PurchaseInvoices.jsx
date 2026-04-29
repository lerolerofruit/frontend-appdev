import { useState, useEffect } from 'react';
import { getPurchaseInvoices, createPurchaseInvoice, getPurchaseInvoice } from '../../api/invoices';
import { getVendors } from '../../api/vendors';
import { getParts } from '../../api/parts';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { FileText, Plus, Eye, Trash2 } from 'lucide-react';

const emptyItem = { vehiclePartId: '', quantity: 1, unitCost: '' };

export default function PurchaseInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ invoiceNumber: '', vendorId: '', invoiceDate: '', items: [{ ...emptyItem }] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [inv, v, p] = await Promise.all([getPurchaseInvoices(), getVendors(false), getParts(false)]);
      setInvoices(inv.data); setVendors(v.data); setParts(p.data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { ...emptyItem }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const setItem = (i, k, v) => {
    const items = [...form.items];
    items[i] = { ...items[i], [k]: v };
    if (k === 'vehiclePartId') {
      const part = parts.find(p => p.id === v);
      if (part) items[i].unitCost = part.unitPrice;
    }
    setForm({ ...form, items });
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = {
        invoiceNumber: form.invoiceNumber, vendorId: form.vendorId,
        invoiceDate: form.invoiceDate || null,
        items: form.items.map(it => ({ vehiclePartId: it.vehiclePartId, quantity: parseInt(it.quantity), unitCost: parseFloat(it.unitCost) }))
      };
      await createPurchaseInvoice(payload); await load(); setModal(null);
    } catch (err) { setError(err.response?.data?.message || 'Failed to create invoice.'); }
    finally { setSaving(false); }
  };

  const viewDetail = async (id) => {
    const r = await getPurchaseInvoice(id);
    setDetail(r.data); setModal('detail');
  };

  const total = form.items.reduce((s, it) => s + (parseFloat(it.unitCost || 0) * parseInt(it.quantity || 0)), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Purchase Invoices</h1>
          
        </div>
        <button onClick={() => { setForm({ invoiceNumber: '', vendorId: '', invoiceDate: '', items: [{ ...emptyItem }] }); setError(''); setModal('create'); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Invoice
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="py-10 text-center text-gray-400 text-sm">Loading…</div>
        ) : invoices.length === 0 ? (
          <EmptyState icon={FileText} title="No purchase invoices" description="Create your first purchase invoice." />
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="th">Invoice #</th><th className="th">Vendor</th>
                <th className="th">Date</th><th className="th">Total</th><th className="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="tr">
                  <td className="td font-mono text-sm font-semibold text-gray-900">{inv.invoiceNumber}</td>
                  <td className="td">{inv.vendorName}</td>
                  <td className="td">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                  <td className="td font-semibold">Rs. {inv.totalAmount?.toLocaleString()}</td>
                  <td className="td">
                    <button onClick={() => viewDetail(inv.id)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={14} className="text-gray-500" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal === 'create' && (
        <Modal title="New Purchase Invoice" onClose={() => setModal(null)} size="lg">
          {error && <div className="mb-4 p-3 bg-red-50 rounded-xl text-sm text-red-600">{error}</div>}
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Invoice Number</label>
                <input className="input" required value={form.invoiceNumber} onChange={e => setForm({ ...form, invoiceNumber: e.target.value })} placeholder="INV-001" />
              </div>
              <div>
                <label className="label">Vendor</label>
                <select className="input" required value={form.vendorId} onChange={e => setForm({ ...form, vendorId: e.target.value })}>
                  <option value="">Select vendor</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Invoice Date</label>
                <input className="input" type="datetime-local" value={form.invoiceDate} onChange={e => setForm({ ...form, invoiceDate: e.target.value })} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Items</label>
                <button type="button" onClick={addItem} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">+ Add item</button>
              </div>
              <div className="space-y-2">
                {form.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <select className="input text-xs" required value={item.vehiclePartId} onChange={e => setItem(i, 'vehiclePartId', e.target.value)}>
                        <option value="">Select part</option>
                        {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <input className="input text-xs" type="number" min="1" required value={item.quantity} onChange={e => setItem(i, 'quantity', e.target.value)} placeholder="Qty" />
                    </div>
                    <div className="col-span-3">
                      <input className="input text-xs" type="number" step="0.01" required value={item.unitCost} onChange={e => setItem(i, 'unitCost', e.target.value)} placeholder="Cost" />
                    </div>
                    <div className="col-span-1">
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} className="p-1 hover:bg-red-50 rounded-lg"><Trash2 size={13} className="text-red-400" /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-right text-sm font-semibold text-gray-900">
                Total: Rs. {total.toLocaleString()}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating…' : 'Create Invoice'}</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'detail' && detail && (
        <Modal title={`Invoice: ${detail.invoiceNumber}`} onClose={() => setModal(null)} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Vendor:</span> <span className="font-medium ml-1">{detail.vendorName}</span></div>
              <div><span className="text-gray-500">Date:</span> <span className="font-medium ml-1">{new Date(detail.invoiceDate).toLocaleDateString()}</span></div>
              <div><span className="text-gray-500">Total:</span> <span className="font-semibold ml-1 text-gray-900">Rs. {detail.totalAmount?.toLocaleString()}</span></div>
            </div>
            <table className="w-full mt-4">
              <thead className="bg-gray-50">
                <tr><th className="th">Part</th><th className="th">Qty</th><th className="th">Unit Cost</th><th className="th">Line Total</th></tr>
              </thead>
              <tbody>
                {detail.items?.map(item => (
                  <tr key={item.id} className="tr">
                    <td className="td">{item.vehiclePartName || item.vehiclePartId}</td>
                    <td className="td">{item.quantity}</td>
                    <td className="td">Rs. {item.unitCost?.toLocaleString()}</td>
                    <td className="td font-medium">Rs. {item.lineTotal?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
}
