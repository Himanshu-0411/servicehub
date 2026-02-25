import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi, categoryApi } from '../api';
import toast from 'react-hot-toast';

const INDIAN_CITIES = [
  'Ahmedabad','Bengaluru','Bhopal','Chennai','Coimbatore','Delhi','Faridabad',
  'Ghaziabad','Gurugram','Hyderabad','Indore','Jaipur','Kanpur','Kochi','Kolkata',
  'Lucknow','Ludhiana','Mumbai','Nagpur','Nashik','Patna','Pune','Rajkot','Surat',
  'Thane','Vadodara','Varanasi','Visakhapatnam'
].sort();

const STATES = [
  'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra',
  'Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand',
  'West Bengal'
].sort();

export default function RegisterProvider() {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '',
    description: '', experienceYears: '', hourlyRate: '',
    credentialInfo: '', city: '', state: '',
    serviceCategoryIds: [],
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [catError, setCatError] = useState(false);

  useEffect(() => {
    categoryApi.getAll()
      .then(r => { 
        const cats = r.data || [];
        setCategories(cats);
        if (cats.length === 0) setCatError(true);
      })
      .catch(() => setCatError(true));
  }, []);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const toggleCategory = (id) => {
    setForm(p => ({
      ...p,
      serviceCategoryIds: p.serviceCategoryIds.includes(id)
        ? p.serviceCategoryIds.filter(c => c !== id)
        : [...p.serviceCategoryIds, id],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.city) { toast.error('Please select your city'); return; }
    if (form.serviceCategoryIds.length === 0) { toast.error('Please select at least one service category'); return; }
    setLoading(true);
    try {
      const res = await authApi.registerProvider({
        ...form,
        experienceYears: Number(form.experienceYears) || 0,
        hourlyRate: Number(form.hourlyRate) || 0,
      });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('user', JSON.stringify({ id: res.data.userId, email: res.data.email, fullName: res.data.fullName, role: res.data.role }));
      toast.success('Registered! Your account is pending admin approval.');
      navigate('/provider/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 600, background: 'white', borderRadius: 20, padding: 40, boxShadow: '0 4px 40px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--primary)' }}>ServiceHub</h1>
          </Link>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>Register as a Provider</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Fill in your details to start offering services</p>
        </div>

        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-control" required placeholder="Ramesh Kumar"
                value={form.fullName} onChange={e => set('fullName', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input className="form-control" required placeholder="9876543210"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Email *</label>
              <input className="form-control" type="email" required placeholder="ramesh@example.com"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Password *</label>
              <input className="form-control" type="password" required minLength={6} placeholder="Min 6 characters"
                value={form.password} onChange={e => set('password', e.target.value)} />
            </div>

            {/* Location — the key feature */}
            <div className="form-group">
              <label className="form-label">City * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(where you offer service)</span></label>
              <select className="form-control" required value={form.city} onChange={e => set('city', e.target.value)}>
                <option value="">-- Select City --</option>
                {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">State *</label>
              <select className="form-control" required value={form.state} onChange={e => set('state', e.target.value)}>
                <option value="">-- Select State --</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Experience (years) *</label>
              <input className="form-control" type="number" required min={0} max={60} placeholder="5"
                value={form.experienceYears} onChange={e => set('experienceYears', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Hourly Rate (₹) *</label>
              <input className="form-control" type="number" required min={50} placeholder="500"
                value={form.hourlyRate} onChange={e => set('hourlyRate', e.target.value)} />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">About Yourself</label>
              <textarea className="form-control" rows={3}
                placeholder="Describe your expertise and services..."
                value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Credential Info</label>
              <input className="form-control"
                placeholder="License No / Certificate / Other credentials"
                value={form.credentialInfo} onChange={e => set('credentialInfo', e.target.value)} />
            </div>
          </div>

          {/* Service categories */}
          <div className="form-group">
            <label className="form-label">Service Categories * <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(select all that apply)</span></label>
            {catError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginTop: 8, fontSize: 13, color: '#dc2626' }}>
                ⚠️ Could not load categories — make sure the backend is running on port 8080
              </div>
            )}
            {!catError && categories.length === 0 && (
              <div style={{ padding: '10px 0', color: 'var(--text-muted)', fontSize: 13 }}>⏳ Loading categories...</div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {categories.map(cat => (
                <button type="button" key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  style={{
                    padding: '7px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    border: form.serviceCategoryIds.includes(cat.id) ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                    background: form.serviceCategoryIds.includes(cat.id) ? 'var(--primary)' : 'white',
                    color: form.serviceCategoryIds.includes(cat.id) ? 'white' : 'var(--text)',
                    transition: 'all 0.15s',
                  }}>
                  {form.serviceCategoryIds.includes(cat.id) ? '✓ ' : ''}{cat.name}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8, padding: '14px' }} disabled={loading}>
            {loading ? '⏳ Registering...' : 'Create Provider Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--text-muted)', background: '#f8fafc', padding: '8px 12px', borderRadius: 8 }}>
          📋 Your account will be reviewed and approved by an admin before you can receive bookings.
        </p>
      </div>
    </div>
  );
}
