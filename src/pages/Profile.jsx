import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import gsap from 'gsap';
import { useToast } from '../context/ToastContext';

const Profile = () => {
    const { user, logout } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('settings');
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
    });
    const [activities, setActivities] = useState({ reviews: [], apps: [], forumPosts: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        gsap.fromTo('.profile-container',
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
        );
    }, []);

    // Data flows naturally from AuthContext now!
    useEffect(() => {
        if (user && activeTab === 'activity') {
            setLoading(false);
        }
    }, [activeTab, user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // API call to update user info
            await axios.put('http://localhost:5000/api/v1/users/me', formData);
            addToast('Profile updated successfully!', 'success');
        } catch (err) {
            addToast('Error updating profile.', 'error');
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
                    <button
                        className="btn btn-outline"
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger)', marginTop: '0.5rem' }}
                        onClick={() => {
                            logout();
                            addToast('Successfully logged out.', 'success');
                            navigate('/login');
                        }}
                    >
                        Logout
                    </button>
                </div>
            </aside>

            <section className="glass-panel" style={{ flexGrow: 1, padding: '2rem' }}>
                {activeTab === 'settings' && (
                    <div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Personal Information</h2>

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
                        {user.submittedApps?.length > 0 ? (
                            user.submittedApps.map(app => (
                                <div key={app.id} className="glass-card" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <strong>{app.title}</strong>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Submitted on {new Date(app.createdAt).toISOString().split('T')[0]}</div>
                                    </div>
                                    <span style={{ color: app.approvalStatus === 'APPROVED' ? 'var(--success)' : app.approvalStatus === 'REJECTED' ? 'var(--danger)' : 'var(--warning)' }}>{app.approvalStatus}</span>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-secondary)' }}>You haven't submitted any apps yet.</p>
                        )}

                        <h3 style={{ fontSize: '1.25rem', margin: '2rem 0 1rem' }}>Submitted Tutorials</h3>
                        {user.submittedTutorials?.length > 0 ? (
                            user.submittedTutorials.map(tutorial => (
                                <div key={tutorial.id} className="glass-card" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <strong>{tutorial.title}</strong>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>For app: {tutorial.app?.title || 'Unknown App'}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Submitted on {new Date(tutorial.createdAt).toISOString().split('T')[0]}</div>
                                    </div>
                                    <span style={{ color: tutorial.approvalStatus === 'APPROVED' ? 'var(--success)' : tutorial.approvalStatus === 'REJECTED' ? 'var(--danger)' : 'var(--warning)' }}>{tutorial.approvalStatus}</span>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-secondary)' }}>You haven't submitted any tutorials yet.</p>
                        )}

                        <h3 style={{ fontSize: '1.25rem', margin: '2rem 0 1rem' }}>My Reviews</h3>
                        {user.reviews?.length > 0 ? (
                            user.reviews.map(rev => (
                                <div key={rev.id} className="glass-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <strong>{rev.app?.title || 'Unknown App'}</strong>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <svg key={star} style={{ width: '16px', height: '16px', color: star <= rev.rating ? 'var(--warning)' : 'var(--border-color)', fill: 'currentColor' }} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: 600 }}>{rev.rating}/5</span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Posted {new Date(rev.createdAt).toISOString().split('T')[0]}</div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-secondary)' }}>You haven't written any reviews yet.</p>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Profile;
