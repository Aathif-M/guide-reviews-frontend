import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useToast } from '../context/ToastContext';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const { register } = useAuth();
    const navigate = useNavigate();
    const containerRef = React.useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo('.register-card',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 }
        )
            .fromTo('.register-anim-item',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
                '-=0.3'
            );
    }, { scope: containerRef });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            addToast('Passwords do not match', 'error');
            return;
        }

        setLoading(true);

        try {
            await register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password
            });
            // On success, redirect to home
            navigate('/');
        } catch (err) {
            addToast(typeof err === 'string' ? err : 'Registration failed. Please try again.', 'error');
            gsap.fromTo('.register-card',
                { x: -10 },
                { x: 10, yoyo: true, repeat: 3, duration: 0.1, clearProps: 'x' }
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div ref={containerRef} className="container flex-center" style={{ minHeight: '80vh', padding: '2rem', paddingTop: '4rem' }}>
            <div className="glass-panel register-card" style={{ width: '100%', maxWidth: '500px', padding: '3rem' }}>
                <h2 className="text-gradient register-anim-item" style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Create Account</h2>
                <p className="register-anim-item" style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>Join the G.U.I.D.E. community</p>

                <form onSubmit={handleSubmit}>
                    <div className="grid-cols-2 register-anim-item" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label className="form-label">First Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Last Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group register-anim-item">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group register-anim-item">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group register-anim-item">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            className="form-control"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary register-anim-item"
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="register-anim-item" style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
