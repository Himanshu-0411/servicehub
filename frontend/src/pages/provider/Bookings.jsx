import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/shared/Sidebar';
import { providerApi } from '../../api';
import toast from 'react-hot-toast';

const statusStyles = {
  PENDING:     { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
  CONFIRMED:   { bg: '#dbeafe', color: '#2563eb', label: 'Confirmed' },
  IN_PROGRESS: { bg: '#ffedd5', color: '#ea580c', label: 'In Progress' },
  COMPLETED:   { bg: '#dcfce7', color: '#16a34a', label: 'Completed' },
  CANCELLED:   { bg: '#f1f5f9', color: '#64748b', label: 'Cancelled' },
  REJECTED:    { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
};

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [updating, setUpdating] = useState(null);

  const load = () => {
    setLoading(true);
    providerApi.getMyBookings()
      .then(r => {
        const data = r.data;
        setBookings(Array.isArray(data) ? data : (data.content || []));
        setLoading(false);
      })
      .catch(() => { toast.error('Failed to load bookings'); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await providerApi.updateBookingStatus(id, status);
      toast.success(`Booking ${status.toLowerCase().replace('_', ' ')}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const filters = ['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);
  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Manage all your service requests</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(f)}>
              {f.replace('_', ' ')}
              {f === 'PENDING' && pendingCount > 0 && (
                <span style={{ background: 'var(--accent)', color: 'white', borderRadius: 100, padding: '1px 7px', fontSize: 10, marginLeft: 4 }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 56 }}>📭</div>
            <h3 style={{ marginTop: 16 }}>No bookings</h3>
            <p style={{ marginTop: 8 }}>
              {filter !== 'ALL' ? `No ${filter.replace('_', ' ').toLowerCase()} bookings` : 'No bookings yet'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(b => {
              const s = statusStyles[b.status] || statusStyles.PENDING;
              return (
                <div key={b.id} className="card">
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <h3 style={{ fontWeight: 700, fontSize: 18 }}>🔧 {b.categoryName}</h3>
                          <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                            {s.label}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                          📅 {new Date(b.scheduledAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
                        </p>
                        {b.serviceAddress && (
                          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                            📍 {b.serviceAddress.street}, {b.serviceAddress.city}, {b.serviceAddress.state} — {b.serviceAddress.pincode}
                          </p>
                        )}
                        {b.notes && (
                          <div style={{ marginTop: 8, background: '#f8fafc', padding: '8px 12px', borderRadius: 8, fontSize: 13, borderLeft: '3px solid var(--primary)' }}>
                            💬 {b.notes}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: 24, color: 'var(--primary)' }}>₹{b.totalAmount}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Booking #{b.id}</div>
                      </div>
                    </div>

                    {b.status === 'CONFIRMED' && (
                      <div style={{ marginTop: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 10, fontSize: 13, color: '#16a34a' }}>
                        ✅ Confirmed — your credentials have been shared with the customer
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                      {b.status === 'PENDING' && (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            disabled={updating === b.id}
                            onClick={() => updateStatus(b.id, 'CONFIRMED')}>
                            ✓ Accept Booking
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={updating === b.id}
                            onClick={() => updateStatus(b.id, 'REJECTED')}>
                            ✗ Reject
                          </button>
                        </>
                      )}
                      {b.status === 'CONFIRMED' && (
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={updating === b.id}
                          onClick={() => updateStatus(b.id, 'IN_PROGRESS')}>
                          ▶ Start Service
                        </button>
                      )}
                      {b.status === 'IN_PROGRESS' && (
                        <button
                          className="btn btn-success btn-sm"
                          disabled={updating === b.id}
                          onClick={() => updateStatus(b.id, 'COMPLETED')}>
                          ✓ Mark as Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
