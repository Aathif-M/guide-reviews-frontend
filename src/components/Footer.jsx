import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{
            marginTop: 'auto',
            padding: '2rem 1.5rem',
            background: 'var(--bg-tertiary)',
            borderTop: '1px solid var(--border-color)',
            color: 'var(--text-secondary)'
        }}>
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link to="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms & Conditions</Link>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '800px', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.875rem' }}>
                    <p>&copy; {new Date().getFullYear()} G.U.I.D.E. All rights reserved.</p>
                    <Link to="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', opacity: 0.5 }}>Admin Login</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
