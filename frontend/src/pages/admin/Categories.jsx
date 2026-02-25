import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/shared/Sidebar';
import { adminApi, categoryApi } from '../../api';
import toast from 'react-hot-toast';

const CATEGORY_TYPES = ['HOME_SERVICES', 'TUTORING_EDUCATION', 'BEAUTY_WELLNESS', 'OTHER'];

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', iconName: '', type: 'HOME_SERVICES' });

  const load = () => categoryApi.getAll().then(r => setCategories(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createCategory(form.name, form.description, form.iconName, form.type);
      toast.success('Category created!');
      setShowModal(false);
      setForm({ name: '', description: '', iconName: '', type: 'HOME_SERVICES' });
      load();
    } catch { toast.error('Failed to create category'); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1 className="page-title">Service Categories</h1>
            <p className="page-subtitle">Manage all service categories</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Category</button>
        </div>

        <div className="categories-grid">
          {categories.map(cat => (
            <div key={cat.id} className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🏷️</div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{cat.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{cat.description}</p>
                <span className="badge badge-info" style={{ marginTop: 10 }}>{cat.type?.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2 className="modal-title">Add Service Category</h2>
              <form onSubmit={create}>
                <div className="form-group">
                  <label className="form-label">Category Name</label>
                  <input className="form-control" value={form.name} required
                    onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Plumbing" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-control" value={form.description}
                    onChange={e => setForm(p => ({...p, description: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Icon Name (Lucide)</label>
                  <input className="form-control" value={form.iconName}
                    onChange={e => setForm(p => ({...p, iconName: e.target.value}))} placeholder="e.g. Droplets" />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-control" value={form.type}
                    onChange={e => setForm(p => ({...p, type: e.target.value}))}>
                    {CATEGORY_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create</button>
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
