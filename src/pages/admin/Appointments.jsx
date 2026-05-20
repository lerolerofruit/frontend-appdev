import { useState, useEffect } from 'react';
import { getAllAppointments, updateAppointmentStatus } from '../../api/appointments';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { Calendar, CheckCircle, Clock, AlertCircle, Filter } from 'lucide-react';

const statusColors = {
  Pending: 'badge-yellow',
  Confirmed: 'badge-blue',
  Completed: 'badge-green',
  Cancelled: 'badge-red'
};

const statusOptions = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'completed', 'cancelled'
  const [modal, setModal] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const response = await getAllAppointments();
      setAppointments(response.data);
      applyFilter(response.data, filter);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    applyFilter(appointments, filter);
  }, [filter, appointments]);

  const applyFilter = (data, filterType) => {
    if (filterType === 'all') {
      setFilteredAppointments(data);
    } else {
      setFilteredAppointments(
        data.filter(a => a.status.toLowerCase() === filterType.toLowerCase())
      );
    }
  };

  const openStatusUpdate = (a) => {
    setSelectedAppointment(a);
    setNewStatus(a.status);
    setError('');
    setModal('updateStatus');
  };

  const openDetail = (a) => {
    setSelectedAppointment(a);
    setModal('detail');
  };

  const handleUpdateStatus = async () => {
    if (newStatus === selectedAppointment.status) {
      setModal(null);
      return;
    }

    setSaving(true);
    setError('');
    try {
      await updateAppointmentStatus(selectedAppointment.id, { status: newStatus });
      await load();
      setModal(null);
      setSelectedAppointment(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment status.');
    } finally {
      setSaving(false);
    }
  };

  const getPendingCount = () => appointments.filter(a => a.status === 'Pending').length;
  const getConfirmedCount = () => appointments.filter(a => a.status === 'Confirmed').length;
  const getCompletedCount = () => appointments.filter(a => a.status === 'Completed').length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Service Appointments</h1>
        <p className="text-slate-600 mt-1">View and manage all customer service booking requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Total Appointments</p>
          <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{getPendingCount()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Confirmed</p>
          <p className="text-3xl font-bold text-blue-600">{getConfirmedCount()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-600">{getCompletedCount()}</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading…</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Calendar}
            title={filter === 'all' ? 'No appointments' : `No ${filter} appointments`}
            description={
              filter === 'all'
                ? 'No service appointments have been booked yet.'
                : `No appointments with ${filter} status.`
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map(a => (
            <div key={a.id} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Appointment Details */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock size={20} className="text-sky-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 truncate">{a.serviceType}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {formatDate(a.appointmentDate)} at {formatTime(a.appointmentDate)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 text-sm">
                      {a.customer && (
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-900">{a.customer.name}</span> •{' '}
                          {a.customer.email}
                        </p>
                      )}
                      {a.vehicle && (
                        <p className="text-gray-600">
                          Vehicle: <span className="font-medium">{a.vehicle.make} {a.vehicle.model}</span> ({a.vehicle.vehicleNumber})
                        </p>
                      )}
                    </div>
                    {a.notes && (
                      <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                        {a.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 lg:flex-shrink-0">
                  <span className={statusColors[a.status] || 'badge-gray'}>{a.status}</span>
                  <button
                    onClick={() => openDetail(a)}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => openStatusUpdate(a)}
                    className="px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <CheckCircle size={14} /> Update
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Details Modal */}
      {modal === 'detail' && selectedAppointment && (
        <Modal title="Appointment Details" onClose={() => setModal(null)}>
          <div className="space-y-6">
            {/* Appointment Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Appointment Details</h3>
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600 font-semibold mb-1">SERVICE TYPE</p>
                  <p className="text-sm font-medium text-gray-900">{selectedAppointment.serviceType}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">DATE</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(selectedAppointment.appointmentDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">TIME</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatTime(selectedAppointment.appointmentDate)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">STATUS</p>
                  <p className={`inline-block ${statusColors[selectedAppointment.status]}`}>
                    {selectedAppointment.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            {selectedAppointment.customer && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{selectedAppointment.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{selectedAppointment.customer.email}</p>
                  </div>
                  {selectedAppointment.customer.phone && (
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.customer.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vehicle Info */}
            {selectedAppointment.vehicle && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Vehicle Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div>
                    <p className="text-gray-500">Vehicle</p>
                    <p className="font-medium text-gray-900">
                      {selectedAppointment.vehicle.make} {selectedAppointment.vehicle.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Plate Number</p>
                    <p className="font-medium text-gray-900">{selectedAppointment.vehicle.vehicleNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Year</p>
                    <p className="font-medium text-gray-900">{selectedAppointment.vehicle.year}</p>
                  </div>
                  {selectedAppointment.vehicle.mileage && (
                    <div>
                      <p className="text-gray-500">Mileage</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.vehicle.mileage?.toLocaleString()} km</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedAppointment.notes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Notes</h3>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                  {selectedAppointment.notes}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setModal(null)} className="btn-secondary">
                Close
              </button>
              <button
                onClick={() => {
                  setModal('updateStatus');
                  setNewStatus(selectedAppointment.status);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <CheckCircle size={16} /> Update Status
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Update Status Modal */}
      {modal === 'updateStatus' && selectedAppointment && (
        <Modal title="Update Appointment Status" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Appointment: <span className="font-semibold">{selectedAppointment.serviceType}</span>
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(selectedAppointment.appointmentDate)} at{' '}
                {formatTime(selectedAppointment.appointmentDate)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-3">
                Current Status: <span className={`${statusColors[selectedAppointment.status]}`}>
                  {selectedAppointment.status}
                </span>
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
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
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={saving || newStatus === selectedAppointment.status}
                className="btn-primary"
              >
                {saving ? 'Updating…' : 'Update Status'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
