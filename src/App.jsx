import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import AppDetails from './pages/AppDetails';
import AdminDashboard from './pages/AdminDashboard';

// Pages placeholders
const Login = () => <div className="container flex-center" style={{ minHeight: '80vh' }}><h1>Login Page</h1></div>;
const Register = () => <div className="container flex-center" style={{ minHeight: '80vh' }}><h1>Register Page</h1></div>;
const NotFound = () => <div className="container flex-center" style={{ minHeight: '80vh' }}><h1>404 Not Found</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <header className="glass-panel flex-between" style={{ padding: '1rem 2rem', margin: '1rem', position: 'sticky', top: '1rem', zIndex: 100 }}>
          <div className="logo text-gradient" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            G.U.I.D.E.
          </div>
          <nav>
            <ul className="flex-center" style={{ gap: '2rem', listStyle: 'none' }}>
              <li><a href="/" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Home</a></li>
              <li><a href="/login" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Login</a></li>
              <li><a href="/admin" className="btn btn-outline">Admin</a></li>
            </ul>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/apps/:id" element={<AppDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
