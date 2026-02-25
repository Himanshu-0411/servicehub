import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/shared/Sidebar';
import { userApi } from '../../api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PaymentModal from '../../components/shared/PaymentModal';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const statusStyles = {
  PENDING:     { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
  CONFIRMED:   { bg: '#dbeafe', color: '#2563eb', label: 'Confirmed' },
  IN_PROGRESS: { bg: '#ffedd5', color: '#ea580c', label: 'In Progress' },
  COMPLETED:   { bg: '#dcfce7', color: '#16a34a', label: 'Completed' },
  CANCELLED:   { bg: '#f1f5f9', color: '#64748b', label: 'Cancelled' },
  REJECTED:    { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
};

const paymentBadge = {
  PENDING:  { bg: '#fef3c7', color: '#d97706', label: '💳 Unpaid' },
  PAID:     { bg: '#dcfce7', color: '#16a34a', label: '✅ Paid' },
  REFUNDED: { bg: '#ede9fe', color: '#7c3aed', label: '↩ Refunded' },
  FAILED:   { bg: '#fee2e2', color: '#dc2626', label: '❌ Failed' },
};

const Stars = ({ value, onChange }) => (
  <div style={{ display:'flex', gap:6 }}>
    {[1,2,3,4,5].map(s => (
      <span key={s} onClick={() => onChange(s)}
        style={{ fontSize:30, cursor:'pointer', color: s <= value ? '#fbbf24' : '#d1d5db', transition:'color 0.1s' }}>★</span>
    ))}
  </div>
);

const ReviewModal = ({ booking, onClose, onSubmit }) => {
  const [form, setForm] = useState({ rating:5, comment:'' });
  const [loading, setLoading] = useState(false);
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ fontSize:20, fontWeight:800 }}>Rate {booking.providerName}</h2>
          <button onClick={onClose} style={{ border:'none', background:'none', fontSize:22, cursor:'pointer' }}>✕</button>
        </div>
        <div className="form-group">
          <label className="form-label">Rating</label>
          <Stars value={form.rating} onChange={r => setForm(p => ({ ...p, rating:r }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Comment (optional)</label>
          <textarea className="form-control" rows={3} placeholder="Share your experience..."
            value={form.comment} onChange={e => setForm(p => ({ ...p, comment:e.target.value }))} />
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <button className="btn btn-primary" style={{ flex:1 }}
            disabled={loading}
            onClick={async () => { setLoading(true); await onSubmit({ bookingId:booking.id, ...form }); setLoading(false); }}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    userApi.getBookings()
      .then(r => {
        const data = r.data;
        setBookings(Array.isArray(data) ? data : (data.content || []));
        setLoading(false);
      })
      .catch(() => { toast.error('Failed to load bookings'); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try { await userApi.cancelBooking(id); toast.success('Booking cancelled'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel'); }
  };

  const submitReview = async (data) => {
    try { await userApi.submitReview(data); toast.success('Review submitted! ⭐'); setReviewBooking(null); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const payNow = async (bookingId) => {
    try {
      const res = await userApi.initiatePayment(bookingId);
      setPaymentOrder(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    }
  };

  const onPaymentSuccess = () => {
    setPaymentOrder(null);
    toast.success('Payment successful!');
    load();
  };

  const filters = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="page-header" style={{ marginBottom:0 }}>
            <h1 className="page-title">My Bookings</h1>
            <p className="page-subtitle">Track all your service requests & payments</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/user/browse')}>+ New Booking</button>
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
          {filters.map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(f)}>{f.replace('_',' ')}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:80 }}><div className="spinner" style={{ margin:'0 auto' }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:80, color:'var(--text-muted)' }}>
            <div style={{ fontSize:56 }}>📅</div>
            <h3 style={{ marginTop:16 }}>{filter !== 'ALL' ? `No ${filter.toLowerCase()} bookings` : 'No bookings yet'}</h3>
            {filter === 'ALL' && (
              <button className="btn btn-primary" style={{ marginTop:20 }} onClick={() => navigate('/user/browse')}>
                Browse Providers
              </button>
            )}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {filtered.map(b => {
              const s = statusStyles[b.status] || statusStyles.PENDING;
              const p = paymentBadge[b.paymentStatus] || paymentBadge.PENDING;
              const canPay = b.paymentStatus === 'PENDING' &&
                             b.status !== 'CANCELLED' && b.status !== 'REJECTED';
              return (
                <div key={b.id} className="card">
                  <div className="card-body">
                    {/* Header row */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                          <h3 style={{ fontWeight:700, fontSize:18 }}>{b.providerName}</h3>
                          <span style={{ background:s.bg, color:s.color, padding:'3px 12px', borderRadius:100, fontSize:12, fontWeight:700 }}>{s.label}</span>
                          <span style={{ background:p.bg, color:p.color, padding:'3px 12px', borderRadius:100, fontSize:12, fontWeight:700 }}>{p.label}</span>
                        </div>
                        <p style={{ color:'var(--text-muted)', fontSize:14, marginTop:6 }}>🔧 {b.categoryName}</p>
                        <p style={{ color:'var(--text-muted)', fontSize:14, marginTop:4 }}>
                          📅 {new Date(b.scheduledAt).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' })}
                        </p>
                        {b.serviceAddress && (
                          <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>
                            📍 {b.serviceAddress.street}, {b.serviceAddress.city}
                          </p>
                        )}
                        {b.notes && (
                          <p style={{ fontStyle:'italic', color:'var(--text-muted)', fontSize:13, marginTop:4 }}>💬 {b.notes}</p>
                        )}
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontWeight:800, fontSize:24, color:'var(--primary)' }}>{fmt(b.totalAmount)}</div>
                        <div style={{ fontSize:12, color:'var(--text-muted)' }}>Booking #{b.id}</div>
                      </div>
                    </div>

                    {/* Pay Now banner */}
                    {canPay && (
                      <div style={{ marginTop:14, background:'#fffbeb', border:'1.5px solid #fde68a', borderRadius:10, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                        <div>
                          <div style={{ fontWeight:700, color:'#92400e', fontSize:14 }}>⚠️ Payment Pending</div>
                          <div style={{ fontSize:12, color:'#a16207', marginTop:2 }}>
                            Complete payment to confirm your booking
                          </div>
                        </div>
                        <button className="btn btn-accent btn-sm" onClick={() => payNow(b.id)}>
                          💳 Pay {fmt(b.totalAmount)}
                        </button>
                      </div>
                    )}

                    {/* Credentials reveal */}
                    {b.status === 'CONFIRMED' && b.credentialsRevealed && b.credentialInfo && (
                      <div style={{ marginTop:14, background:'#f0fdf4', border:'1.5px solid #86efac', borderRadius:10, padding:14 }}>
                        <div style={{ fontWeight:700, color:'#16a34a', fontSize:14, marginBottom:6 }}>✅ Provider Credentials</div>
                        <p style={{ fontSize:14, color:'#15803d' }}>{b.credentialInfo}</p>
                      </div>
                    )}
                    {b.status === 'CONFIRMED' && b.paymentStatus === 'PAID' && !b.credentialsRevealed && (
                      <div style={{ marginTop:14, background:'#eff6ff', border:'1.5px solid #bfdbfe', borderRadius:10, padding:12, fontSize:13, color:'#1e40af' }}>
                        🔒 Provider credentials will be shared here once revealed
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display:'flex', gap:8, marginTop:14, flexWrap:'wrap' }}>
                      {b.status === 'PENDING' && (
                        <button className="btn btn-danger btn-sm" onClick={() => cancel(b.id)}>✕ Cancel</button>
                      )}
                      {b.status === 'COMPLETED' && b.paymentStatus === 'PAID' && (
                        <button className="btn btn-primary btn-sm" onClick={() => setReviewBooking(b)}>⭐ Leave Review</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {reviewBooking && <ReviewModal booking={reviewBooking} onClose={() => setReviewBooking(null)} onSubmit={submitReview} />}
        {paymentOrder && <PaymentModal order={paymentOrder} onSuccess={onPaymentSuccess} onClose={() => setPaymentOrder(null)} />}
      </div>
    </div>
  );
}
