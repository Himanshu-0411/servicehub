import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/shared/Sidebar';
import { providerApi, categoryApi } from '../../api';
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

export default function ProviderProfile() {
  const [profile, setProfile] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    description: '', experienceYears: '', hourlyRate: '',
    credentialInfo: '', isAvailable: true,
    city: '', state: '', serviceCategoryIds: [],
  });

  useEffect(() => {
    Promise.all([providerApi.getMyProfile(), categoryApi.getAll()])
      .then(([p, c]) => {
        const pr = p.data;
        setProfile(pr);
        setAllCategories(c.data || []);
        setForm({
          description: pr.description || '',
          experienceYears: pr.experienceYears || '',
          hourlyRate: pr.hourlyRate || '',
          credentialInfo: pr.credentialInfo || '',
          isAvailable: pr.isAvailable !== false,
          city: pr.city || '',
          state: pr.state || '',
          serviceCategoryIds: pr.serviceCategories?.map(c => c.id) || [],
        });
        setLoading(false);
      })
      .catch(() => { toast.error('Failed to load profile'); setLoading(false); });
  }, []);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const toggleCat = (id) => setForm(p => ({
    ...p,
    serviceCategoryIds: p.serviceCategoryIds.includes(id)
      ? p.serviceCategoryIds.filter(c => c !== id)
      : [...p.serviceCategoryIds, id],
  }));

  const save = async () => {
    if (!form.city) { toast.error('Please select your city'); return; }
    setSaving(true);
    try {
      const updated = await providerApi.updateProfile({
        ...form,
        experienceYears: Number(form.experienceYears),
        hourlyRate: Number(form.hourlyRate),
      });
      setProfile(updated.data);
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">Update your info — changes are visible to customers immediately</p>
          </div>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? '⏳ Saving...' : '💾 Save Changes'}
          </button>
        </div>

        {/* Approval banner */}
        {profile?.approvalStatus === 'PENDING' && (
          <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 12, padding: 14, marginBottom: 24, fontSize: 14, color: '#92400e' }}>
            ⏳ Your account is pending admin approval. Update your profile to improve your chances.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* Basic info */}
          <div className="card">
            <div className="card-header"><h3 style={{ fontWeight: 700 }}>Basic Info</h3></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">About Yourself</label>
                <textarea className="form-control" rows={4}
                  placeholder="Describe your expertise..."
                  value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Experience (yrs)</label>
                  <input className="form-control" type="number" min={0} max={60}
                    value={form.experienceYears} onChange={e => set('experienceYears', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hourly Rate (₹)</label>
                  <input className="form-control" type="number" min={50}
                    value={form.hourlyRate} onChange={e => set('hourlyRate', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Credential Info</label>
                <input className="form-control"
                  placeholder="License No / Certificate details"
                  value={form.credentialInfo} onChange={e => set('credentialInfo', e.target.value)} />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  🔒 Only shared with customers after they make a confirmed booking
                </p>
              </div>

              {/* Availability toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Available for Bookings</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Turn off to pause new bookings</div>
                </div>
                <button
                  type="button"
                  onClick={() => set('isAvailable', !form.isAvailable)}
                  style={{
                    width: 52, height: 28, borderRadius: 100, border: 'none', cursor: 'pointer',
                    background: form.isAvailable ? 'var(--success)' : '#d1d5db',
                    position: 'relative', transition: 'background 0.2s',
                  }}>
                  <span style={{
                    position: 'absolute', top: 3,
                    left: form.isAvailable ? 26 : 3,
                    width: 22, height: 22, background: 'white', borderRadius: '50%',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>
            </div>
          </div>

          {/* Location — key feature */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontWeight: 700 }}>📍 Service Location</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Customers filter providers by city — keep this accurate
              </p>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">City *</label>
                <select className="form-control" value={form.city} onChange={e => set('city', e.target.value)}>
                  <option value="">-- Select City --</option>
                  {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">State *</label>
                <select className="form-control" value={form.state} onChange={e => set('state', e.target.value)}>
                  <option value="">-- Select State --</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Preview */}
              {form.city && (
                <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 10, padding: 14, marginTop: 4 }}>
                  <div style={{ fontSize: 13, color: '#1d4ed8', fontWeight: 600 }}>📍 Your listing will appear for:</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1d4ed8', marginTop: 6 }}>
                    {form.city}{form.state ? `, ${form.state}` : ''}
                  </div>
                  <div style={{ fontSize: 12, color: '#3b82f6', marginTop: 4 }}>
                    Customers searching "{form.city}" will find you
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Service categories */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header">
              <h3 style={{ fontWeight: 700 }}>Services Offered</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Select all categories you can provide</p>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {allCategories.map(cat => (
                  <button type="button" key={cat.id}
                    onClick={() => toggleCat(cat.id)}
                    style={{
                      padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer',
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
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={save} disabled={saving} style={{ padding: '12px 40px', fontSize: 15 }}>
            {saving ? '⏳ Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
