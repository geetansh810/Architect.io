import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Architectures from './pages/Architectures';
import Login from './pages/Login';
import Docs from './pages/Docs';
import Dashboard from './pages/Dashboard';
import Builder from './pages/Builder';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('architect_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('architect_user', JSON.stringify(userData));
    if (token) localStorage.setItem('architect_token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('architect_user');
    localStorage.removeItem('architect_token');
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
        <Route path="/architectures" element={<Architectures />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/template/:slug" element={<Builder isTemplate={true} />} />
        <Route path="/login" element={
          !user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />
        } />

        {/* Protected routes */}
        <Route path="/" element={
          user ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/" />
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="workflow/:id" element={<Builder />} />
          
          {/* Admin only route */}
          <Route 
            path="admin" 
            element={user?.role === 'Admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />} 
          />
        </Route>

        {/* Redirect for any other path */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
