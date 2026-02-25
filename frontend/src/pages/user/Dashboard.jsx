import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import { userApi, categoryApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const statusStyles = {
  PENDING:     { bg: '#fef3c7', color: '#d97706' },
  CONFIRMED:   { bg: '#dbeafe', color: '#2563eb' },
  IN_PROGRESS: { bg: '#ffedd5', color: '#ea580c' },
  COMPLETED:   { bg: '#dcfce7', color: '#16a34a' },
  CANCELLED:   { bg: '#f1f5f9', color: '#64748b' },
  REJECTED:    { bg: '#fee2e2', color: '#dc2626' },
};

export default function UserDashboard() {
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      userApi.getBookings({ size: 5 }),
      categoryApi.getAll(),
    ])
      .then(([b, c]) => {
        const data = b.data;
        setBookings(Array.isArray(data) ? data : (data.content || []));
        setCategories(c.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>
              Welcome back, {user?.fullName?.split(' ')[0]}! 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
              What service do you need today?
            </p>
          </div>
          <div className="topbar-user">
            <div className="topbar-avatar">{user?.fullName?.[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.fullName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Customer</div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { icon: '🔍', label: 'Browse Providers', path: '/user/browse', color: 'var(--primary)' },
            { icon: '📅', label: 'My Bookings', path: '/user/bookings', color: 'var(--accent)' },
            { icon: '📍', label: 'My Addresses', path: '/user/addresses', color: '#8b5cf6' },
          ].map(item => (
            <div key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                background: 'white', borderRadius: 14, padding: 20, cursor: 'pointer',
                border: '1.5px solid var(--border)', transition: 'all 0.2s', textAlign: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, color: item.color }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Browse by category */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Browse by Category</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/user/browse')}>View All →</button>
          </div>
          <div className="card-body">
            {categories.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading categories...</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className="category-pill"
                    onClick={() => navigate(`/user/browse?categoryId=${cat.id}`)}>
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent bookings */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Recent Bookings</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/user/bookings')}>View All →</button>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <p>No bookings yet.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/user/browse')}>
                Book a Service
              </button>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => {
                  const s = statusStyles[b.status] || statusStyles.PENDING;
                  return (
                    <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/user/bookings')}>
                      <td style={{ fontWeight: 600 }}>{b.providerName}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{b.categoryName}</td>
                      <td style={{ fontSize: 13 }}>{new Date(b.scheduledAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ fontWeight: 600 }}>₹{b.totalAmount}</td>
                      <td>
                        <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
                          {b.status?.replace('_', ' ')}
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
