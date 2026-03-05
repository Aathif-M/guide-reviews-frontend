import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, NavLink, useLocation } from 'react-router-dom';
import { IconSun, IconMoon } from '@tabler/icons-react';

import Home from './pages/Home';
import AppDetails from './pages/AppDetails';
import AdminDashboard from './pages/AdminDashboard';
import Footer from './components/Footer';
import { About, Contact, Terms } from './pages/StaticPages';

import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SubmitApp from './pages/SubmitApp';
import EditApp from './pages/EditApp';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';

const NotFound = () => <div className="container flex-center" style={{ minHeight: '80vh' }}><h1>404 Not Found</h1></div>;

const AppContent = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {user && user.role === 'ADMIN' && (
        <div style={{ background: 'var(--accent-blue)', color: '#fff', textAlign: 'center', padding: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
          Admin Mode Active
        </div>
      )}
      <header className={`glass-panel flex-between ${user?.role === 'ADMIN' ? 'admin-header' : ''}`} style={{ padding: '1rem 2rem', margin: '1rem', position: 'sticky', top: '1rem', zIndex: 100, borderTop: user?.role === 'ADMIN' ? '2px solid var(--accent-blue)' : undefined }}>
        <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '0.5rem' }}>
            <img
              src={theme === 'dark' ? '/assets/logo-dark.png' : '/assets/logo-light.png'}
              alt="G.U.I.D.E. Logo"
              style={{ height: '40px', objectFit: 'contain' }}
            />
            {/* <span className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 700 }}>G.U.I.D.E.</span> */}
          </Link>
        </div>
        <nav>
          <ul className="flex-center" style={{ gap: '2rem', listStyle: 'none' }}>
            <li><NavLink to="/" style={({ isActive }) => ({ color: isActive ? 'var(--accent-blue)' : 'var(--text-primary)', textDecoration: 'none', fontWeight: isActive ? 600 : 400, textShadow: isActive ? '0 0 12px rgba(59, 130, 246, 0.5)' : 'none' })}>Home</NavLink></li>
            <li><NavLink to="/about" style={({ isActive }) => ({ color: isActive ? 'var(--accent-blue)' : 'var(--text-primary)', textDecoration: 'none', fontWeight: isActive ? 600 : 400, textShadow: isActive ? '0 0 12px rgba(59, 130, 246, 0.5)' : 'none' })}>About Us</NavLink></li>
            <li><NavLink to="/contact" style={({ isActive }) => ({ color: isActive ? 'var(--accent-blue)' : 'var(--text-primary)', textDecoration: 'none', fontWeight: isActive ? 600 : 400, textShadow: isActive ? '0 0 12px rgba(59, 130, 246, 0.5)' : 'none' })}>Contact Us</NavLink></li>
            {(!user || user.role !== 'ADMIN') && (
              <li><NavLink to={user ? "/submit" : "/login"} state={!user ? { from: location } : undefined} style={({ isActive }) => ({ color: isActive ? 'var(--accent-blue)' : 'var(--text-primary)', textDecoration: 'none', fontWeight: isActive ? 600 : 400, textShadow: isActive ? '0 0 12px rgba(59, 130, 246, 0.5)' : 'none' })}>+ Add App</NavLink></li>
            )}
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <li><NavLink to="/admin" style={({ isActive }) => ({ color: 'var(--accent-blue)', fontWeight: isActive ? 800 : 600, textDecoration: isActive ? 'underline' : 'none', textUnderlineOffset: '4px', textShadow: isActive ? '0 0 12px rgba(59, 130, 246, 0.5)' : 'none' })}>Admin Dashboard</NavLink></li>
                )}
                <li>
                  <NavLink to="/profile" style={({ isActive }) => ({ color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)', fontWeight: isActive ? 600 : 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', textShadow: isActive ? '0 0 12px rgba(59, 130, 246, 0.5)' : 'none' })}>
                    Hello, {user.firstName}
                    {user.role === 'ADMIN' && <span style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>ADMIN</span>}
                  </NavLink>
                </li>
                {/* <li>
                  <button onClick={() => {
                    logout();
                    addToast('Successfully logged out.', 'success');
                  }} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>Logout</button>
                </li> */}
              </>
            ) : (
              <>
                <li><Link to="/login" state={{ from: location }} className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>Login</Link></li>
              </>
            )}
            <li>
              <button
                onClick={toggleTheme}
                className="btn btn-outline"
                style={{ padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? <IconMoon size={20} /> : <IconSun size={20} />}
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apps/:id" element={<AppDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/submit" element={<ProtectedRoute><SubmitApp /></ProtectedRoute>} />
          <Route path="/edit-app/:id" element={<ProtectedRoute requireAdmin={true}><EditApp /></ProtectedRoute>} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer theme={theme} />
    </div >
  );
};

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
