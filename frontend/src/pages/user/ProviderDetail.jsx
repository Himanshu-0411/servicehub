import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import PaymentModal from '../../components/shared/PaymentModal';
import { providerApi, userApi } from '../../api';
import toast from 'react-hot-toast';

const Stars = ({ rating = 0, size = 16 }) => (
  <span style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(s => (
      <span key={s} style={{ color: s <= Math.round(rating) ? '#fbbf24' : '#e5e7eb', fontSize: size }}>★</span>
    ))}
  </span>
);

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking modal state
  const [showBooking, setShowBooking] = useState(false);
  const [booking, setBooking] = useState({ categoryId: '', addressId: '', scheduledAt: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  // Payment modal state
  const [paymentOrder, setPaymentOrder] = useState(null); // null = no payment modal

  useEffect(() => {
    setLoading(true);
    Promise.all([
      providerApi.getById(id),
      providerApi.getReviews(id),
      userApi.getAddresses(),
    ])
      .then(([p, r, a]) => {
        setProvider(p.data);
        setReviews(Array.isArray(r.data) ? r.data : (r.data.content || []));
        setAddresses(a.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load provider');
        setLoading(false);
      });
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!booking.categoryId) { toast.error('Select a service type'); return; }
    if (!booking.addressId)  { toast.error('Select an address'); return; }
    if (!booking.scheduledAt){ toast.error('Select date and time'); return; }

    setSubmitting(true);
    try {
      // 1. Create the booking
      const bookingRes = await userApi.createBooking({
        providerId: Number(id),
        categoryId: Number(booking.categoryId),
        addressId:  Number(booking.addressId),
        scheduledAt: booking.scheduledAt,
        notes: booking.notes,
      });
      const newBooking = bookingRes.data;

      // 2. Initiate payment order
      const orderRes = await userApi.initiatePayment(newBooking.id);
      setShowBooking(false);
      setPaymentOrder(orderRes.data);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const onPaymentSuccess = (result) => {
    toast.success('🎉 Payment successful! Check your bookings.');
    setTimeout(() => navigate('/user/bookings'), 1500);
  };

  const onPaymentClose = () => {
    setPaymentOrder(null);
    toast('Booking saved — you can pay later from My Bookings', { icon: '📋' });
    navigate('/user/bookings');
  };

  if (loading) return (
    <div className="app-layout"><Sidebar />
      <div className="main-content" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div className="spinner" />
      </div>
    </div>
  );

  if (error || !provider) return (
    <div className="app-layout"><Sidebar />
      <div className="main-content">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <div style={{ textAlign:'center', padding:60 }}>
          <div style={{ fontSize:48 }}>⚠️</div>
          <p style={{ color:'var(--danger)', marginTop:12 }}>{error || 'Provider not found'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <button className="btn btn-ghost btn-sm" style={{ marginBottom:16 }} onClick={() => navigate(-1)}>
          ← Back to Providers
        </button>

        {/* Provider header */}
        <div className="card" style={{ marginBottom:24 }}>
          <div className="card-body">
            <div style={{ display:'flex', gap:24, alignItems:'flex-start', flexWrap:'wrap' }}>
              <div className="provider-avatar" style={{ width:80, height:80, fontSize:32, flexShrink:0 }}>
                {provider.fullName?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                <h1 style={{ fontSize:26, fontWeight:800 }}>{provider.fullName}</h1>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:6 }}>
                  <Stars rating={provider.avgRating} size={18} />
                  <span style={{ fontWeight:700, fontSize:16 }}>{provider.avgRating?.toFixed(1)}</span>
                  <span style={{ color:'var(--text-muted)', fontSize:14 }}>({provider.totalRatings} reviews)</span>
                </div>
                {provider.city && (
                  <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:8 }}>
                    <span>📍</span>
                    <span style={{ fontSize:14, color:'var(--text-muted)' }}>{provider.city}{provider.state ? `, ${provider.state}` : ''}</span>
                  </div>
                )}
                <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
                  {provider.serviceCategories?.map(cat => (
                    <span key={cat.id} className="badge badge-info">{cat.name}</span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:36, fontWeight:800, color:'var(--primary)' }}>{fmt(provider.hourlyRate)}</div>
                <div style={{ color:'var(--text-muted)', fontSize:13, marginBottom:12 }}>per hour</div>
                <span className={`badge ${provider.isAvailable ? 'badge-success' : 'badge-gray'}`} style={{ marginBottom:12, display:'block' }}>
                  {provider.isAvailable ? '● Available' : '○ Unavailable'}
                </span>
                <button className="btn btn-accent" disabled={!provider.isAvailable}
                  onClick={() => setShowBooking(true)} style={{ width:'100%' }}>
                  📅 Book & Pay
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* About */}
          <div className="card">
            <div className="card-header"><h3 style={{ fontWeight:700 }}>About</h3></div>
            <div className="card-body">
              <p style={{ lineHeight:1.8, color:'var(--text-muted)' }}>
                {provider.description || 'No description provided.'}
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:20 }}>
                <div style={{ background:'#f8fafc', borderRadius:10, padding:14, textAlign:'center' }}>
                  <div style={{ fontSize:24, fontWeight:800, color:'var(--primary)' }}>{provider.experienceYears}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>Years Experience</div>
                </div>
                <div style={{ background:'#f8fafc', borderRadius:10, padding:14, textAlign:'center' }}>
                  <div style={{ fontSize:24, fontWeight:800, color:'var(--primary)' }}>{provider.totalRatings}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>Reviews</div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="card">
            <div className="card-header"><h3 style={{ fontWeight:700 }}>Customer Reviews</h3></div>
            {reviews.length === 0 ? (
              <div className="card-body" style={{ textAlign:'center', color:'var(--text-muted)', padding:40 }}>
                <div style={{ fontSize:36 }}>⭐</div>
                <p style={{ marginTop:8 }}>No reviews yet — be the first!</p>
              </div>
            ) : (
              reviews.map(r => (
                <div key={r.id} style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <strong style={{ fontSize:14 }}>{r.userName}</strong>
                    <Stars rating={r.rating} />
                  </div>
                  {r.comment && <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:6, lineHeight:1.5 }}>{r.comment}</p>}
                  <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Booking Modal ── */}
        {showBooking && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowBooking(false)}>
            <div className="modal">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <h2 style={{ fontSize:20, fontWeight:800 }}>Book {provider.fullName}</h2>
                <button onClick={() => setShowBooking(false)}
                  style={{ border:'none', background:'none', fontSize:22, cursor:'pointer', color:'var(--text-muted)' }}>✕</button>
              </div>

              {addresses.length === 0 ? (
                <div style={{ textAlign:'center', padding:24 }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>📍</div>
                  <p style={{ color:'var(--text-muted)', marginBottom:16 }}>Add an address first to book.</p>
                  <button className="btn btn-primary" onClick={() => navigate('/user/addresses')}>+ Add Address</button>
                </div>
              ) : (
                <form onSubmit={handleBook}>
                  <div className="form-group">
                    <label className="form-label">Service Type *</label>
                    <select className="form-control" required value={booking.categoryId}
                      onChange={e => setBooking(p => ({ ...p, categoryId: e.target.value }))}>
                      <option value="">-- Select a service --</option>
                      {provider.serviceCategories?.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Service Address *</label>
                    <select className="form-control" required value={booking.addressId}
                      onChange={e => setBooking(p => ({ ...p, addressId: e.target.value }))}>
                      <option value="">-- Select an address --</option>
                      {addresses.map(a => (
                        <option key={a.id} value={a.id}>{a.label} — {a.street}, {a.city}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date & Time *</label>
                    <input type="datetime-local" className="form-control" required
                      min={new Date().toISOString().slice(0, 16)}
                      value={booking.scheduledAt}
                      onChange={e => setBooking(p => ({ ...p, scheduledAt: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes (optional)</label>
                    <textarea className="form-control" rows={2} placeholder="Special requirements..."
                      value={booking.notes}
                      onChange={e => setBooking(p => ({ ...p, notes: e.target.value }))} />
                  </div>

                  {/* Price summary */}
                  <div style={{ background:'#f8fafc', borderRadius:12, padding:16, marginBottom:20 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, marginBottom:8 }}>
                      <span style={{ color:'var(--text-muted)' }}>Service charge</span>
                      <span style={{ fontWeight:600 }}>{fmt(provider.hourlyRate)}</span>
                    </div>
                    <div style={{ borderTop:'1px solid var(--border)', paddingTop:8, display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:16 }}>
                      <span>Total Payable</span>
                      <span style={{ color:'var(--primary)' }}>{fmt(provider.hourlyRate)}</span>
                    </div>
                    <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:8 }}>
                      💡 You'll be redirected to payment after confirming
                    </p>
                  </div>

                  <div style={{ display:'flex', gap:12 }}>
                    <button type="submit" className="btn btn-accent" style={{ flex:1 }} disabled={submitting}>
                      {submitting ? '⏳ Processing...' : `Proceed to Pay ${fmt(provider.hourlyRate)}`}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowBooking(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ── Payment Modal ── */}
        {paymentOrder && (
          <PaymentModal
            order={paymentOrder}
            onSuccess={onPaymentSuccess}
            onClose={onPaymentClose}
          />
        )}
      </div>
    </div>
  );
}
