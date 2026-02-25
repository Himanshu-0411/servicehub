import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import { adminApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ icon, label, value, color, onClick, badge }) => (
  <div
    className="stat-card"
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
    onMouseEnter={e => onClick && (e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseLeave={e => onClick && (e.currentTarget.style.transform = 'translateY(0)')}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div className="stat-icon" style={{ background: color + '20' }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      {badge > 0 && (
        <span style={{ background: 'var(--danger)', color: 'white', borderRadius: 100, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
          {badge} new
        </span>
      )}
    </div>
    <div className="stat-value" style={{ color }}>{value ?? '—'}</div>
    <div className="stat-label">{label}</div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    adminApi.getStats()
      .then(r => { setStats(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
              Platform overview — ServiceHub
            </p>
          </div>
          <div className="topbar-user">
            <div className="topbar-avatar">{user?.fullName?.[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.fullName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Administrator</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <div className="stats-grid" style={{ marginBottom: 28 }}>
            <StatCard icon="👥" label="Total Users" value={stats?.totalUsers} color="var(--primary)" onClick={() => navigate('/admin/users')} />
            <StatCard icon="🔧" label="Total Providers" value={stats?.totalProviders} color="var(--accent)" onClick={() => navigate('/admin/providers')} />
            <StatCard icon="⏳" label="Pending Approvals" value={stats?.pendingProviderApprovals} color="var(--warning)" badge={stats?.pendingProviderApprovals} onClick={() => navigate('/admin/providers')} />
            <StatCard icon="📅" label="Total Bookings" value={stats?.totalBookings} color="#8b5cf6" onClick={() => navigate('/admin/bookings')} />
            <StatCard icon="🔄" label="Active Bookings" value={stats?.activeBookings} color="#0ea5e9" />
            <StatCard icon="✅" label="Completed" value={stats?.completedBookings} color="var(--success)" />
          </div>
        )}

        <div className="grid-2">
          <div className="card">
            <div className="card-header"><h3 style={{ fontWeight: 700, fontSize: 16 }}>Quick Actions</h3></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-primary" onClick={() => navigate('/admin/providers')}>
                ✅ Review Provider Applications
                {stats?.pendingProviderApprovals > 0 && (
                  <span style={{ background: 'var(--accent)', borderRadius: 100, padding: '2px 8px', fontSize: 11, marginLeft: 8 }}>
                    {stats.pendingProviderApprovals} pending
                  </span>
                )}
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/admin/bookings')}>📅 View All Bookings</button>
              <button className="btn btn-outline" onClick={() => navigate('/admin/categories')}>🏷️ Manage Categories</button>
              <button className="btn btn-outline" onClick={() => navigate('/admin/users')}>👥 Manage Users</button>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 style={{ fontWeight: 700, fontSize: 16 }}>System Info</h3></div>
            <div className="card-body">
              {[
                { label: 'Backend', value: 'Spring Boot 3.2' },
                { label: 'Database', value: 'MySQL 8' },
                { label: 'Frontend', value: 'React 18' },
                { label: 'Auth', value: 'JWT Bearer Token' },
                { label: 'Version', value: 'v1.0.0' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
