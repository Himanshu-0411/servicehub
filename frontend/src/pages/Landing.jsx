import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryApi } from '../api';

export default function Landing() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    categoryApi.getAll().then(r => setCategories(r.data)).catch(() => {});
  }, []);

  return (
    <div className="landing">
      <div className="hero">
        <nav className="hero-nav">
          <div className="hero-logo">⚡ Service<span>Hub</span></div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}
              onClick={() => navigate('/login')}>Sign In</button>
            <button className="btn" style={{ background: 'var(--accent)', color: 'white' }}
              onClick={() => navigate('/register')}>Get Started</button>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-text">
            <h1>Book Trusted<br />Services <span>Instantly</span></h1>
            <p>Connect with vetted professionals for home services, tutoring, beauty, and more. One platform, zero hassle.</p>
            <div className="hero-btns">
              <button className="btn btn-lg" style={{ background: 'var(--accent)', color: 'white' }}
                onClick={() => navigate('/register')}>Book a Service →</button>
              <button className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.4)' }}
                onClick={() => navigate('/register/provider')}>Become a Provider</button>
            </div>
          </div>
        </div>
      </div>

      <div className="categories-section">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 800 }}>Services We Offer</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: 16 }}>From home repairs to personal tutoring — we've got you covered</p>
        </div>
        <div className="categories-grid">
          {categories.map(cat => (
            <div key={cat.id} className="category-pill" onClick={() => navigate('/login')}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🔧</div>
              {cat.name}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--primary)', padding: '80px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white' }}>Are you a service professional?</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 12, fontSize: 16, marginBottom: 32 }}>
          Join ServiceHub and grow your client base. Get discovered by thousands of customers.
        </p>
        <button className="btn btn-lg btn-accent" onClick={() => navigate('/register/provider')}>
          Join as Provider →
        </button>
      </div>
    </div>
  );
}
