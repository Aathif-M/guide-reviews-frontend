import React from 'react';

export const About = () => (
    <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '60vh' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>About G.U.I.D.E.</h1>
        <div className="glass-panel" style={{ padding: '2rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: '1rem' }}>
                G.U.I.D.E. (Generational Usability Index for Digital Engagement) was developed as a finalized BSc Software Engineering project focusing on bridging the digital divide for elderly users.
            </p>
            <p>
                Our goal is to create a Trustpilot-style crowdsourced platform where digital tools, specifically mobile applications, are evaluated strictly on their accessibility and ease of use for older adults. By curating usability metrics and community feedback, we aim to guide senior citizens toward the best digital experiences available.
            </p>
        </div>
    </div>
);

export const Contact = () => (
    <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '60vh' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Contact Us</h1>
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <form>
                <div className="form-group">
                    <label className="form-label">Name</label>
                    <input type="text" className="form-control" placeholder="Your name" />
                </div>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" placeholder="Your email address" />
                </div>
                <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea className="form-control" rows="5" placeholder="How can we help you?"></textarea>
                </div>
                <button type="button" className="btn btn-primary" style={{ width: '100%' }}>Send Message</button>
            </form>
        </div>
    </div>
);

export const Terms = () => (
    <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '60vh' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Terms & Conditions</h1>
        <div className="glass-panel" style={{ padding: '2rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>1. Acceptance of Terms</h3>
            <p style={{ marginBottom: '1.5rem' }}>By accessing and using the G.U.I.D.E platform, you accept and agree to be bound by the terms and provisions of this agreement.</p>

            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>2. Use of Platform</h3>
            <p style={{ marginBottom: '1.5rem' }}>The reviews and heuristic data submitted to this platform must be accurate, respectful, and solely focused on usability standards.</p>

            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>3. Moderation</h3>
            <p>All submitted applications, reviews, and general feedback are subject to approval by site administrators to ensure content quality and relevance.</p>
        </div>
    </div>
);
