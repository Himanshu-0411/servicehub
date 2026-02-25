import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/shared/Sidebar';
import { adminApi } from '../../api';
import toast from 'react-hot-toast';

const statusStyles = {
  APPROVED: { bg: '#dcfce7', color: '#16a34a' },
  PENDING:  { bg: '#fef3c7', color: '#d97706' },
  REJECTED: { bg: '#fee2e2', color: '#dc2626' },
};

export default function AdminProviders() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [acting, setActing] = useState(null);

  const load = () => {
    setLoading(true);
    adminApi.getProviders()
      .then(r => {
        const data = r.data;
        setProviders(Array.isArray(data) ? data : (data.content || []));
        setLoading(false);
      })
      .catch(() => { toast.error('Failed to load providers'); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    setActing(id);
    try { await adminApi.approveProvider(id); toast.success('Provider approved! ✅'); load(); }
    catch { toast.error('Failed'); }
    finally { setActing(null); }
  };

  const reject = async (id) => {
    setActing(id);
    try { await adminApi.rejectProvider(id); toast.success('Provider rejected'); load(); }
    catch { toast.error('Failed'); }
    finally { setActing(null); }
  };

  const filtered = filter === 'ALL' ? providers : providers.filter(p => p.approvalStatus === filter);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Service Providers</h1>
          <p className="page-subtitle">Approve, reject and manage provider accounts</p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(f)}>
              {f}
              {f === 'PENDING' && (
                <span style={{ marginLeft: 4 }}>({providers.filter(p => p.approvalStatus === 'PENDING').length})</span>
              )}
            </button>
          ))}
        </div>

        <div className="card">
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48 }}>🔧</div>
              <p style={{ marginTop: 12 }}>No {filter !== 'ALL' ? filter.toLowerCase() : ''} providers found</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Services</th>
                  <th>Experience</th>
                  <th>Rate</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const s = statusStyles[p.approvalStatus] || statusStyles.PENDING;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                            {p.fullName?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{p.fullName}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {p.serviceCategories?.slice(0, 2).map(c => (
                            <span key={c.id} className="badge badge-info">{c.name}</span>
                          ))}
                          {p.serviceCategories?.length > 2 && (
                            <span className="badge badge-gray">+{p.serviceCategories.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td>{p.experienceYears} yrs</td>
                      <td style={{ fontWeight: 600 }}>₹{p.hourlyRate}/hr</td>
                      <td>⭐ {p.avgRating?.toFixed(1)} <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({p.totalRatings})</span></td>
                      <td>
                        <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
                          {p.approvalStatus}
                        </span>
                      </td>
                      <td>
                        {p.approvalStatus === 'PENDING' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-success btn-sm" disabled={acting === p.id} onClick={() => approve(p.id)}>✓ Approve</button>
                            <button className="btn btn-danger btn-sm" disabled={acting === p.id} onClick={() => reject(p.id)}>✗ Reject</button>
                          </div>
                        )}
                        {p.approvalStatus === 'APPROVED' && (
                          <button className="btn btn-danger btn-sm" disabled={acting === p.id} onClick={() => reject(p.id)}>Revoke</button>
                        )}
                        {p.approvalStatus === 'REJECTED' && (
                          <button className="btn btn-success btn-sm" disabled={acting === p.id} onClick={() => approve(p.id)}>Re-approve</button>
                        )}
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
