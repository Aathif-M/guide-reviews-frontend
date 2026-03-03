import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Set default axios header
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    }, [token]);

    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get('http://localhost:5000/api/v1/users/me');
                setUser(res.data);
            } catch (err) {
                console.error('Error loading user', err);
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/v1/auth/login', { email, password });
            setToken(res.data.token);
            setUser(res.data.user);
            return res.data;
        } catch (err) {
            throw err.response?.data?.error || 'Login failed';
        }
    };

    const register = async (userData) => {
        try {
            const res = await axios.post('http://localhost:5000/api/v1/auth/register', userData);
            setToken(res.data.token);
            setUser(res.data.user);
            return res.data;
        } catch (err) {
            throw err.response?.data?.error || 'Registration failed';
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
