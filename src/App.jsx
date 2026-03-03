import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import AppDetails from './pages/AppDetails';
import AdminDashboard from './pages/AdminDashboard';
import Footer from './components/Footer';
import { About, Contact, Terms } from './pages/StaticPages';

import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SubmitApp from './pages/SubmitApp';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const NotFound = () => <div className="container flex-center" style={{ minHeight: '80vh' }}><h1>404 Not Found</h1></div>;

const AppContent = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {user && user.role === 'ADMIN' && (
        <div style={{ background: 'var(--accent-blue)', color: '#fff', textAlign: 'center', padding: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
          Admin Mode Active
        </div>
      )}
      <header className={`glass-panel flex-between ${user?.role === 'ADMIN' ? 'admin-header' : ''}`} style={{ padding: '1rem 2rem', margin: '1rem', position: 'sticky', top: '1rem', zIndex: 100, borderTop: user?.role === 'ADMIN' ? '2px solid var(--accent-blue)' : undefined }}>
        <div className="logo text-gradient" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          G.U.I.D.E.
        </div>
        <nav>
          <ul className="flex-center" style={{ gap: '2rem', listStyle: 'none' }}>
            <li><a href="/" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Home</a></li>
            {user ? (
              <>
                <li><a href="/submit" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>+ Add App</a></li>
                {user.role === 'ADMIN' && (
                  <li><a href="/admin" style={{ color: 'var(--accent-blue)', fontWeight: 600, textDecoration: 'none' }}>Admin Dashboard</a></li>
                )}
                <li>
                  <a href="/profile" style={{ color: 'var(--text-secondary)', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Hello, {user.firstName}
                    {user.role === 'ADMIN' && <span style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>ADMIN</span>}
                  </a>
                </li>
                <li>
                  <button onClick={logout} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li><a href="/login" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Login</a></li>
                <li><a href="/register" className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>Sign Up</a></li>
              </>
            )}
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

      <Footer />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
