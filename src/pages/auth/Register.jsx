import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ ...form, role: 'Customer' });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f0fdf9' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold text-slate-900">Create account</h1>
          <p className="text-sm text-slate-500 mt-0.5">Register as a customer</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium text-red-600"
              style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" required className="input" placeholder="John Doe" value={form.fullName} onChange={set('fullName')} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" required className="input" placeholder="name@email.com" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="tel" required className="input" placeholder="98XXXXXXXX" value={form.phoneNumber} onChange={set('phoneNumber')} />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" required className="input" placeholder="Min. 6 chars, one digit" value={form.password} onChange={set('password')} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center"
              style={{ padding: '0.7rem', marginTop: '0.5rem' }}>
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#0d9488' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
