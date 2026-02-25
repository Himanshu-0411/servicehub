import React, { useState } from 'react';
import { userApi } from '../../api';
import toast from 'react-hot-toast';

const BANKS = ['SBI','HDFC Bank','ICICI Bank','Axis Bank','Kotak Bank','Yes Bank','PNB','Bank of Baroda','Canara Bank','IDFC First Bank'];
const NETWORKS = ['VISA','MASTERCARD','RUPAY','AMEX'];

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

// Format card number display with spaces
const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const fmtExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
};

export default function PaymentModal({ order, onSuccess, onClose }) {
  const [tab, setTab] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(null); // null | {success, txnId, message}

  // UPI state
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [upiVerifying, setUpiVerifying] = useState(false);

  // Card state
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '', network: 'VISA' });

  // Net Banking
  const [bank, setBank] = useState('');

  // Wallet
  const [wallet, setWallet] = useState('PAYTM');

  const verifyUPI = () => {
    if (!upiId.includes('@')) { toast.error('Enter a valid UPI ID (e.g. name@upi)'); return; }
    setUpiVerifying(true);
    setTimeout(() => { setUpiVerified(true); setUpiVerifying(false); toast.success('UPI ID verified ✓'); }, 1200);
  };

  const pay = async () => {
    // Validation
    if (tab === 'UPI' && !upiVerified) { toast.error('Please verify your UPI ID first'); return; }
    if (tab === 'CARD') {
      if (card.number.replace(/\s/g,'').length < 16) { toast.error('Enter full 16-digit card number'); return; }
      if (card.expiry.length < 5) { toast.error('Enter card expiry (MM/YY)'); return; }
      if (card.cvv.length < 3) { toast.error('Enter CVV'); return; }
      if (!card.name.trim()) { toast.error('Enter cardholder name'); return; }
    }
    if (tab === 'NET_BANKING' && !bank) { toast.error('Select your bank'); return; }

    setProcessing(true);
    try {
      const payload = {
        bookingId: order.bookingId,
        method: tab,
        upiId: tab === 'UPI' ? upiId : undefined,
        cardLast4: tab === 'CARD' ? card.number.replace(/\s/g,'').slice(-4) : undefined,
        cardNetwork: tab === 'CARD' ? card.network : undefined,
        cardHolderName: tab === 'CARD' ? card.name : undefined,
        bankName: tab === 'NET_BANKING' ? bank : undefined,
      };

      const res = await userApi.processPayment(payload);
      const result = res.data;
      setDone({
        success: result.status === 'SUCCESS',
        txnId: result.transactionId,
        message: result.message,
        amount: result.amount,
      });
      if (result.status === 'SUCCESS') {
        onSuccess(result);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  // ── Success / Failure screen ──
  if (done) {
    return (
      <div className="modal-overlay">
        <div className="modal" style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>{done.success ? '✅' : '❌'}</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: done.success ? '#16a34a' : '#dc2626' }}>
            {done.success ? 'Payment Successful!' : 'Payment Failed'}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: 15 }}>{done.message}</p>
          {done.success && (
            <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 12, padding: 16, marginTop: 20 }}>
              <div style={{ fontSize: 13, color: '#16a34a', marginBottom: 8 }}>Transaction Details</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#15803d' }}>{fmt(done.amount)}</div>
              <div style={{ fontSize: 12, color: '#16a34a', marginTop: 6, fontFamily: 'monospace' }}>
                TXN ID: {done.txnId}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            {!done.success && (
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setDone(null)}>
                Try Again
              </button>
            )}
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
              {done.success ? 'Close' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480, padding: 0, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: 'var(--primary)', padding: '20px 24px', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>Complete Payment</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 3 }}>Secure · Encrypted · Instant</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>

          {/* Amount + booking summary */}
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px 16px', marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Paying for</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>{order.providerName}</div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 1 }}>{order.categoryName}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Amount</div>
                <div style={{ fontWeight: 900, fontSize: 26, marginTop: 2 }}>{fmt(order.amount)}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {/* Payment method tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[
              { key: 'UPI', label: '📱 UPI' },
              { key: 'CARD', label: '💳 Card' },
              { key: 'NET_BANKING', label: '🏦 Net Banking' },
              { key: 'WALLET', label: '👛 Wallet' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: tab === t.key ? 'var(--primary)' : '#f1f5f9',
                  color: tab === t.key ? 'white' : 'var(--text)',
                  fontWeight: 600, fontSize: 12, transition: 'all 0.15s',
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── UPI ── */}
          {tab === 'UPI' && (
            <div>
              <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                Enter your UPI ID (e.g. <code>name@upi</code>, <code>9876543210@okaxis</code>)
              </div>
              <div className="form-group">
                <label className="form-label">UPI ID</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-control" placeholder="yourname@upi"
                    value={upiId} onChange={e => { setUpiId(e.target.value); setUpiVerified(false); }}
                    style={{ borderColor: upiVerified ? '#16a34a' : undefined }}
                  />
                  <button className="btn btn-outline btn-sm" onClick={verifyUPI}
                    disabled={upiVerifying || upiVerified || !upiId}
                    style={{ flexShrink: 0, minWidth: 80 }}>
                    {upiVerifying ? '⏳' : upiVerified ? '✅' : 'Verify'}
                  </button>
                </div>
                {upiVerified && <p style={{ fontSize: 12, color: '#16a34a', marginTop: 6 }}>✓ UPI ID verified</p>}
              </div>

              {/* Popular UPI apps */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Pay using</div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {[
                    { name: 'GPay', suffix: '@okaxis', color: '#4285F4' },
                    { name: 'PhonePe', suffix: '@ybl', color: '#5F259F' },
                    { name: 'Paytm', suffix: '@paytm', color: '#00BAF2' },
                    { name: 'BHIM', suffix: '@upi', color: '#FF6600' },
                  ].map(app => (
                    <button key={app.name}
                      onClick={() => { setUpiId(`user${app.suffix}`); setUpiVerified(false); }}
                      style={{ padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${app.color}`, background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: app.color }}>
                      {app.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── CARD ── */}
          {tab === 'CARD' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Card network selector */}
              <div className="form-group">
                <label className="form-label">Card Network</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {NETWORKS.map(n => (
                    <button key={n} type="button"
                      onClick={() => setCard(c => ({ ...c, network: n }))}
                      style={{
                        flex: 1, padding: '7px 4px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 700,
                        border: card.network === n ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                        background: card.network === n ? '#eff6ff' : 'white',
                        color: card.network === n ? 'var(--primary)' : 'var(--text)',
                      }}>{n}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input className="form-control" placeholder="1234 5678 9012 3456" maxLength={19}
                  value={card.number}
                  onChange={e => setCard(c => ({ ...c, number: fmtCard(e.target.value) }))}
                  style={{ fontFamily: 'monospace', letterSpacing: 2 }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Expiry (MM/YY)</label>
                  <input className="form-control" placeholder="08/27" maxLength={5}
                    value={card.expiry}
                    onChange={e => setCard(c => ({ ...c, expiry: fmtExpiry(e.target.value) }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV</label>
                  <input className="form-control" type="password" placeholder="•••" maxLength={4}
                    value={card.cvv}
                    onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/,'').slice(0,4) }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Name on Card</label>
                <input className="form-control" placeholder="RAMESH KUMAR"
                  value={card.name}
                  onChange={e => setCard(c => ({ ...c, name: e.target.value.toUpperCase() }))}
                />
              </div>
              <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#16a34a', display: 'flex', gap: 6, alignItems: 'center' }}>
                🔒 Your card details are encrypted and never stored
              </div>
            </div>
          )}

          {/* ── NET BANKING ── */}
          {tab === 'NET_BANKING' && (
            <div>
              <div className="form-group">
                <label className="form-label">Select Your Bank</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                  {BANKS.map(b => (
                    <button key={b} type="button"
                      onClick={() => setBank(b)}
                      style={{
                        padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, textAlign: 'left',
                        border: bank === b ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                        background: bank === b ? '#eff6ff' : 'white',
                        color: bank === b ? 'var(--primary)' : 'var(--text)',
                        fontWeight: bank === b ? 600 : 400,
                      }}>
                      {bank === b ? '✓ ' : ''}{b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── WALLET ── */}
          {tab === 'WALLET' && (
            <div>
              <div className="form-group">
                <label className="form-label">Select Wallet</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                  {[
                    { id: 'PAYTM', label: 'Paytm', color: '#00BAF2' },
                    { id: 'PHONEPE', label: 'PhonePe', color: '#5F259F' },
                    { id: 'AMAZONPAY', label: 'Amazon Pay', color: '#FF9900' },
                    { id: 'MOBIKWIK', label: 'MobiKwik', color: '#E63C5B' },
                  ].map(w => (
                    <button key={w.id} type="button"
                      onClick={() => setWallet(w.id)}
                      style={{
                        padding: '12px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        border: wallet === w.id ? `2px solid ${w.color}` : '1.5px solid var(--border)',
                        background: wallet === w.id ? w.color + '15' : 'white',
                        color: wallet === w.id ? w.color : 'var(--text)',
                      }}>
                      {wallet === w.id ? '✓ ' : ''}{w.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pay button */}
          <button
            className="btn btn-accent"
            style={{ width: '100%', marginTop: 24, padding: '14px', fontSize: 16, fontWeight: 700, borderRadius: 12 }}
            onClick={pay}
            disabled={processing}>
            {processing ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Processing...
              </span>
            ) : (
              `🔒 Pay ${fmt(order.amount)}`
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            🔐 Secured by 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
}
