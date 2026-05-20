import { useState, useEffect } from 'react';
import { getSalesInvoices, createSalesInvoice, getSalesInvoice, sendSalesInvoiceEmail } from '../../api/invoices';
import { searchCustomers } from '../../api/customers';
import { getParts } from '../../api/parts';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { FileText, Plus, Eye, Trash2, Search } from 'lucide-react';

const statusColors = { Unpaid: 'badge-red', PartiallyPaid: 'badge-yellow', Paid: 'badge-green', Overdue: 'badge-red' };

export default function SalesInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [emailingId, setEmailingId] = useState(null);
  const [emailMessage, setEmailMessage] = useState('');

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [form, setForm] = useState({
    invoiceNumber: '', isCreditSale: false, creditDueDate: '', invoiceDate: '',
    items: [{ vehiclePartId: '', quantity: 1, discount: 0 }]
  });

  const load = async () => {
    setLoading(true);
    try {
      const [inv, p] = await Promise.all([getSalesInvoices(), getParts(false)]);
      setInvoices(inv.data); setParts(p.data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const searchCustomer = async () => {
    if (!customerSearch.trim()) return;
    const r = await searchCustomers(customerSearch);
    setCustomerResults(r.data);
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { vehiclePartId: '', quantity: 1, discount: 0 }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const setItem = (i, k, v) => {
    const items = [...form.items]; items[i] = { ...items[i], [k]: v }; setForm({ ...form, items });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) { setError('Please select a customer.'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        invoiceNumber: form.invoiceNumber, customerId: selectedCustomer.id,
        isCreditSale: form.isCreditSale, invoiceDate: form.invoiceDate || null,
        creditDueDate: form.isCreditSale && form.creditDueDate ? form.creditDueDate : null,
        items: form.items.map(it => ({ vehiclePartId: it.vehiclePartId, quantity: parseInt(it.quantity), discount: parseFloat(it.discount || 0) }))
      };
      await createSalesInvoice(payload); await load(); setModal(null); setSelectedCustomer(null);
    } catch (err) { setError(err.response?.data?.message || 'Failed to create invoice.'); }
    finally { setSaving(false); }
  };

  const viewDetail = async (id) => {
    const r = await getSalesInvoice(id); setDetail(r.data); setModal('detail');
  };

  // Invoice email sending removed for Milestone 1

  const total = form.items.reduce((s, it) => {
    const part = parts.find(p => p.id === it.vehiclePartId);
    if (!part) return s;
    return s + (part.unitPrice * parseInt(it.quantity || 1)) * (1 - parseFloat(it.discount || 0) / 100);
  }, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sales Invoices</h1>
          
        </div>
        <button onClick={() => {
          setForm({ invoiceNumber: '', isCreditSale: false, creditDueDate: '', invoiceDate: '', items: [{ vehiclePartId: '', quantity: 1, discount: 0 }] });
          setSelectedCustomer(null); setCustomerSearch(''); setCustomerResults([]); setError(''); setModal('create');
        }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Invoice
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="py-10 text-center text-gray-400 text-sm">Loading…</div>
        ) : invoices.length === 0 ? (
          <EmptyState icon={FileText} title="No sales invoices" description="Create your first sales invoice." />
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr><th className="th">Invoice #</th><th className="th">Customer</th><th className="th">Date</th><th className="th">Total</th><th className="th">Status</th><th className="th">Actions</th></tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="tr">
                  <td className="td font-mono text-sm font-semibold text-gray-900">{inv.invoiceNumber}</td>
                  <td className="td">{inv.customerName}</td>
                  <td className="td">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                  <td className="td font-semibold">Rs. {inv.totalAmount?.toLocaleString()}</td>
                  <td className="td"><span className={statusColors[inv.paymentStatus] || 'badge-gray'}>{inv.paymentStatus}</span></td>
                  <td className="td">
                    <div className="flex items-center gap-1">
                      <button onClick={() => viewDetail(inv.id)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={14} className="text-gray-500" /></button>
                      <button disabled={emailingId === inv.id} onClick={async () => {
                        setEmailingId(inv.id); setEmailMessage('');
                        try {
                          await sendSalesInvoiceEmail(inv.id);
                          setEmailMessage('Email sent successfully.');
                        } catch (err) {
                          setEmailMessage(err.response?.data || err.message || 'Failed to send email.');
                        } finally { setEmailingId(null); }
                      }} title="Send invoice by email" className="p-1.5 hover:bg-gray-100 rounded-lg"><FileText size={14} className="text-gray-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal === 'create' && (
        <Modal title="New Sales Invoice" onClose={() => setModal(null)} size="xl">
          {error && <div className="mb-4 p-3 bg-red-50 rounded-xl text-sm text-red-600">{error}</div>}
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Invoice Number</label>
                <input className="input" required value={form.invoiceNumber} onChange={e => setForm({ ...form, invoiceNumber: e.target.value })} placeholder="SINV-001" />
              </div>
              <div>
                <label className="label">Invoice Date</label>
                <input className="input" type="datetime-local" value={form.invoiceDate} onChange={e => setForm({ ...form, invoiceDate: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="label">Customer</label>
              {selectedCustomer ? (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                  <div className="w-8 h-8 bg-emerald-200 rounded-full flex items-center justify-center text-sm font-bold text-emerald-700">{selectedCustomer.fullName?.[0]?.toUpperCase()}</div>
                  <div className="flex-1 text-sm"><p className="font-medium text-gray-900">{selectedCustomer.fullName}</p><p className="text-gray-500">{selectedCustomer.email}</p></div>
                  <button type="button" onClick={() => setSelectedCustomer(null)} className="text-xs text-red-500 hover:text-red-600">Change</button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2 mb-2">
                    <input className="input" placeholder="Search customer by name/email…" value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchCustomer())} />
                    <button type="button" onClick={searchCustomer} className="btn-secondary btn-sm px-4 flex items-center gap-1.5"><Search size={14} />Search</button>
                  </div>
                  {customerResults.length > 0 && (
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                      {customerResults.map(c => (
                        <button key={c.id} type="button" onClick={() => { setSelectedCustomer(c); setCustomerResults([]); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0">
                          <span className="font-medium text-gray-900">{c.fullName}</span>
                          <span className="ml-2 text-gray-400">{c.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="credit" className="rounded" checked={form.isCreditSale} onChange={e => setForm({ ...form, isCreditSale: e.target.checked })} />
              <label htmlFor="credit" className="text-sm font-medium text-gray-700">Credit Sale</label>
              {form.isCreditSale && (
                <div className="ml-4 flex-1">
                  <input className="input" type="datetime-local" placeholder="Credit due date" value={form.creditDueDate} onChange={e => setForm({ ...form, creditDueDate: e.target.value })} />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Items</label>
                <button type="button" onClick={addItem} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">+ Add item</button>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 font-medium px-1">
                  <div className="col-span-5">Part</div><div className="col-span-2">Qty</div><div className="col-span-2">Disc %</div><div className="col-span-2">Price</div>
                </div>
                {form.items.map((item, i) => {
                  const part = parts.find(p => p.id === item.vehiclePartId);
                  const lineTotal = part ? (part.unitPrice * parseInt(item.quantity || 1)) * (1 - parseFloat(item.discount || 0) / 100) : 0;
                  return (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <select className="input text-xs" required value={item.vehiclePartId} onChange={e => setItem(i, 'vehiclePartId', e.target.value)}>
                          <option value="">Select part</option>
                          {parts.map(p => <option key={p.id} value={p.id}>{p.name} (Rs.{p.unitPrice})</option>)}
                        </select>
                      </div>
                      <div className="col-span-2"><input className="input text-xs" type="number" min="1" required value={item.quantity} onChange={e => setItem(i, 'quantity', e.target.value)} /></div>
                      <div className="col-span-2"><input className="input text-xs" type="number" min="0" max="100" value={item.discount} onChange={e => setItem(i, 'discount', e.target.value)} /></div>
                      <div className="col-span-2 text-xs text-gray-600 font-medium">Rs.{lineTotal.toFixed(0)}</div>
                      <div className="col-span-1">{form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-400" /></button>}</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 text-right text-sm font-bold text-gray-900">Total: Rs. {total.toFixed(2)}</div>
              {/** Loyalty discount display */}
              <div className="mt-2 text-right text-sm text-gray-700">Subtotal: Rs. {total.toFixed(2)}</div>
              <div className="mt-1 text-right text-sm text-gray-700">Discount: Rs. {(total > 5000 ? (total * 0.1) : 0).toFixed(2)}</div>
              <div className="mt-1 text-right text-sm font-bold text-gray-900">Final total: Rs. {(total > 5000 ? (total * 0.9) : total).toFixed(2)}</div>
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
              <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3"><span className="text-gray-500">Customer:</span><span className="font-medium ml-1">{detail.customerName}</span></div>
              <div className="bg-gray-50 rounded-xl p-3"><span className="text-gray-500">Date:</span><span className="font-medium ml-1">{new Date(detail.invoiceDate).toLocaleDateString()}</span></div>
              <div className="bg-gray-50 rounded-xl p-3"><span className="text-gray-500">Total:</span><span className="font-bold ml-1 text-gray-900">Rs. {detail.totalAmount?.toLocaleString()}</span></div>
              <div className="bg-gray-50 rounded-xl p-3"><span className="text-gray-500">Subtotal:</span><span className="font-medium ml-1">Rs. {detail.subtotalAmount?.toLocaleString ? detail.subtotalAmount?.toLocaleString() : detail.subtotalAmount}</span></div>
              <div className="bg-gray-50 rounded-xl p-3"><span className="text-gray-500">Discount:</span><span className="font-medium ml-1">Rs. {detail.loyaltyDiscountAmount?.toLocaleString ? detail.loyaltyDiscountAmount?.toLocaleString() : detail.loyaltyDiscountAmount}</span></div>
              <div className="bg-gray-50 rounded-xl p-3"><span className="text-gray-500">Status:</span><span className={`ml-1 ${statusColors[detail.paymentStatus]}`}>{detail.paymentStatus}</span></div>
              {detail.isCreditSale && <div className="bg-amber-50 rounded-xl p-3 col-span-2"><span className="text-amber-600 font-medium">Credit Sale</span>{detail.creditDueDate && <span className="text-amber-500 ml-1 text-xs">— due {new Date(detail.creditDueDate).toLocaleDateString()}</span>}</div>}
            </div>
            <table className="w-full">
              <thead className="bg-gray-50"><tr><th className="th">Part</th><th className="th">Qty</th><th className="th">Price</th><th className="th">Discount</th><th className="th">Total</th></tr></thead>
              <tbody>
                {detail.items?.map(item => (
                  <tr key={item.id} className="tr">
                    <td className="td">{item.partName || item.vehiclePartId}</td>
                    <td className="td">{item.quantity}</td>
                    <td className="td">Rs. {item.unitPrice?.toLocaleString()}</td>
                    <td className="td">{item.discount}%</td>
                    <td className="td font-medium">Rs. {item.lineTotal?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex items-center justify-end gap-3">
              <button disabled={emailingId === detail.id} onClick={async () => {
                setEmailingId(detail.id); setEmailMessage('');
                try { await sendSalesInvoiceEmail(detail.id); setEmailMessage('Email sent successfully.'); }
                catch (err) { setEmailMessage(err.response?.data || err.message || 'Failed to send email.'); }
                finally { setEmailingId(null); }
              }} className="btn-secondary">{emailingId === detail.id ? 'Sending…' : 'Send Email'}</button>
              {emailMessage && <div className="text-sm text-gray-600">{emailMessage}</div>}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
