import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/shared/Sidebar';
import { adminApi } from '../../api';

const statusBadge = (s) => {
  const map = {
    PENDING: 'badge-warning', CONFIRMED: 'badge-info', IN_PROGRESS: 'badge-orange',
    COMPLETED: 'badge-success', CANCELLED: 'badge-gray', REJECTED: 'badge-danger'
  };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s?.replace('_', ' ')}</span>;
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getBookings().then(r => { setBookings(r.data.content || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">All Bookings</h1>
          <p className="page-subtitle">Platform-wide booking management</p>
        </div>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Provider</th>
                <th>Service</th>
                <th>Scheduled</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No bookings yet</td></tr>
              ) : bookings.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>#{b.id}</td>
                  <td>{b.providerName}</td>
                  <td>{b.categoryName}</td>
                  <td style={{ fontSize: 13 }}>{new Date(b.scheduledAt).toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>₹{b.totalAmount}</td>
                  <td>{statusBadge(b.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
