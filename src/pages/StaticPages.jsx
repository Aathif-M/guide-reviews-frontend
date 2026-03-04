import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { IconMail, IconPhone, IconMapPin, IconHeartHandshake, IconEyeCheck, IconShieldCheck } from '@tabler/icons-react';

export const About = () => {
    const containerRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo('.about-header h1',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8 }
        )
            .fromTo('.about-header p',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8 },
                '-=0.6'
            )
            .fromTo('.about-content > div',
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.2 },
                '-=0.4'
            )
            .fromTo('.glass-panel',
                { x: 30, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.6, stagger: 0.15 },
                '-=0.6'
            );
    }, { scope: containerRef });

    return (
        <div ref={containerRef} style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* Header Section */}
            <section className="about-header" style={{ backgroundColor: '#1c1c1c', color: 'white', padding: '5rem 1.5rem', textAlign: 'center' }}>
                <div className="container">
                    <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>
                        About <span className="text-gradient">G.U.I.D.E.</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '700px', margin: '0 auto' }}>
                        Bridging the digital divide by curating accessible, readable, and intuitive mobile experiences for the elderly community.
                    </p>
                </div>
            </section>

            {/* Story & Mission */}
            <section className="container about-content" style={{ padding: '4rem 1.5rem' }}>
                <div className="grid-cols-2" style={{ gap: '4rem', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Our Story</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '1rem' }}>
                            G.U.I.D.E. (Generational Usability Index for Digital Engagement) was developed as a finalized BSc Software Engineering project focusing on a critical but often overlooked demographic: older adults navigating a rapidly digitizing world.
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8 }}>
                            We recognized that while thousands of apps exist, very few are designed with the cognitive and visual needs of seniors in mind. This platform was born out of a desire to highlight tools that genuinely empower users, regardless of age.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ backgroundColor: 'rgba(59,130,246,0.1)', padding: '1rem', borderRadius: '12px' }}>
                                <IconEyeCheck size={32} style={{ color: 'var(--accent-blue)' }} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Accessibility First</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>We evaluate apps strictly on font readability, contrast ratios, and intuitive navigation.</p>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ backgroundColor: 'rgba(139,92,246,0.1)', padding: '1rem', borderRadius: '12px' }}>
                                <IconHeartHandshake size={32} style={{ color: '#8b5cf6' }} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Community Driven</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Real reviews from real users. A crowdsourced platform mirroring transparent community insights.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

/**
 * Contact Page Component
 * Renders the "Get In Touch" interface including contact details mapping and a functional inquiry form.
 * Uses the global ToastContext to provide non-blocking user feedback upon submission.
 */
export const Contact = () => {
    // State to hold the user's input before transmission
    const [formData, setFormData] = useState({ fullName: '', email: '', message: '' });
    // State to act as a blocker for duplicate or rapid submissions
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await axios.post('http://localhost:5000/api/v1/contact', formData);
            addToast(res.data.message || 'Message sent successfully!', 'success');
            setFormData({ fullName: '', email: '', message: '' });
        } catch (error) {
            addToast(error.response?.data?.error || 'Failed to send message. Please try again later.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* Header Section */}
            <section style={{ backgroundColor: '#1c1c1c', color: 'white', padding: '5rem 1.5rem', textAlign: 'center', marginBottom: '4rem' }}>
                <div className="container">
                    <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>
                        Get in <span className="text-gradient">Touch</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
                        Have questions about an app, our moderation policies, or want to suggest a new category? We're here to help.
                    </p>
                </div>
            </section>

            <div className="container" style={{ padding: '0 1.5rem' }}>
                <div className="grid-cols-2" style={{ gap: '4rem' }}>
                    {/* Contact Info */}
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2rem' }}>Contact Information</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <IconMail size={28} style={{ color: 'var(--accent-blue)' }} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Email Us</h4>
                                    <p style={{ color: 'var(--text-secondary)' }}>support@guide-platform.edu</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <IconPhone size={28} style={{ color: 'var(--warning)' }} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Call Us</h4>
                                    <p style={{ color: 'var(--text-secondary)' }}>+94 77 123 4567</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <IconMapPin size={28} style={{ color: '#0ea5e9' }} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Headquarters</h4>
                                    <p style={{ color: 'var(--text-secondary)' }}>BSc SE Project Lab, Colombo, Sri Lanka</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="glass-panel" style={{ padding: '3rem' }}>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label">Full Name</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="form-control" placeholder="John Doe" required style={{ width: '100%', padding: '1rem', borderRadius: '8px' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label">Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" placeholder="john@example.com" required style={{ width: '100%', padding: '1rem', borderRadius: '8px' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label className="form-label">Your Message</label>
                                <textarea name="message" value={formData.message} onChange={handleChange} className="form-control" rows="5" placeholder="How can we assist you today?" required style={{ width: '100%', padding: '1rem', borderRadius: '8px' }}></textarea>
                            </div>
                            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: '8px', opacity: isSubmitting ? 0.7 : 1 }}>
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Terms = () => {
    const containerRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

        tl.fromTo('.terms-header',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8 }
        )
            .fromTo('.terms-card',
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8 },
                '-=0.5'
            )
            .fromTo('.terms-section',
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.6, stagger: 0.15 },
                '-=0.4'
            );
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="container" style={{ padding: '4rem 1.5rem', minHeight: '80vh', maxWidth: '800px' }}>
            <div className="terms-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(59,130,246,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <IconShieldCheck size={40} style={{ color: 'var(--accent-blue)' }} />
                </div>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>Terms & Conditions</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Please read these terms carefully before using the G.U.I.D.E. platform.</p>
            </div>

            <div className="glass-panel" style={{ padding: '3rem', borderRadius: '16px' }}>
                <div className="terms-section" style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>1. Acceptance of Terms</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        By accessing and using the Generational Usability Index for Digital Engagement (G.U.I.D.E.) platform, you explicitly accept and agree to be bound by the terms and provisions of this agreement.
                    </p>
                </div>

                <div className="terms-section" style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>2. Platform Scope and Usage</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        The primary objective of this platform is to collate and present heuristic data determining the usability of software for elderly individuals. All submitted reviews, tutorials, and forum posts must strictly pertain to these usability standards. Off-topic, promotional, or abusive content will be removed immediately.
                    </p>
                </div>

                <div className="terms-section" style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>3. Content Moderation</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        To ensure the integrity of our trust-based ecosystem, all user-submitted reviews, apps, and forum queries are routed through a rigorous administrative moderation process. We reserve the right to reject or delete content that violates our community guidelines without prior notice.
                    </p>
                </div>

                <div className="terms-section" style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>4. Data Privacy</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        We do not sell user data to third parties. Email addresses and basic profile information are used strictly for communication, moderation updates, and localized recommendations.
                    </p>
                </div>
            </div>
        </div>
    );
};
