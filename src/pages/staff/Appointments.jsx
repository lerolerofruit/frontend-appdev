import { useState, useEffect } from 'react';
import { getStaffAppointments, updateStaffAppointmentStatus, deleteStaffAppointment } from '../../api/appointments';
import { Calendar, User, FileText, Trash2, Edit2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function StaffAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await getStaffAppointments();
      setAppointments(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (appointment) => {
    setEditingId(appointment.id);
    setEditData({
      status: appointment.status,
      serviceNotes: appointment.serviceNotes || '',
    });
    setShowModal(true);
  };

  const handleStatusChange = (status) => {
    setEditData({ ...editData, status });
  };

  const handleSaveStatus = async () => {
    try {
      await updateStaffAppointmentStatus(editingId, {
        status: editData.status,
        serviceNotes: editData.serviceNotes,
      });
      setSuccess('Appointment updated successfully');
      setShowModal(false);
      loadAppointments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await deleteStaffAppointment(id);
        setSuccess('Appointment deleted successfully');
        loadAppointments();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete appointment');
      }
    }
  };

  const statusOptions = [
    { value: 1, label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 2, label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 3, label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 4, label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  ];

  const getStatusColor = (status) => {
    const found = statusOptions.find(s => s.value === status);
    return found ? found.color : 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const found = statusOptions.find(s => s.value === status);
    return found ? found.label : 'Unknown';
  };

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(a => a.status.toString() === filter);

  const upcomingCount = appointments.filter(a => a.status === 1 || a.status === 2).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Booking Requests</h1>
        <p className="text-slate-600 mt-1">Manage customer service appointments and booking requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Bookings</p>
              <p className="text-2xl font-bold text-slate-900">{appointments.length}</p>
            </div>
            <Calendar size={32} className="text-teal-500" strokeWidth={1.5} />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending/Confirmed</p>
              <p className="text-2xl font-bold text-yellow-600">{upcomingCount}</p>
            </div>
            <AlertCircle size={32} className="text-yellow-500" strokeWidth={1.5} />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{appointments.filter(a => a.status === 3).length}</p>
            </div>
            <CheckCircle size={32} className="text-green-500" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Filter */}
      <div className="card mb-6">
        <div className="flex gap-2 flex-wrap p-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-teal-100 text-teal-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {statusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value.toString())}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === option.value.toString()
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="card p-8 text-center text-slate-500">
          <p>Loading appointments...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">
          <Calendar size={32} className="mx-auto mb-2 text-slate-300" strokeWidth={1.5} />
          <p>No appointments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map(appointment => (
            <div key={appointment.id} className="card overflow-hidden">
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  {/* Customer Info */}
                  <div>
                    <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold mb-1">Customer</p>
                    <p className="text-sm font-semibold text-slate-900">{appointment.customerName}</p>
                    <p className="text-xs text-slate-500 mt-1">{appointment.customerEmail}</p>
                  </div>

                  {/* Vehicle & Service */}
                  <div>
                    <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold mb-1">Vehicle & Service</p>
                    <p className="text-sm font-semibold text-slate-900">{appointment.vehicleNumber}</p>
                    <p className="text-xs text-slate-500 mt-1">{appointment.serviceType}</p>
                  </div>

                  {/* Date & Time */}
                  <div>
                    <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold mb-1">Appointment Date</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(appointment.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {(appointment.notes || appointment.serviceNotes) && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-600 font-semibold mb-2">Notes</p>
                    {appointment.notes && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-slate-700">Customer Notes:</p>
                        <p className="text-sm text-slate-600 mt-1">{appointment.notes}</p>
                      </div>
                    )}
                    {appointment.serviceNotes && (
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Service Notes:</p>
                        <p className="text-sm text-slate-600 mt-1">{appointment.serviceNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(appointment)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors"
                  >
                    <Edit2 size={16} />
                    Update Status
                  </button>
                  <button
                    onClick={() => handleDelete(appointment.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Update Appointment Status</h3>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
              <select
                value={editData.status}
                onChange={(e) => handleStatusChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Service Notes / Comments</label>
              <textarea
                value={editData.serviceNotes}
                onChange={(e) => setEditData({ ...editData, serviceNotes: e.target.value })}
                placeholder="Add notes about the service performed..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                rows="4"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
