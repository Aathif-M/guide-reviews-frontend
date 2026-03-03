import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import gsap from 'gsap';

const Profile = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'activity'
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
    });
    const [message, setMessage] = useState('');
    const [activities, setActivities] = useState({ reviews: [], apps: [], forumPosts: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        gsap.fromTo('.profile-container',
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
        );
    }, []);

    useEffect(() => {
        if (activeTab === 'activity') {
            const fetchActivity = async () => {
                try {
                    // Future real API call merging user's apps/reviews/posts
                    setActivities({
                        reviews: [{ id: 1, app: 'MedicaReminder', rating: 5, date: '2026-03-01' }],
                        apps: [{ id: 1, title: 'EasyBank Mobile', status: 'APPROVED', date: '2026-02-28' }],
                        forumPosts: [{ id: 1, title: 'How to zoom UI?', replies: 2 }]
                    });
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchActivity();
        }
    }, [activeTab]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // API call to update user info
            await axios.put('http://localhost:5000/api/v1/users/me', formData);
            setMessage('Profile updated successfully!');
        } catch (err) {
            setMessage('Error updating profile.');
        }
    };

    if (!user) return <div className="container flex-center" style={{ minHeight: '80vh' }}>Loading...</div>;

    return (
        <div className="container profile-container" style={{ padding: '3rem 1.5rem', display: 'flex', gap: '2rem', minHeight: '80vh' }}>
            <aside className="glass-panel" style={{ width: '250px', padding: '1.5rem', height: 'fit-content' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-blue)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white' }}>
                        {user.firstName[0]}
                    </div>
                    <h3 style={{ fontSize: '1.25rem' }}>{user.firstName} {user.lastName}</h3>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.role}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                        className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        Account Settings
                    </button>
                    <button
                        className={`btn ${activeTab === 'activity' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('activity')}
                    >
                        My Activity
                    </button>
                </div>
            </aside>

            <section className="glass-panel" style={{ flexGrow: 1, padding: '2rem' }}>
                {activeTab === 'settings' && (
                    <div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Personal Information</h2>
                        {message && <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '8px', marginBottom: '1.5rem' }}>{message}</div>}

                        <form onSubmit={handleUpdate} style={{ maxWidth: '500px' }}>
                            <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">First Name</label>
                                    <input type="text" className="form-control" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Last Name</label>
                                    <input type="text" className="form-control" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label">Email Address (Cannot be changed)</label>
                                <input type="email" className="form-control" value={user.email} disabled style={{ opacity: 0.7 }} />
                            </div>
                            <button type="submit" className="btn btn-primary">Save Changes</button>
                        </form>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>My Contributions</h2>

                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Submitted Apps</h3>
                        {activities.apps.map(app => (
                            <div key={app.id} className="glass-card" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <strong>{app.title}</strong>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Submitted on {app.date}</div>
                                </div>
                                <span style={{ color: app.status === 'APPROVED' ? 'var(--success)' : 'var(--warning)' }}>{app.status}</span>
                            </div>
                        ))}

                        <h3 style={{ fontSize: '1.25rem', margin: '2rem 0 1rem' }}>My Reviews</h3>
                        {activities.reviews.map(rev => (
                            <div key={rev.id} className="glass-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>{rev.app}</strong>
                                    <span style={{ color: 'var(--warning)' }}>★ {rev.rating}/5</span>
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Posted {rev.date}</div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Profile;
