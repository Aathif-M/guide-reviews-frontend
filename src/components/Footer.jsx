import React from 'react';
import { Link } from 'react-router-dom';
import { IconBrandFacebook, IconBrandTwitter, IconBrandInstagram, IconBrandGithub } from '@tabler/icons-react';

const Footer = () => {
    return (
        <footer style={{
            marginTop: 'auto',
            padding: '4rem 2rem 2rem 2rem',
            background: 'var(--bg-tertiary)',
            borderTop: '1px solid var(--border-color)',
            color: 'var(--text-secondary)'
        }}>
            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
                    {/* Brand Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 className="text-gradient" style={{ fontSize: '1.5rem', margin: 0 }}>G.U.I.D.E.</h3>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.5', opacity: 0.8 }}>
                            Geriatric Usability Index & Digital Evaluation platform. Empowering the elderly through accessible technology analysis.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}><IconBrandFacebook size={20} /></a>
                            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}><IconBrandTwitter size={20} /></a>
                            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}><IconBrandInstagram size={20} /></a>
                            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}><IconBrandGithub size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Platform</h4>
                        <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--accent-blue)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>Home</Link>
                        <a href="/#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--accent-blue)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>How it Works</a>
                        <a href="/#recent-reviews" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--accent-blue)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>Recent Reviews</a>
                    </div>

                    {/* Legal */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Legal</h4>
                        <Link to="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--accent-blue)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>Terms & Conditions</Link>
                        <Link to="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--accent-blue)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>Privacy Policy</Link>
                        <Link to="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--accent-blue)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>Cookie Guidelines</Link>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '1.5rem',
                    fontSize: '0.875rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} G.U.I.D.E. All rights reserved.</p>
                    <p style={{ margin: 0, opacity: 0.6 }}>Designed for Accessibility</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
