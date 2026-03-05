import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="container flex-center" style={{ minHeight: '80vh' }}>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireAdmin && user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
