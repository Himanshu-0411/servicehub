import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/shared/Sidebar';
import { adminApi } from '../../api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const load = () => {
    // Using the providers endpoint since we don't have a dedicated users list endpoint in simple version
    // In a full app, you'd have GET /api/admin/users
    setUsers([]);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">View and manage platform users</p>
        </div>

        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
            <h3>User List</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
              Add a <code>GET /api/admin/users</code> endpoint to the backend to display the full user list here.
              The backend entities, repositories, and security are all set up.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
