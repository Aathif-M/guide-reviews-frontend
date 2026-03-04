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
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '800px', margin: '0 auto', fontSize: '0.875rem' }}>
                <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} G.U.I.D.E. All rights reserved.</p>
                <Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none', opacity: 0.8 }}>Terms & Conditions</Link>
            </div>
        </footer>
    );
};

export default Footer;
