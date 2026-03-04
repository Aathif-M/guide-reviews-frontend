import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    // --- State Management ---
    // Global User Context
    const { user } = useAuth();

    // Core Data States (Fetched from API)
    const [apps, setApps] = useState([]);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [tutorials, setTutorials] = useState([]);

    // Category Management Local States
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({ name: '', description: '', questions: [] });
    const [deletedQuestions, setDeletedQuestions] = useState([]);

    // UI Feedback States
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('apps'); // Switch between 'apps' | 'users' | 'categories' | 'reviews' | 'feedback' | 'tutorials'
    const [message, setMessage] = useState({ type: '', text: '' }); // 'success' or 'error' notifications

    // View Filters for Tabs
    const [appFilter, setAppFilter] = useState('ALL');
    const [tutorialFilter, setTutorialFilter] = useState('PENDING');
    const [reviewFilter, setReviewFilter] = useState('PENDING');
    const [feedbackFilter, setFeedbackFilter] = useState('PENDING');
    const [userFilter, setUserFilter] = useState('ALL');

    const navigate = useNavigate();

    // --- API Data Fetching Methods ---
    // These functions load the initial data required for the respective dashboard tabs
    const fetchApps = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/v1/apps');
            setApps(res.data);
        } catch (err) { console.error('Error fetching apps:', err); }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/v1/users', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setUsers(res.data);
        } catch (err) { console.error('Error fetching users:', err); }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/v1/categories');
            setCategories(res.data);
        } catch (err) { console.error('Error fetching categories:', err); }
    };

    const fetchReviews = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/v1/reviews');
            setReviews(res.data);
        } catch (err) { console.error('Error fetching reviews:', err); }
    };

    const fetchFeedback = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/v1/feedback');
            setFeedback(res.data);
        } catch (err) { console.error('Error fetching feedback:', err); }
    };

    const fetchAllData = async () => {
        setLoading(true);
        await fetchApps();
        await fetchUsers();
        await fetchCategories();
        await fetchReviews();
        await fetchFeedback();
        // We derive pending tutorials from apps object
        setLoading(false);
    };

    // Fetches all tutorial data from the backend.
    const fetchTutorials = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/v1/tutorials');
            setTutorials(res.data);
        } catch (err) { console.error('Error fetching tutorials:', err); }
    };

    // Effect hook to re-fetch data when the active tab changes.
    useEffect(() => {
        const fetchAllDataForTab = async () => {
            setLoading(true);
            switch (activeTab) {
                case 'apps': await fetchApps(); break;
                case 'users': await fetchUsers(); break;
                case 'categories': await fetchCategories(); break;
                case 'reviews': await fetchReviews(); break;
                case 'feedback': await fetchFeedback(); break;
                case 'tutorials': await fetchTutorials(); break;
                default: break;
            }
            setLoading(false);
        };
        fetchAllDataForTab();
    }, [activeTab]);

    // Run the massive data fetch once the component mounts
    useEffect(() => {
        // Redirection to prevent unauthorized access
        if (!user || user.role !== 'ADMIN') {
            navigate('/login');
            return;
        }

        const fetchAll = async () => {
            await Promise.all([fetchApps(), fetchUsers(), fetchCategories(), fetchReviews(), fetchFeedback(), fetchTutorials()]);
            setLoading(false);
        };
        fetchAll();
    }, [user, navigate]);

    // Derives a flattened list of tutorials from the 'apps' state for easier display and filtering.
    const deriveTutorials = () => {
        let list = [];
        apps.forEach(app => {
            if (app.tutorials) {
                app.tutorials.forEach(t => {
                    list.push({ ...t, appTitle: app.title });
                });
            }
        });
        return list;
    };

    // --- Action Handlers ---

    /**
     * Approves or rejects a global resource directly from the dashboard.
     * Handles Apps, Reviews, Feedback Forms, and Tutorials depending on the passed type.
     * Retrieves the resource type, its unique identifier ID, and the required target status ('APPROVED', 'REJECTED').
     * @param {string} type - The type of resource ('apps' | 'reviews' | 'feedback' | 'tutorials').
     * @param {string} id - The ID of the resource to update.
     * @param {string} status - The new approval status ('APPROVED' | 'REJECTED').
     */
    const handleApproveReject = async (type, id, status) => {
        // type: 'apps' | 'reviews' | 'feedback' | 'tutorials'
        try {

            if (type === 'tutorials') {
                await axios.patch(`http://localhost:5000/api/v1/apps/tutorials/${id}/approve`, { status });
            } else {
                await axios.patch(`http://localhost:5000/api/v1/${type}/${id}/approve`, { status });
            }

            setMessage({ type: 'success', text: `Item was successfully ${status.toLowerCase()}` });

            if (type === 'apps' || type === 'tutorials') await fetchApps();
            if (type === 'reviews') await fetchReviews();
            if (type === 'feedback') await fetchFeedback();
        } catch (err) {
            setMessage({ type: 'error', text: 'Error updating status' });
        }
    };

    const handleCategorySave = async (e) => {
        e.preventDefault();
        try {
            let catId = null;
            if (editingCategory) {
                await axios.put(`http://localhost:5000/api/v1/categories/${editingCategory.id}`, { name: categoryForm.name, description: categoryForm.description });
                catId = editingCategory.id;
            } else {
                const res = await axios.post('http://localhost:5000/api/v1/categories', { name: categoryForm.name, description: categoryForm.description });
                catId = res.data.id;
            }

            // Save Questions
            for (const q of categoryForm.questions) {
                if (q.id) {
                    if (q.isModified) {
                        await axios.put(`http://localhost:5000/api/v1/categories/questions/${q.id}`, { question: q.question });
                    }
                } else if (q.question.trim() !== '') {
                    await axios.post(`http://localhost:5000/api/v1/categories/${catId}/questions`, { question: q.question });
                }
            }
            // Delete Questions
            for (const qId of deletedQuestions) {
                await axios.delete(`http://localhost:5000/api/v1/categories/questions/${qId}`);
            }

            setMessage({ type: 'success', text: editingCategory ? 'Category updated successfully' : 'Category created successfully' });
            setEditingCategory(null);
            setCategoryForm({ name: '', description: '', questions: [] });
            setDeletedQuestions([]);
            fetchCategories();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Error saving category' });
        }
    };

    const handleCategoryDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/v1/categories/${id}`);
            setMessage({ type: 'success', text: 'Category deleted successfully' });
            fetchCategories();
        } catch (err) {
            setMessage({ type: 'error', text: 'Error deleting category' });
        }
    };

    const handleAppDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this application?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/v1/apps/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMessage({ type: 'success', text: 'Application deleted successfully' });
            fetchApps();
        } catch (err) {
            setMessage({ type: 'error', text: 'Error deleting application' });
        }
    };

    const handleSuspendUser = async (id, currentStatus) => {
        try {
            await axios.patch(`http://localhost:5000/api/v1/users/${id}/suspend`,
                { isSuspended: !currentStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setMessage({ type: 'success', text: `User successfully ${!currentStatus ? 'suspended' : 'unsuspended'}` });
            fetchUsers();
        } catch (err) {
            setMessage({ type: 'error', text: 'Error updating user suspension status' });
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', gap: '2rem', minHeight: '80vh' }}>

            {/* Sidebar Navigation */}
            <aside className="glass-card" style={{ width: '250px', minWidth: '250px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', height: 'fit-content', flexShrink: 0 }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', padding: '0.5rem' }} className="text-gradient">Admin Center</h2>
                <button
                    className={`btn ${activeTab === 'apps' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setActiveTab('apps'); setMessage({ type: '', text: '' }); }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
                >
                    Manage Apps
                </button>
                <button
                    className={`btn ${activeTab === 'reviews' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setActiveTab('reviews'); setMessage({ type: '', text: '' }); }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
                >
                    Moderate Reviews
                </button>
                <button
                    className={`btn ${activeTab === 'feedback' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setActiveTab('feedback'); setMessage({ type: '', text: '' }); }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
                >
                    User Feedback
                </button>
                <button
                    className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setActiveTab('users'); setMessage({ type: '', text: '' }); }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
                >
                    Manage Users
                </button>
                <button
                    className={`btn ${activeTab === 'tutorials' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setActiveTab('tutorials'); setMessage({ type: '', text: '' }); }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
                >
                    Moderate Tutorials
                </button>
                <button
                    className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setActiveTab('categories'); setMessage({ type: '', text: '' }); }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
                >
                    Manage Categories
                </button>
            </aside>

            {/* Main Content Area */}
            <section className="glass-panel" style={{ flexGrow: 1, padding: '2rem' }}>

                {message.text && (
                    <div style={{ padding: '1rem', background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.type === 'success' ? 'var(--success)' : 'var(--danger)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        {message.text}
                    </div>
                )}

                {loading ? (
                    <div>Loading {activeTab}...</div>
                ) : (
                    <>
                        {activeTab === 'apps' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h2 style={{ fontSize: '2rem' }}>Application Submissions</h2>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <select className="form-control" style={{ width: 'auto', padding: '0.4rem 2.5rem 0.4rem 1rem' }} value={appFilter} onChange={e => setAppFilter(e.target.value)}>
                                            <option value="ALL">All Statuses</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="APPROVED">Approved</option>
                                            <option value="REJECTED">Rejected</option>
                                        </select>
                                        <button className="btn btn-primary" onClick={() => navigate('/submit')}>+ Add App Directly</button>
                                    </div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <th style={{ padding: '1rem 0' }}>App Name</th>
                                            <th>Category</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {apps.filter(app => appFilter === 'ALL' || app.approvalStatus === appFilter).map(app => (
                                            <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '1rem 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    {app.logoUrl && (
                                                        <img src={app.logoUrl?.startsWith('/uploads') ? `http://localhost:5000${app.logoUrl}` : app.logoUrl} alt={`${app.title} logo`} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                                                    )}
                                                    {app.title}
                                                </td>
                                                <td>{app.category?.name || 'General'}</td>
                                                <td>
                                                    <span style={{
                                                        color: app.approvalStatus === 'APPROVED' ? 'var(--success)' : (app.approvalStatus === 'REJECTED' ? 'var(--danger)' : 'var(--warning)'),
                                                        background: app.approvalStatus === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : (app.approvalStatus === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'),
                                                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem'
                                                    }}>
                                                        {app.approvalStatus}
                                                    </span>
                                                </td>
                                                <td style={{ display: 'flex', gap: '0.5rem', padding: '1rem 0' }}>
                                                    <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }} onClick={() => navigate(`/edit-app/${app.id}`)}>Edit</button>

                                                    {app.approvalStatus === 'PENDING' && (
                                                        <>
                                                            <button className="btn btn-primary" style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }} onClick={() => handleApproveReject('apps', app.id, 'APPROVED')}>Approve</button>
                                                            <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleApproveReject('apps', app.id, 'REJECTED')}>Reject</button>
                                                        </>
                                                    )}
                                                    <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleAppDelete(app.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {apps.filter(app => appFilter === 'ALL' || app.approvalStatus === appFilter).length === 0 && (
                                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>No applications found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'tutorials' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h2 style={{ fontSize: '2rem' }}>Tutorial Submissions</h2>
                                    <select className="form-control" style={{ width: 'auto', padding: '0.4rem 2.5rem 0.4rem 1rem' }} value={tutorialFilter} onChange={e => setTutorialFilter(e.target.value)}>
                                        <option value="ALL">All</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="APPROVED">Approved</option>
                                        <option value="REJECTED">Rejected</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {deriveTutorials().filter(t => tutorialFilter === 'ALL' || t.approvalStatus === tutorialFilter).map(t => (
                                        <div key={t.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <strong style={{ fontSize: '1.1rem', display: 'block' }}>{t.title}</strong>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Target App: {t.appTitle}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <a href={t.videoUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}>View Link</a>
                                                <button className="btn btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleApproveReject('tutorials', t.id, 'APPROVED')}>Approve</button>
                                                <button className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleApproveReject('tutorials', t.id, 'REJECTED')}>Reject</button>
                                            </div>
                                        </div>
                                    ))}
                                    {deriveTutorials().filter(t => tutorialFilter === 'ALL' || t.approvalStatus === tutorialFilter).length === 0 && <p style={{ color: 'var(--text-muted)' }}>No tutorials found.</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h2 style={{ fontSize: '2rem' }}>Review Moderation</h2>
                                    <select className="form-control" style={{ width: 'auto', padding: '0.4rem 2.5rem 0.4rem 1rem' }} value={reviewFilter} onChange={e => setReviewFilter(e.target.value)}>
                                        <option value="ALL">All</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="APPROVED">Approved</option>
                                        <option value="REJECTED">Rejected</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {reviews.filter(rev => reviewFilter === 'ALL' || rev.approvalStatus === reviewFilter).map(rev => (
                                        <div key={rev.id} className="glass-card" style={{ padding: '1.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <strong>{rev.app?.title}</strong>
                                                <span>
                                                    <span style={{
                                                        color: rev.approvalStatus === 'APPROVED' ? 'var(--success)' : (rev.approvalStatus === 'REJECTED' ? 'var(--danger)' : 'var(--warning)'),
                                                        background: rev.approvalStatus === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : (rev.approvalStatus === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'),
                                                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', marginRight: '1rem'
                                                    }}>
                                                        {rev.approvalStatus}
                                                    </span>
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
                                                </span>
                                            </div>
                                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>{rev.content}</p>

                                            {rev.questionAnswers && rev.questionAnswers.length > 0 && (
                                                <details style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                                    <summary style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', outline: 'none' }}>View Heuristic Evaluation</summary>
                                                    <ul style={{ listStyleType: 'none', padding: '1rem 0 0 0', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        {rev.questionAnswers.map((qa, i) => (
                                                            <li key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', borderBottom: i !== rev.questionAnswers.length - 1 ? '1px dashed var(--border-color)' : 'none', paddingBottom: i !== rev.questionAnswers.length - 1 ? '0.5rem' : '0' }}>
                                                                <span>{qa.question?.question || 'Evaluation Metric'}</span>
                                                                <span style={{ color: 'var(--warning)', fontWeight: 600, flexShrink: 0 }}>{qa.answerRating} / 10</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </details>
                                            )}

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>By {rev.user?.firstName} {rev.user?.lastName}</span>
                                                {rev.approvalStatus === 'PENDING' && (
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button className="btn btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleApproveReject('reviews', rev.id, 'APPROVED')}>Approve</button>
                                                        <button className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleApproveReject('reviews', rev.id, 'REJECTED')}>Reject</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {reviews.filter(rev => reviewFilter === 'ALL' || rev.approvalStatus === reviewFilter).length === 0 && <p style={{ color: 'var(--text-muted)' }}>No reviews found.</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'feedback' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h2 style={{ fontSize: '2rem' }}>System Feedback</h2>
                                    <select className="form-control" style={{ width: 'auto', padding: '0.4rem 2.5rem 0.4rem 1rem' }} value={feedbackFilter} onChange={e => setFeedbackFilter(e.target.value)}>
                                        <option value="ALL">All</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="APPROVED">Acknowledged</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {feedback.filter(fb => feedbackFilter === 'ALL' || fb.approvalStatus === feedbackFilter).map(fb => (
                                        <div key={fb.id} className="glass-card" style={{ padding: '1.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>From: {fb.user?.firstName} ({fb.user?.email})</span>
                                                <span style={{
                                                    color: fb.approvalStatus === 'APPROVED' ? 'var(--success)' : (fb.approvalStatus === 'REJECTED' ? 'var(--danger)' : 'var(--warning)'),
                                                    padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem'
                                                }}>
                                                    {fb.approvalStatus}
                                                </span>
                                            </div>
                                            <p style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{fb.content}</p>
                                            {fb.approvalStatus === 'PENDING' && (
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button className="btn btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleApproveReject('feedback', fb.id, 'APPROVED')}>Acknowledge/Approve</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {feedback.filter(fb => feedbackFilter === 'ALL' || fb.approvalStatus === feedbackFilter).length === 0 && <p style={{ color: 'var(--text-muted)' }}>No feedback found.</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h2 style={{ fontSize: '2rem' }}>User Management</h2>
                                    <select className="form-control" style={{ width: 'auto', padding: '0.4rem 2.5rem 0.4rem 1rem' }} value={userFilter} onChange={e => setUserFilter(e.target.value)}>
                                        <option value="ALL">All Roles</option>
                                        <option value="USER">User</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {users.filter(u => userFilter === 'ALL' || u.role === userFilter).map(u => {
                                        let daysRemainingMsg = null;
                                        if (u.isSuspended && u.suspendedAt) {
                                            const suspendedDate = new Date(u.suspendedAt);
                                            const now = new Date();
                                            const diffMs = now - suspendedDate;
                                            const daysPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                            const daysRemaining = Math.max(0, 30 - daysPassed);
                                            daysRemainingMsg = `[Account deletes in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}]`;
                                        }

                                        return (
                                            <div key={u.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <strong style={{ fontSize: '1.1rem', color: u.isSuspended ? 'var(--danger)' : 'inherit', textDecoration: u.isSuspended ? 'line-through' : 'none' }}>{u.firstName} {u.lastName}</strong>
                                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                        {u.email} {u.isSuspended && <span style={{ color: 'var(--danger)', marginLeft: '10px', fontWeight: 600 }}>[Suspended] {daysRemainingMsg && <span style={{ fontSize: '0.8rem', opacity: 0.9 }}> {daysRemainingMsg}</span>}</span>}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                    <span style={{ padding: '0.3rem 0.8rem', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '0.8rem' }}>{u.role}</span>
                                                    {u.role !== 'ADMIN' && (
                                                        <button
                                                            className="btn btn-outline"
                                                            style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', color: u.isSuspended ? 'var(--success)' : 'var(--danger)', borderColor: u.isSuspended ? 'var(--success)' : 'var(--danger)' }}
                                                            onClick={() => handleSuspendUser(u.id, u.isSuspended)}
                                                        >
                                                            {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {users.filter(u => userFilter === 'ALL' || u.role === userFilter).length === 0 && (
                                        <p style={{ color: 'var(--text-muted)' }}>No users found.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'categories' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h2 style={{ fontSize: '2rem' }}>Categories & Heuristic Questions</h2>
                                    <button className="btn btn-primary" onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', description: '', questions: [] }); setDeletedQuestions([]); document.getElementById('categoryFormModal').showModal(); }}>+ Add Category</button>
                                </div>

                                <dialog id="categoryFormModal" className="glass-panel" style={{ padding: '2rem', border: 'none', borderRadius: '12px', minWidth: '400px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', margin: 'auto', position: 'fixed', top: '0', left: '0', right: '0', bottom: '0' }}>
                                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                                    <form onSubmit={(e) => { handleCategorySave(e); document.getElementById('categoryFormModal').close(); }}>
                                        <div className="form-group">
                                            <label className="form-label">Name</label>
                                            <input type="text" className="form-control" required value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Description</label>
                                            <textarea className="form-control" rows="3" value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}></textarea>
                                        </div>

                                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                            <h4 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                Questions
                                                <button type="button" className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setCategoryForm({ ...categoryForm, questions: [...categoryForm.questions, { question: '' }] })}>+ Add Question</button>
                                            </h4>
                                            {categoryForm.questions.map((q, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                    <input type="text" className="form-control" placeholder="e.g. Are buttons large enough?" value={q.question} onChange={e => {
                                                        const newQuestions = [...categoryForm.questions];
                                                        newQuestions[idx] = { ...q, question: e.target.value, isModified: true };
                                                        setCategoryForm({ ...categoryForm, questions: newQuestions });
                                                    }} required />
                                                    <button type="button" className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0 0.5rem' }} onClick={() => {
                                                        if (q.id) setDeletedQuestions([...deletedQuestions, q.id]);
                                                        const newQuestions = [...categoryForm.questions];
                                                        newQuestions.splice(idx, 1);
                                                        setCategoryForm({ ...categoryForm, questions: newQuestions });
                                                    }}>X</button>
                                                </div>
                                            ))}
                                            {categoryForm.questions.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No questions added yet.</p>}
                                        </div>

                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                                            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setCategoryForm({ name: '', description: '', questions: [] }); setDeletedQuestions([]); document.getElementById('categoryFormModal').close(); }}>Cancel</button>
                                        </div>
                                    </form>
                                </dialog>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    {categories.map(cat => (
                                        <div key={cat.id} className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-blue)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{cat.name}</h3>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>{cat.description}</p>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 500 }}>
                                                    {cat.questions?.length || 0} heuristic question{cat.questions?.length === 1 ? '' : 's'} defined
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }} onClick={() => { setEditingCategory(cat); setCategoryForm({ name: cat.name, description: cat.description || '', questions: cat.questions || [] }); setDeletedQuestions([]); document.getElementById('categoryFormModal').showModal(); }}>Edit Category</button>
                                                <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleCategoryDelete(cat.id)}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                    {categories.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No categories created yet.</p>}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </section>

        </div>
    );
};

export default AdminDashboard;
