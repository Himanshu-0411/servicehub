import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import { providerApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      providerApi.getMyProfile(),
      providerApi.getMyBookings({ size: 5 }),
    ])
      .then(([p, b]) => {
        setProfile(p.data);
        const data = b.data;
        setBookings(Array.isArray(data) ? data : (data.content || []));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statusStyles = {
    PENDING:     { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
    CONFIRMED:   { bg: '#dbeafe', color: '#2563eb', label: 'Confirmed' },
    IN_PROGRESS: { bg: '#ffedd5', color: '#ea580c', label: 'In Progress' },
    COMPLETED:   { bg: '#dcfce7', color: '#16a34a', label: 'Completed' },
    CANCELLED:   { bg: '#f1f5f9', color: '#64748b', label: 'Cancelled' },
    REJECTED:    { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
  };

  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>Provider Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Welcome back, {user?.fullName}</p>
          </div>
          <div className="topbar-user">
            <div className="topbar-avatar">{user?.fullName?.[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.fullName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Service Provider</div>
            </div>
          </div>
        </div>

        {/* Approval banners */}
        {profile?.approvalStatus === 'PENDING' && (
          <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 12, padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>⏳</span>
            <div>
              <div style={{ fontWeight: 700, color: '#92400e' }}>Awaiting Approval</div>
              <div style={{ fontSize: 13, color: '#92400e', marginTop: 2 }}>Your profile is under review. You'll be able to receive bookings once approved by admin.</div>
            </div>
          </div>
        )}
        {profile?.approvalStatus === 'REJECTED' && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <span style={{ fontWeight: 700, color: '#dc2626' }}>❌ Application Rejected — </span>
            <span style={{ fontSize: 13, color: '#dc2626' }}>Please contact support for more information.</span>
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 28 }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe' }}><span style={{ fontSize: 22 }}>⭐</span></div>
            <div className="stat-value">{profile?.avgRating?.toFixed(1) || '—'}</div>
            <div className="stat-label">Rating ({profile?.totalRatings || 0} reviews)</div>
          </div>
          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/provider/bookings')}>
            <div className="stat-icon" style={{ background: '#fef3c7' }}><span style={{ fontSize: 22 }}>⏳</span></div>
            <div className="stat-value" style={{ color: pendingCount > 0 ? 'var(--accent)' : 'var(--primary)' }}>{pendingCount}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f3e8ff' }}><span style={{ fontSize: 22 }}>💰</span></div>
            <div className="stat-value">₹{profile?.hourlyRate || 0}</div>
            <div className="stat-label">Hourly Rate</div>
          </div>
          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/provider/profile')}>
            <div className="stat-icon" style={{ background: '#dcfce7' }}><span style={{ fontSize: 22 }}>✅</span></div>
            <div className="stat-value">{profile?.isAvailable ? 'Yes' : 'No'}</div>
            <div className="stat-label">Available for Bookings</div>
          </div>
        </div>

        {/* Service categories */}
        {profile?.serviceCategories?.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <h3 style={{ fontWeight: 700, fontSize: 16 }}>Your Services</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {profile.serviceCategories.map(cat => (
                <span key={cat.id} className="badge badge-info" style={{ fontSize: 13, padding: '6px 14px' }}>{cat.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* Recent bookings */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Recent Bookings</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/provider/bookings')}>View All →</button>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : bookings.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <p>No bookings yet. Complete your profile to get discovered.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/provider/profile')}>
                Complete Profile
              </button>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Scheduled</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => {
                  const s = statusStyles[b.status] || statusStyles.PENDING;
                  return (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600 }}>{b.categoryName}</td>
                      <td style={{ fontSize: 13 }}>{new Date(b.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td style={{ fontWeight: 600 }}>₹{b.totalAmount}</td>
                      <td>
                        <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
