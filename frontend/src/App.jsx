import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterProvider from './pages/RegisterProvider';
import Landing from './pages/Landing';

// User pages
import UserDashboard from './pages/user/Dashboard';
import BrowseProviders from './pages/user/BrowseProviders';
import ProviderDetail from './pages/user/ProviderDetail';
import MyBookings from './pages/user/MyBookings';
import MyAddresses from './pages/user/MyAddresses';

// Provider pages
import ProviderDashboard from './pages/provider/Dashboard';
import ProviderProfile from './pages/provider/Profile';
import ProviderBookings from './pages/provider/Bookings';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProviders from './pages/admin/Providers';
import AdminBookings from './pages/admin/Bookings';
import AdminCategories from './pages/admin/Categories';
import AdminUsers from './pages/admin/Users';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/provider" element={<RegisterProvider />} />

          {/* User Panel */}
          <Route path="/user" element={
            <ProtectedRoute role="USER"><UserDashboard /></ProtectedRoute>
          } />
          <Route path="/user/browse" element={
            <ProtectedRoute role="USER"><BrowseProviders /></ProtectedRoute>
          } />
          <Route path="/user/provider/:id" element={
            <ProtectedRoute role="USER"><ProviderDetail /></ProtectedRoute>
          } />
          <Route path="/user/bookings" element={
            <ProtectedRoute role="USER"><MyBookings /></ProtectedRoute>
          } />
          <Route path="/user/addresses" element={
            <ProtectedRoute role="USER"><MyAddresses /></ProtectedRoute>
          } />

          {/* Provider Panel */}
          <Route path="/provider" element={
            <ProtectedRoute role="PROVIDER"><ProviderDashboard /></ProtectedRoute>
          } />
          <Route path="/provider/profile" element={
            <ProtectedRoute role="PROVIDER"><ProviderProfile /></ProtectedRoute>
          } />
          <Route path="/provider/bookings" element={
            <ProtectedRoute role="PROVIDER"><ProviderBookings /></ProtectedRoute>
          } />

          {/* Admin Panel */}
          <Route path="/admin" element={
            <ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/providers" element={
            <ProtectedRoute role="ADMIN"><AdminProviders /></ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute role="ADMIN"><AdminBookings /></ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute role="ADMIN"><AdminCategories /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute role="ADMIN"><AdminUsers /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
