import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import { providerApi, categoryApi } from '../../api';
import toast from 'react-hot-toast';

const Stars = ({ rating = 0 }) => (
  <span style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(s => (
      <span key={s} style={{ color: s <= Math.round(rating) ? '#fbbf24' : '#e5e7eb', fontSize: 14 }}>★</span>
    ))}
  </span>
);

export default function BrowseProviders() {
  const [providers, setProviders]     = useState([]);
  const [categories, setCategories]   = useState([]);
  const [cities, setCities]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [selectedCity, setSelectedCity]         = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Load categories and cities once
  useEffect(() => {
    const catId = searchParams.get('categoryId');
    if (catId) setSelectedCategory(catId);

    Promise.all([categoryApi.getAll(), providerApi.getCities()])
      .then(([catRes, citiesRes]) => {
        setCategories(catRes.data || []);
        // Cities come back as lowercase strings, capitalise them
        const raw = citiesRes.data || [];
        setCities(raw.map(c => c.charAt(0).toUpperCase() + c.slice(1)));
      })
      .catch(() => {});
  }, []);

  const loadProviders = useCallback(() => {
    setLoading(true);
    setError('');
    const params = {};
    if (search.trim())     params.search     = search.trim();
    if (selectedCategory)  params.categoryId = selectedCategory;
    if (selectedCity)      params.city       = selectedCity;

    providerApi.list(params)
      .then(r => {
        const data = r.data;
        setProviders(Array.isArray(data) ? data : (data.content || []));
        setLoading(false);
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to load providers';
        setError(msg);
        toast.error(msg);
        setLoading(false);
      });
  }, [search, selectedCategory, selectedCity]);

  useEffect(() => {
    const timer = setTimeout(loadProviders, 350);
    return () => clearTimeout(timer);
  }, [loadProviders]);

  const clearAll = () => { setSearch(''); setSelectedCategory(''); setSelectedCity(''); };
  const hasFilters = search || selectedCategory || selectedCity;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Browse Service Providers</h1>
          <p className="page-subtitle">Find the perfect professional near you</p>
        </div>

        {/* Search bar */}
        <div className="search-bar" style={{ marginBottom: 16 }}>
          <span>🔍</span>
          <input
            placeholder="Search by name or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}>✕</button>
          )}
        </div>

        {/* Filter row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>

          {/* City filter */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              style={{
                appearance: 'none', padding: '8px 36px 8px 14px', borderRadius: 100,
                border: selectedCity ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                background: selectedCity ? 'var(--primary)' : 'white',
                color: selectedCity ? 'white' : 'var(--text)',
                fontWeight: 600, fontSize: 13, cursor: 'pointer', outline: 'none',
              }}>
              <option value="">📍 All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <span style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              pointerEvents: 'none', fontSize: 11, color: selectedCity ? 'white' : 'var(--text-muted)',
            }}>▼</span>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

          {/* Category pills */}
          <button
            className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setSelectedCategory('')}>
            All Services
          </button>
          {categories.map(cat => (
            <button key={cat.id}
              className={`btn btn-sm ${String(selectedCategory) === String(cat.id) ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedCategory(String(selectedCategory) === String(cat.id) ? '' : String(cat.id))}>
              {cat.name}
            </button>
          ))}

          {/* Clear all */}
          {hasFilters && (
            <button className="btn btn-sm btn-ghost" onClick={clearAll}
              style={{ color: 'var(--danger)', borderColor: 'var(--danger)', marginLeft: 'auto' }}>
              ✕ Clear Filters
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {selectedCity && (
              <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                📍 {selectedCity}
                <button onClick={() => setSelectedCity('')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, color: '#1d4ed8', padding: 0 }}>✕</button>
              </span>
            )}
            {selectedCategory && (
              <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                🔧 {categories.find(c => String(c.id) === selectedCategory)?.name}
                <button onClick={() => setSelectedCategory('')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, color: '#d97706', padding: 0 }}>✕</button>
              </span>
            )}
            {search && (
              <span style={{ background: '#f3f4f6', color: '#374151', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                🔍 "{search}"
                <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, color: '#374151', padding: 0 }}>✕</button>
              </span>
            )}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>
              {selectedCity ? `Finding providers in ${selectedCity}...` : 'Loading providers...'}
            </p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48 }}>⚠️</div>
            <p style={{ color: 'var(--danger)', marginTop: 12 }}>{error}</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={loadProviders}>Retry</button>
          </div>
        ) : providers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 56 }}>
              {selectedCity ? '📍' : '🔎'}
            </div>
            <h3 style={{ marginTop: 16, fontWeight: 700 }}>
              {selectedCity ? `No providers in ${selectedCity}` : 'No providers found'}
            </h3>
            <p style={{ marginTop: 8 }}>
              {selectedCity
                ? `Try a different city or remove the location filter`
                : hasFilters
                  ? 'Try adjusting your search or filters'
                  : 'No approved providers yet — check back soon!'}
            </p>
            {hasFilters && (
              <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={clearAll}>
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
              {providers.length} provider{providers.length !== 1 ? 's' : ''} found
              {selectedCity && <strong> in {selectedCity}</strong>}
            </p>
            <div className="providers-grid">
              {providers.map(p => (
                <div key={p.id} className="provider-card"
                  onClick={() => navigate(`/user/provider/${p.id}`)}>
                  <div className="provider-card-header">
                    <div className="provider-avatar">{p.fullName?.[0]?.toUpperCase() || '?'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{p.fullName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                        <Stars rating={p.avgRating} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {p.avgRating?.toFixed(1)} ({p.totalRatings})
                        </span>
                      </div>
                      {/* City badge */}
                      {p.city && (
                        <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 12 }}>📍</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                            {p.city}{p.state ? `, ${p.state}` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary)' }}>₹{p.hourlyRate}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>per hour</div>
                    </div>
                  </div>

                  <div className="provider-card-body">
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {p.description
                        ? (p.description.length > 100 ? p.description.slice(0, 100) + '...' : p.description)
                        : 'No description provided.'}
                    </p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                      {p.serviceCategories?.slice(0, 3).map(cat => (
                        <span key={cat.id} className="badge badge-info">{cat.name}</span>
                      ))}
                      {p.serviceCategories?.length > 3 && (
                        <span className="badge badge-gray">+{p.serviceCategories.length - 3}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)' }}>🏆 {p.experienceYears} yrs exp</span>
                      <span className={`badge ${p.isAvailable ? 'badge-success' : 'badge-gray'}`}>
                        {p.isAvailable ? '● Available' : '○ Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
