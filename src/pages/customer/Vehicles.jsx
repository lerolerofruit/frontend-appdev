import { useState, useEffect } from 'react';
import { getVehicles, addVehicle, updateVehicle } from '../../api/customers';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { Wrench, Plus, Pencil } from 'lucide-react';

const empty = { vehicleNumber: '', make: '', model: '', year: new Date().getFullYear(), vin: '', mileage: 0 };

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try { const r = await getVehicles(); setVehicles(r.data); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setError(''); setModal('create'); };
  const openEdit = (v) => { setForm({ ...v, _id: v.id, vin: v.vin || '' }); setError(''); setModal('edit'); };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { vehicleNumber: form.vehicleNumber, make: form.make, model: form.model, year: parseInt(form.year), vin: form.vin || null, mileage: parseInt(form.mileage || 0) };
      if (modal === 'create') await addVehicle(payload);
      else await updateVehicle(form._id, payload);
      await load(); setModal(null);
    } catch (err) { setError(err.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Vehicles</h1>
          <p className="text-slate-600 mt-1">Manage your vehicle information</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 flex-shrink-0"><Plus size={18} strokeWidth={2.5} /> Add Vehicle</button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading…</div>
      ) : vehicles.length === 0 ? (
        <div className="card"><EmptyState icon={Wrench} title="No vehicles yet" description="Add your first vehicle to get started." /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map(v => (
            <div key={v.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-violet-100 rounded-xl flex items-center justify-center">
                    <Wrench size={20} className="text-violet-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{v.make} {v.model}</p>
                    <p className="text-sm text-gray-500">{v.year}</p>
                  </div>
                </div>
                <button onClick={() => openEdit(v)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil size={14} className="text-gray-400" /></button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-xl p-2.5"><p className="text-xs text-gray-400 mb-0.5">Plate Number</p><p className="font-mono font-semibold text-gray-900">{v.vehicleNumber}</p></div>
                <div className="bg-gray-50 rounded-xl p-2.5"><p className="text-xs text-gray-400 mb-0.5">Mileage</p><p className="font-medium text-gray-900">{v.mileage?.toLocaleString()} km</p></div>
                {v.vin && <div className="bg-gray-50 rounded-xl p-2.5 col-span-2"><p className="text-xs text-gray-400 mb-0.5">VIN</p><p className="font-mono text-xs text-gray-700">{v.vin}</p></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'Add Vehicle' : 'Edit Vehicle'} onClose={() => setModal(null)}>
          {error && <div className="mb-4 p-3 bg-red-50 rounded-xl text-sm text-red-600">{error}</div>}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Vehicle Number</label><input className="input" required value={form.vehicleNumber} onChange={set('vehicleNumber')} placeholder="BA 1 PA 1234" /></div>
              <div><label className="label">Make</label><input className="input" required value={form.make} onChange={set('make')} placeholder="Toyota" /></div>
              <div><label className="label">Model</label><input className="input" required value={form.model} onChange={set('model')} placeholder="Corolla" /></div>
              <div><label className="label">Year</label><input className="input" type="number" required value={form.year} onChange={set('year')} /></div>
              <div><label className="label">Mileage (km)</label><input className="input" type="number" value={form.mileage} onChange={set('mileage')} /></div>
              <div><label className="label">VIN (optional)</label><input className="input" value={form.vin} onChange={set('vin')} /></div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Vehicle'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
