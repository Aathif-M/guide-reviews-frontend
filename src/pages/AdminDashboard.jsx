import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [apps, setApps] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('apps'); // 'apps' | 'users' | 'categories'

    const navigate = useNavigate();

    // Basic fetch simulating auth requirement handled in real app via Context/Token
    useEffect(() => {
        // Wait for auth structure, load mock for visual layout first
        setApps([
            { id: '1', title: 'MedicaReminderApp', status: 'PENDING', submitter: 'John Doe' },
            { id: '2', title: 'EasyBank Mobile', status: 'APPROVED', submitter: 'Jane Smith' },
        ]);
    }, []);

    return (
        <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', gap: '2rem', minHeight: '80vh' }}>

            {/* Sidebar Navigation */}
            <aside className="glass-panel" style={{ width: '250px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }} className="text-gradient">Admin Center</h2>
                <button
                    className={`btn ${activeTab === 'apps' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('apps')}
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                    Manage Apps
                </button>
                <button
                    className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('users')}
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                    Manage Users
                </button>
                <button
                    className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('categories')}
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                    Manage Categories
                </button>
            </aside>

            {/* Main Content Area */}
            <section className="glass-panel" style={{ flexGrow: 1, padding: '2rem' }}>
                {activeTab === 'apps' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '2rem' }}>Applications Pending Review</h2>
                            <button className="btn btn-primary">+ Add App Directly</button>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={{ padding: '1rem 0' }}>App Name</th>
                                    <th>Submitter</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apps.map(app => (
                                    <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem 0', fontWeight: 600 }}>{app.title}</td>
                                        <td>{app.submitter}</td>
                                        <td>
                                            <span style={{
                                                color: app.status === 'APPROVED' ? 'var(--success)' : 'var(--warning)',
                                                background: app.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem'
                                            }}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td style={{ display: 'flex', gap: '0.5rem', padding: '1rem 0' }}>
                                            <button className="btn btn-outline" style={{ padding: '0.5rem' }}>Review</button>
                                            <button className="btn btn-outline" style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>Reject</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>User Management</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>User list will be populated here mapping the backend logic.</p>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Categories & Heuristic Questions</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Admin controls for heuristic evaluations will go here.</p>
                    </div>
                )}
            </section>

        </div>
    );
};

export default AdminDashboard;
