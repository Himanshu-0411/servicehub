import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NavItem = ({ icon, label, path, onClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const active = location.pathname === path;

  return (
    <button
      className={`sidebar-nav-item ${active ? 'active' : ''}`}
      onClick={onClick || (() => navigate(path))}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      {label}
    </button>
  );
};

const adminNav = [
  { icon: '📊', label: 'Dashboard', path: '/admin' },
  { icon: '👥', label: 'Users', path: '/admin/users' },
  { icon: '🔧', label: 'Providers', path: '/admin/providers' },
  { icon: '📅', label: 'Bookings', path: '/admin/bookings' },
  { icon: '🏷️', label: 'Categories', path: '/admin/categories' },
];

const userNav = [
  { icon: '🏠', label: 'Dashboard', path: '/user' },
  { icon: '🔍', label: 'Browse Providers', path: '/user/browse' },
  { icon: '📅', label: 'My Bookings', path: '/user/bookings' },
  { icon: '📍', label: 'My Addresses', path: '/user/addresses' },
];

const providerNav = [
  { icon: '🏠', label: 'Dashboard', path: '/provider' },
  { icon: '📅', label: 'Bookings', path: '/provider/bookings' },
  { icon: '👤', label: 'My Profile', path: '/provider/profile' },
];

const navMap = { ADMIN: adminNav, USER: userNav, PROVIDER: providerNav };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const nav = navMap[user?.role] || [];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <span>⚡</span> Service<span>Hub</span>
      </div>
      <div className="sidebar-section-label">{user?.role === 'ADMIN' ? 'Admin Panel' : user?.role === 'PROVIDER' ? 'Provider Panel' : 'User Panel'}</div>
      {nav.map(item => (
        <NavItem key={item.path} {...item} />
      ))}
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ padding: '8px 14px', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
          {user?.fullName}
        </div>
        <button className="sidebar-nav-item" onClick={logout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );
}
