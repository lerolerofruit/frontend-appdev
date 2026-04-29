import { useState } from 'react';
import { searchCustomers, registerCustomerWithVehicle, getCustomerDetails } from '../../api/customers';
import Modal from '../../components/Modal';
import { Search, Plus, Eye, Car, User } from 'lucide-react';

const emptyForm = {
  fullName: '', email: '', phoneNumber: '', password: '',
  vehicle: { vehicleNumber: '', make: '', model: '', year: new Date().getFullYear(), vin: '', mileage: 0 }
};

export default function StaffCustomers() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const r = await searchCustomers(query);
    setResults(r.data); setSearched(true);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setV = (k) => (e) => setForm({ ...form, vehicle: { ...form.vehicle, [k]: e.target.value } });

  const handleRegister = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...form, vehicle: { ...form.vehicle, year: parseInt(form.vehicle.year), mileage: parseInt(form.vehicle.mileage) } };
      await registerCustomerWithVehicle(payload);
      setModal(null); setForm(emptyForm);
    } catch (err) { setError(err.response?.data?.message || 'Failed to register.'); }
    finally { setSaving(false); }
  };

  const viewDetail = async (id) => {
    const r = await getCustomerDetails(id);
    setDetail(r.data); setModal('detail');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Customers</h1>
          
        </div>
        <button onClick={() => { setForm(emptyForm); setError(''); setModal('register'); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Register Customer
        </button>
      </div>

      <div className="card mb-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search by name or email…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary px-6">Search</button>
        </form>
      </div>

      {searched && (
        <div className="card">
          {results.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No customers found for "{query}"</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr><th className="th">Name</th><th className="th">Email</th><th className="th">Phone</th><th className="th">Actions</th></tr>
              </thead>
              <tbody>
                {results.map(c => (
                  <tr key={c.id} className="tr">
                    <td className="td font-medium text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-600">{c.fullName?.[0]?.toUpperCase()}</div>
                      {c.fullName}
                    </td>
                    <td className="td">{c.email}</td>
                    <td className="td">{c.phoneNumber || '—'}</td>
                    <td className="td">
                      <button onClick={() => viewDetail(c.id)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={14} className="text-gray-500" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modal === 'register' && (
        <Modal title="Register Customer with Vehicle" onClose={() => setModal(null)} size="lg">
          {error && <div className="mb-4 p-3 bg-red-50 rounded-xl text-sm text-red-600">{error}</div>}
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><User size={12} /> Customer Info</p>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Full Name</label><input className="input" required value={form.fullName} onChange={set('fullName')} /></div>
                <div><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={set('email')} /></div>
                <div><label className="label">Phone</label><input className="input" value={form.phoneNumber} onChange={set('phoneNumber')} /></div>
                <div><label className="label">Password</label><input className="input" type="password" required value={form.password} onChange={set('password')} /></div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Car size={12} /> Vehicle Info</p>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Vehicle Number</label><input className="input" required value={form.vehicle.vehicleNumber} onChange={setV('vehicleNumber')} placeholder="BA 1 PA 1234" /></div>
                <div><label className="label">Make</label><input className="input" required value={form.vehicle.make} onChange={setV('make')} placeholder="Toyota" /></div>
                <div><label className="label">Model</label><input className="input" required value={form.vehicle.model} onChange={setV('model')} placeholder="Corolla" /></div>
                <div><label className="label">Year</label><input className="input" type="number" required value={form.vehicle.year} onChange={setV('year')} /></div>
                <div><label className="label">VIN (optional)</label><input className="input" value={form.vehicle.vin} onChange={setV('vin')} /></div>
                <div><label className="label">Mileage</label><input className="input" type="number" value={form.vehicle.mileage} onChange={setV('mileage')} /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Registering…' : 'Register'}</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'detail' && detail && (
        <Modal title="Customer Details" onClose={() => setModal(null)} size="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-lg font-bold text-emerald-600">{detail.fullName?.[0]?.toUpperCase()}</div>
              <div>
                <p className="font-semibold text-gray-900">{detail.fullName}</p>
                <p className="text-sm text-gray-500">{detail.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3"><span className="text-gray-500">Phone:</span> <span className="font-medium ml-1">{detail.phoneNumber || '—'}</span></div>
              <div className="bg-gray-50 rounded-xl p-3"><span className="text-gray-500">Total Spend:</span> <span className="font-semibold ml-1 text-gray-900">Rs. {detail.totalSpend?.toLocaleString()}</span></div>
              <div className="bg-gray-50 rounded-xl p-3"><span className="text-gray-500">Outstanding Credit:</span> <span className={`font-semibold ml-1 ${detail.outstandingCredit > 0 ? 'text-amber-600' : 'text-gray-900'}`}>Rs. {detail.outstandingCredit?.toLocaleString()}</span></div>
            </div>
            {detail.vehicles?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Vehicles</p>
                <div className="space-y-2">
                  {detail.vehicles.map(v => (
                    <div key={v.id} className="bg-gray-50 rounded-xl p-3 text-sm">
                      <span className="font-medium text-gray-900">{v.make} {v.model} {v.year}</span>
                      <span className="ml-2 font-mono text-xs text-gray-500">{v.vehicleNumber}</span>
                      <span className="ml-2 text-gray-400">{v.mileage?.toLocaleString()} km</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
