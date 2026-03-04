import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useToast } from '../context/ToastContext';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const { login } = useAuth();
    const navigate = useNavigate();
    const containerRef = React.useRef(null);

    // Staggered entry animation
    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Ensure card background is visible immediately or animates in first
        tl.fromTo('.login-card',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 }
        )
            // Stagger inner elements
            .fromTo('.login-anim-item',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
                '-=0.3'
            );
    }, { scope: containerRef });

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
        <div ref={containerRef} className="container flex-center" style={{ minHeight: '80vh', padding: '2rem' }}>
            <div className="glass-panel login-card" style={{ width: '100%', maxWidth: '450px', padding: '3rem' }}>
                <h2 className="text-gradient login-anim-item" style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Welcome Back</h2>
                <p className="login-anim-item" style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>Sign in to continue to G.U.I.D.E.</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group login-anim-item">
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
                    <div className="form-group login-anim-item">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0'
                                }}
                            >
                                {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary login-anim-item"
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="login-anim-item" style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 500 }}>Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
