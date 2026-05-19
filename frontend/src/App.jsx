import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Docs from './pages/Docs';
import Dashboard from './pages/Dashboard';
import Builder from './pages/Builder';
import AdminDashboard from './pages/AdminDashboard';
import Templates from './pages/Templates';
import CreateFromTemplate from './pages/CreateFromTemplate';
import DemoCanvas from './pages/DemoCanvas';
import Profile from './pages/Profile';
import { ErrorBoundary } from './components/ErrorBoundary';

import { useAuth } from './context/AuthContext';

function App() {
  const { user, login, logout } = useAuth();

  return (
    <BrowserRouter>
      <ScrollToTop />
      <ErrorBoundary>
        <Navbar user={user} onLogout={logout} />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/architectures" element={<Navigate to="/templates" replace />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/template/:slug" element={<Builder isTemplate={true} />} />
          <Route path="/login" element={
            !user ? <Login onLogin={login} /> : <Navigate to="/dashboard" />
          } />

          {/* Demo route — no auth required */}
          <Route path="/demo" element={<DemoCanvas />} />

          {/* Protected routes */}
          <Route path="/" element={
            user ? <Layout /> : <Navigate to="/" />
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dashboard/new" element={<CreateFromTemplate />} />
            <Route path="workflow/:id" element={<Builder />} />
            <Route path="profile" element={<Profile />} />
            
            {/* Admin only route */}
            <Route 
              path="admin" 
              element={user?.role === 'Admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />} 
            />
          </Route>

          {/* Redirect for any other path */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
