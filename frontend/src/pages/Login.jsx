import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form);
      toast.success(`Welcome back, ${data.fullName}!`);
      if (data.role === 'ADMIN') navigate('/admin');
      else if (data.role === 'PROVIDER') navigate('/provider');
      else navigate('/user');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">⚡ Service<span>Hub</span></div>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email" className="form-control" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password" className="form-control" placeholder="••••••••"
              value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? '⏳ Signing in...' : '→ Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register as User</Link>
          {' · '}
          <Link to="/register/provider" style={{ color: 'var(--accent)', fontWeight: 600 }}>Join as Provider</Link>
        </div>

        <div style={{ marginTop: 20, padding: 14, background: '#f0f7ff', borderRadius: 10, fontSize: 13 }}>
          <strong>Demo Admin:</strong> admin@servicehub.com / Admin@123
        </div>
      </div>
    </div>
  );
}
