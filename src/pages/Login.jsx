import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { useToast } from '../context/ToastContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const { login } = useAuth();
    const navigate = useNavigate();

    // Basic entry animation
    React.useEffect(() => {
        gsap.fromTo('.login-card',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
        );
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await login(email, password);
            // Determine where to send the user based on role
            // In this setup Admins log in through here as well, we just route them.
            if (data.user?.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            addToast(typeof err === 'string' ? err : 'Login failed. Please check your credentials.', 'error');
            // Shake animation on error
            gsap.fromTo('.login-card',
                { x: -10 },
                { x: 10, yoyo: true, repeat: 3, duration: 0.1, clearProps: 'x' }
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container flex-center" style={{ minHeight: '80vh', padding: '2rem' }}>
            <div className="glass-panel login-card" style={{ width: '100%', maxWidth: '450px', padding: '3rem' }}>
                <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Welcome Back</h2>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>Sign in to continue to G.U.I.D.E.</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 500 }}>Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
