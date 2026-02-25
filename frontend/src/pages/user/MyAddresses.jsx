import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/shared/Sidebar';
import { userApi } from '../../api';
import toast from 'react-hot-toast';

const emptyForm = { label: 'Home', street: '', city: '', state: '', pincode: '', country: 'India', isDefault: false };

export default function MyAddresses() {
  const [addresses, setAddresses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => userApi.getAddresses().then(r => setAddresses(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (a) => { setEditing(a); setForm({ label: a.label, street: a.street, city: a.city, state: a.state, pincode: a.pincode, country: a.country, isDefault: a.isDefault }); setShowModal(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await userApi.updateAddress(editing.id, form);
      else await userApi.addAddress(form);
      toast.success(editing ? 'Address updated' : 'Address added');
      setShowModal(false);
      load();
    } catch { toast.error('Failed'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try { await userApi.deleteAddress(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1 className="page-title">My Addresses</h1>
            <p className="page-subtitle">Manage delivery & service addresses</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Address</button>
        </div>

        {addresses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
            <h3>No addresses saved</h3>
            <p style={{ marginTop: 8 }}>Add an address to start booking services</p>
            <button className="btn btn-primary mt-2" onClick={openAdd}>Add Address</button>
          </div>
        ) : (
          <div className="grid-2">
            {addresses.map(a => (
              <div key={a.id} className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 20 }}>{a.label === 'Home' ? '🏠' : a.label === 'Work' ? '🏢' : '📍'}</span>
                        <strong>{a.label}</strong>
                        {a.isDefault && <span className="badge badge-success">Default</span>}
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        {a.street}<br />{a.city}, {a.state} - {a.pincode}<br />{a.country}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}>✏️</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => remove(a.id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2 className="modal-title">{editing ? 'Edit Address' : 'Add New Address'}</h2>
              <form onSubmit={save}>
                <div className="form-group">
                  <label className="form-label">Label</label>
                  <select className="form-control" value={form.label} onChange={e => setForm(p => ({...p, label: e.target.value}))}>
                    {['Home', 'Work', 'Other'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Street / Area</label>
                  <input className="form-control" required value={form.street} onChange={e => setForm(p => ({...p, street: e.target.value}))} placeholder="123 Main St, Area Name" />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-control" required value={form.city} onChange={e => setForm(p => ({...p, city: e.target.value}))} placeholder="Mumbai" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input className="form-control" required value={form.state} onChange={e => setForm(p => ({...p, state: e.target.value}))} placeholder="Maharashtra" />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input className="form-control" required value={form.pincode} onChange={e => setForm(p => ({...p, pincode: e.target.value}))} placeholder="400001" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input className="form-control" required value={form.country} onChange={e => setForm(p => ({...p, country: e.target.value}))} />
                  </div>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={e => setForm(p => ({...p, isDefault: e.target.checked}))} />
                  <label htmlFor="isDefault" style={{ cursor: 'pointer', margin: 0 }}>Set as default address</label>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editing ? 'Update' : 'Save Address'}</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
