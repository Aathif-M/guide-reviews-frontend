import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { IconHeart, IconDeviceGamepad2, IconBriefcase, IconBook, IconCamera, IconBuildingBank, IconVideo } from '@tabler/icons-react';
import * as TablerIcons from '@tabler/icons-react';
import IconPicker from '../components/IconPicker';

/**
 * ActionMenu Component (Dropdown for mobile-friendly table actions)
 */
const ActionMenu = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
                className="btn btn-outline"
                style={{ padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                title="Actions"
            >
                <TablerIcons.IconDotsVertical size={18} />
            </button>
            {isOpen && (
                <>
                    <div
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }}
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                    />
                    <div
                        className="glass-panel"
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: 'calc(100% + 5px)',
                            zIndex: 100,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '0.5rem',
                            gap: '0.5rem',
                            minWidth: '120px',
                            background: 'var(--bg-secondary)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }}
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                    >
                        {children}
                    </div>
                </>
            )}
        </div>
    );
};

/**
 * AdminDashboard Component
 * 
 * Provides a comprehensive interface for administrators to manage
 * the G.U.I.D.E. platform. This includes managing apps, moderating user reviews
 * and tutorials, administrating user accounts, and configuring heuristic evaluation categories.
 */
const AdminDashboard = () => {
    // Global context containing the currently authenticated user's details
    const { user } = useAuth();
    // Context hook for displaying floating toast notifications
    const { addToast } = useToast();

    // --- Core Data States ---
    // These states hold the main datasets fetched from the backend API.
    const [apps, setApps] = useState([]);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [tutorials, setTutorials] = useState([]);
    const [pendingForums, setPendingForums] = useState({ posts: [], answers: [] });

    // Category Management Local States
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({ name: '', description: '', iconName: '', questions: [] });
    const [deletedQuestions, setDeletedQuestions] = useState([]);
    const [viewingActivityUser, setViewingActivityUser] = useState(null);
    const [userActivity, setUserActivity] = useState(null);

    // UI Feedback States
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('apps'); // 'apps' | 'users' | 'categories' | 'reviews' | 'tutorials' | 'forums'

    // View Filters for Tabs
    const [appFilter, setAppFilter] = useState('ALL');
    const [tutorialFilter, setTutorialFilter] = useState('PENDING');
    const [tutorialAppFilter, setTutorialAppFilter] = useState('ALL');
    const [reviewFilter, setReviewFilter] = useState('PENDING');
    const [userFilter, setUserFilter] = useState('ALL');
    const [userStatusFilter, setUserStatusFilter] = useState('ALL');

    // Search States
    const [appSearch, setAppSearch] = useState('');
    const [reviewSearch, setReviewSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [tutorialSearch, setTutorialSearch] = useState('');
    const [categorySearch, setCategorySearch] = useState('');
    const [forumSearch, setForumSearch] = useState('');

    // --- Additional Search & Filter States ---
    const [appCategoryFilter, setAppCategoryFilter] = useState('ALL');
    const [reviewRatingFilter, setReviewRatingFilter] = useState('ALL');
    const [forumFilter, setForumFilter] = useState('PENDING');

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
            const res = await axios.get('http://localhost:5000/api/v1/reviews', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setReviews(res.data);
        } catch (err) { console.error('Error fetching reviews:', err); }
    };

    const fetchAllData = async () => {
        setLoading(true);
        await fetchApps();
        await fetchUsers();
        await fetchCategories();
        await fetchReviews();
        // We derive pending tutorials from apps object
        setLoading(false);
    };

    // Fetches all apps so that deriveTutorials() can compute the flattened tutorial list.
    // There is no standalone /tutorials endpoint; tutorials are embedded in the apps response.
    const fetchTutorials = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/v1/apps', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setApps(res.data);
        } catch (err) { console.error('Error fetching tutorials (via apps):', err); }
    };

    const fetchPendingForums = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/v1/forums/pending', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPendingForums(res.data);
        } catch (err) { console.error('Error fetching pending forums:', err); }
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
                case 'tutorials': await fetchTutorials(); break;
                case 'forums': await fetchPendingForums(); break;
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
            await Promise.all([fetchApps(), fetchUsers(), fetchCategories(), fetchReviews(), fetchTutorials()]);
            setLoading(false);
        };
        fetchAll();
    }, [user, navigate]);

    /**
     * Helper function to derive a flattened list of tutorials from the 'apps' dataset.
     * This makes it easier to display and filter tutorials globally in the UI without complex nesting.
     * @returns {Array} A flattened array of tutorial objects containing parent app metadata.
     */
    const deriveTutorials = () => {
        let list = [];
        apps.forEach(app => {
            if (app.tutorials) {
                app.tutorials.forEach(t => {
                    list.push({ ...t, appTitle: app.title, appLogoUrl: app.logoUrl });
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
        // type: 'apps' | 'reviews' | 'tutorials' | 'forums/posts' | 'forums/answers'
        try {

            if (type === 'tutorials') {
                await axios.patch(`http://localhost:5000/api/v1/apps/tutorials/${id}/approve`, { status }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            } else if (type.startsWith('forums')) {
                await axios.patch(`http://localhost:5000/api/v1/${type}/${id}/approve`, { status }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            } else {
                await axios.patch(`http://localhost:5000/api/v1/${type}/${id}/approve`, { status }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            }

            addToast(`Item was successfully ${status.toLowerCase()}`, 'success');

            if (type === 'apps' || type === 'tutorials') await fetchApps();
            if (type === 'reviews') await fetchReviews();
            if (type.startsWith('forums')) await fetchPendingForums();
        } catch (err) {
            addToast('Error updating status', 'error');
        }
    };

    const handleCategorySave = async (e) => {
        e.preventDefault();
        try {
            let catId = null;
            if (editingCategory) {
                await axios.put(`http://localhost:5000/api/v1/categories/${editingCategory.id}`, { name: categoryForm.name, description: categoryForm.description, iconName: categoryForm.iconName });
                catId = editingCategory.id;
            } else {
                const res = await axios.post('http://localhost:5000/api/v1/categories', { name: categoryForm.name, description: categoryForm.description, iconName: categoryForm.iconName });
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

            addToast(editingCategory ? 'Category updated successfully' : 'Category created successfully', 'success');
            setEditingCategory(null);
            setCategoryForm({ name: '', description: '', iconName: '', questions: [] });
            setDeletedQuestions([]);
            fetchCategories();
        } catch (err) {
            addToast(err.response?.data?.error || 'Error saving category', 'error');
        }
    };

    /**
     * Permanently deletes a category from the system.
     * Requires administrative confirmation before proceeding.
     * @param {string} id - The ID of the category to delete.
     */
    const handleCategoryDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/v1/categories/${id}`);
            addToast('Category deleted successfully', 'success');
            fetchCategories();
        } catch (err) {
            addToast('Error deleting category', 'error');
        }
    };

    /**
     * Permanently deletes an application from the system.
     * Requires administrative confirmation before proceeding.
     * @param {string} id - The ID of the application to delete.
     */
    const handleAppDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this application?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/v1/apps/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            addToast('Application deleted successfully', 'success');
            fetchApps();
        } catch (err) {
            addToast('Error deleting application', 'error');
        }
    };

    const handleSuspendUser = async (id, currentStatus) => {
        try {
            await axios.patch(`http://localhost:5000/api/v1/users/${id}/suspend`,
                { isSuspended: !currentStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            addToast(`User successfully ${!currentStatus ? 'suspended' : 'unsuspended'}`, 'success');
            fetchUsers();
        } catch (err) {
            addToast('Error updating user suspension status', 'error');
        }
    };

    const handleViewActivity = async (userId) => {
        try {
            setViewingActivityUser(userId);
            setUserActivity(null);
            document.getElementById('userActivityModal').showModal();
            const res = await axios.get(`http://localhost:5000/api/v1/users/${userId}/activities`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setUserActivity(res.data);
        } catch (err) {
            addToast('Failed to fetch user activity', 'error');
            document.getElementById('userActivityModal').close();
        }
    };

    return (
        <div className="container admin-layout">

            {/* Sidebar Navigation */}
            <aside className="glass-card admin-sidebar">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', padding: '0.5rem' }} className="text-gradient admin-sidebar-title">Admin Center</h2>
                <button
                    className={`btn ${activeTab === 'apps' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setActiveTab('apps'); }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
                >
                    Manage Apps
                </button>
                <button
                    className={`btn ${activeTab === 'reviews' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setActiveTab('reviews'); }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
                >
                    Moderate Reviews
                </button>
                <button
                    className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setActiveTab('users'); }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
                >
                    Manage Users
                </button>
                <button
                    className={`btn ${activeTab === 'tutorials' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setActiveTab('tutorials'); }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
                >
                    Moderate Tutorials
                </button>
                <button
                    className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setActiveTab('categories'); }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
                >
                    Manage Categories
                </button>
                <button
                    className={`btn ${activeTab === 'forums' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setActiveTab('forums'); }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
                >
                    Moderate Forum
                </button>
            </aside>

            {/* Main Content Area */}
            <section className="glass-panel admin-main-content">

                {/* Floating toast notifications used globally */}

                {loading ? (
                    <div>Loading {activeTab}...</div>
                ) : (
                    <>
                        {activeTab === 'apps' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h2 style={{ fontSize: '2rem' }}>Application Submissions</h2>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search apps..."
                                            style={{ width: '200px' }}
                                            value={appSearch}
                                            onChange={e => setAppSearch(e.target.value)}
                                        />
                                        <select
                                            className="form-control"
                                            style={{ width: 'auto', padding: '0.4rem 2.5rem 0.4rem 1rem' }}
                                            value={appCategoryFilter}
                                            onChange={e => setAppCategoryFilter(e.target.value)}
                                        >
                                            <option value="ALL">All Categories</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
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
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {apps
                                            .filter(app => appFilter === 'ALL' || app.approvalStatus === appFilter)
                                            .filter(app => appCategoryFilter === 'ALL' || app.category?.name === appCategoryFilter)
                                            .filter(app => app.title.toLowerCase().includes(appSearch.toLowerCase()))
                                            .map(app => (
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
                                                    <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                                                        <ActionMenu>
                                                            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4rem 0.8rem', fontSize: '0.85rem', border: 'none' }} onClick={() => navigate(`/edit-app/${app.id}`)}>Edit</button>

                                                            {app.approvalStatus === 'PENDING' && (
                                                                <>
                                                                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleApproveReject('apps', app.id, 'APPROVED')}>Approve</button>
                                                                    <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--danger)', border: 'none' }} onClick={() => handleApproveReject('apps', app.id, 'REJECTED')}>Reject</button>
                                                                </>
                                                            )}
                                                            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--danger)', border: 'none' }} onClick={() => handleAppDelete(app.id)}>Delete</button>
                                                        </ActionMenu>
                                                    </td>
                                                </tr>
                                            ))}
                                        {apps
                                            .filter(app => appFilter === 'ALL' || app.approvalStatus === appFilter)
                                            .filter(app => appCategoryFilter === 'ALL' || app.category?.name === appCategoryFilter)
                                            .filter(app => app.title.toLowerCase().includes(appSearch.toLowerCase()))
                                            .length === 0 && (
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
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search tutorials..."
                                            style={{ width: '200px' }}
                                            value={tutorialSearch}
                                            onChange={e => setTutorialSearch(e.target.value)}
                                        />
                                        <select className="form-control" style={{ width: 'auto', padding: '0.4rem 2.5rem 0.4rem 1rem' }} value={tutorialAppFilter} onChange={e => setTutorialAppFilter(e.target.value)}>
                                            <option value="ALL">All Apps</option>
                                            {[...new Set(deriveTutorials().map(t => t.appTitle))].map(title => (
                                                <option key={title} value={title}>{title}</option>
                                            ))}
                                        </select>
                                        <select className="form-control" style={{ width: 'auto', padding: '0.4rem 2.5rem 0.4rem 1rem' }} value={tutorialFilter} onChange={e => setTutorialFilter(e.target.value)}>
                                            <option value="ALL">All Statuses</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="APPROVED">Approved</option>
                                            <option value="REJECTED">Rejected</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {deriveTutorials()
                                        .filter(t => tutorialFilter === 'ALL' || t.approvalStatus === tutorialFilter)
                                        .filter(t => tutorialAppFilter === 'ALL' || t.appTitle === tutorialAppFilter)
                                        .filter(t => t.title.toLowerCase().includes(tutorialSearch.toLowerCase()))
                                        .map(t => (
                                            <div key={t.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <strong style={{ fontSize: '1.1rem', display: 'block' }}>{t.title}</strong>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                                                        Target App:
                                                        {t.appLogoUrl && <img src={t.appLogoUrl.startsWith('/uploads') ? `http://localhost:5000${t.appLogoUrl}` : t.appLogoUrl} alt={`${t.appTitle} logo`} style={{ width: '16px', height: '16px', borderRadius: '4px', objectFit: 'cover' }} />}
                                                        {t.appTitle}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <a href={t.videoUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>View Link</a>
                                                    <ActionMenu>
                                                        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleApproveReject('tutorials', t.id, 'APPROVED')}>Approve</button>
                                                        <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--danger)', border: 'none' }} onClick={() => handleApproveReject('tutorials', t.id, 'REJECTED')}>Reject</button>
                                                    </ActionMenu>
                                                </div>
                                            </div>
                                        ))}
                                    {deriveTutorials()
                                        .filter(t => tutorialFilter === 'ALL' || t.approvalStatus === tutorialFilter)
                                        .filter(t => tutorialAppFilter === 'ALL' || t.appTitle === tutorialAppFilter)
                                        .filter(t => t.title.toLowerCase().includes(tutorialSearch.toLowerCase()))
                                        .length === 0 && <p style={{ color: 'var(--text-muted)' }}>No tutorials found.</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h2 style={{ fontSize: '2rem' }}>Review Moderation</h2>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search reviews..."
                                            style={{ width: '250px' }}
                                            value={reviewSearch}
                                            onChange={e => setReviewSearch(e.target.value)}
                                        />
                                        <select
                                            className="form-control"
                                            style={{ width: 'auto', padding: '0.4rem 2.5rem 0.4rem 1rem' }}
                                            value={reviewRatingFilter}
                                            onChange={e => setReviewRatingFilter(e.target.value)}
                                        >
                                            <option value="ALL">All Ratings</option>
                                            <option value="5">5 Stars</option>
                                            <option value="4">4 Stars</option>
                                            <option value="3">3 Stars</option>
                                            <option value="2">2 Stars</option>
                                            <option value="1">1 Star</option>
                                        </select>
                                        <select className="form-control" style={{ width: 'auto', padding: '0.4rem 2.5rem 0.4rem 1rem' }} value={reviewFilter} onChange={e => setReviewFilter(e.target.value)}>
                                            <option value="ALL">All Statuses</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="APPROVED">Approved</option>
                                            <option value="REJECTED">Rejected</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {reviews
                                        .filter(rev => reviewFilter === 'ALL' || rev.approvalStatus === reviewFilter)
                                        .filter(rev => reviewRatingFilter === 'ALL' || rev.rating === parseInt(reviewRatingFilter))
                                        .filter(rev => {
                                            const searchLower = reviewSearch.toLowerCase();
                                            return (
                                                rev.content.toLowerCase().includes(searchLower) ||
                                                rev.app?.title.toLowerCase().includes(searchLower) ||
                                                `${rev.user?.firstName} ${rev.user?.lastName}`.toLowerCase().includes(searchLower)
                                            );
                                        })
                                        .map(rev => (
                                            <div key={rev.id} className="glass-card" style={{ padding: '1.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        {rev.app?.logoUrl && <img src={rev.app.logoUrl.startsWith('/uploads') ? `http://localhost:5000${rev.app.logoUrl}` : rev.app.logoUrl} alt={`${rev.app?.title} logo`} style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />}
                                                        {rev.app?.title}
                                                    </strong>
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
                                                        <ActionMenu>
                                                            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleApproveReject('reviews', rev.id, 'APPROVED')}>Approve</button>
                                                            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--danger)', border: 'none' }} onClick={() => handleApproveReject('reviews', rev.id, 'REJECTED')}>Reject</button>
                                                        </ActionMenu>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    {reviews
                                        .filter(rev => reviewFilter === 'ALL' || rev.approvalStatus === reviewFilter)
                                        .filter(rev => reviewRatingFilter === 'ALL' || rev.rating === parseInt(reviewRatingFilter))
                                        .filter(rev => {
                                            const searchLower = reviewSearch.toLowerCase();
                                            return (
                                                rev.content.toLowerCase().includes(searchLower) ||
                                                rev.app?.title.toLowerCase().includes(searchLower) ||
                                                `${rev.user?.firstName} ${rev.user?.lastName}`.toLowerCase().includes(searchLower)
                                            );
                                        })
                                        .length === 0 && <p style={{ color: 'var(--text-muted)' }}>No reviews found.</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h2 style={{ fontSize: '2rem' }}>User Management</h2>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search users..."
                                            style={{ width: '200px' }}
                                            value={userSearch}
                                            onChange={e => setUserSearch(e.target.value)}
                                        />
                                        <select className="form-control" style={{ width: 'auto', padding: '0.4rem 2.5rem 0.4rem 1rem' }} value={userStatusFilter} onChange={e => setUserStatusFilter(e.target.value)}>
                                            <option value="ALL">All Statuses</option>
                                            <option value="ACTIVE">Live</option>
                                            <option value="SUSPENDED">Suspended</option>
                                        </select>
                                        <select className="form-control" style={{ width: 'auto', padding: '0.4rem 2.5rem 0.4rem 1rem' }} value={userFilter} onChange={e => setUserFilter(e.target.value)}>
                                            <option value="ALL">All Roles</option>
                                            <option value="USER">User</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </div>
                                </div>

                                <dialog id="userActivityModal" className="glass-panel" style={{ padding: '2.5rem', border: '1px solid var(--border-color)', borderRadius: '16px', minWidth: '600px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', margin: 'auto', position: 'fixed', top: '0', left: '0', right: '0', bottom: '0', color: 'var(--text-primary)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <TablerIcons.IconActivity style={{ color: 'var(--accent-blue)' }} size={28} />
                                            User Activity Overview
                                        </h3>
                                        <button className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => document.getElementById('userActivityModal').close()} title="Close">
                                            <TablerIcons.IconX size={20} />
                                        </button>
                                    </div>
                                    {!userActivity ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                            <p style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <TablerIcons.IconLoader size={24} />
                                                Loading activity data...
                                            </p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            {/* User Profile Summary Card */}
                                            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '4px solid var(--accent-blue)' }}>
                                                <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '50%', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <TablerIcons.IconUser size={40} />
                                                </div>
                                                <div>
                                                    <h4 style={{ fontSize: '1.4rem', margin: '0 0 0.25rem 0', fontWeight: 700 }}>{userActivity.firstName} {userActivity.lastName}</h4>
                                                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <TablerIcons.IconMail size={16} />
                                                        {userActivity.email}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Statistics Grid */}
                                            <div>
                                                <h4 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <TablerIcons.IconChartPie size={20} />
                                                    Engagement Metrics
                                                </h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                                                    <div className="glass-card" style={{ padding: '1.5rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                                        <TablerIcons.IconApps size={28} style={{ color: 'var(--accent-blue)', marginBottom: '0.75rem' }} />
                                                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', lineHeight: 1 }}>{userActivity.submittedApps?.length || 0}</div>
                                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Apps</div>
                                                    </div>

                                                    <div className="glass-card" style={{ padding: '1.5rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                                        <TablerIcons.IconStar size={28} style={{ color: 'var(--success)', marginBottom: '0.75rem' }} />
                                                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', lineHeight: 1 }}>{userActivity.reviews?.length || 0}</div>
                                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reviews</div>
                                                    </div>

                                                    <div className="glass-card" style={{ padding: '1.5rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                                        <TablerIcons.IconDeviceDesktopAnalytics size={28} style={{ color: 'var(--warning)', marginBottom: '0.75rem' }} />
                                                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', lineHeight: 1 }}>{userActivity.submittedTutorials?.length || 0}</div>
                                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tutorials</div>
                                                    </div>

                                                    <div className="glass-card" style={{ padding: '1.5rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                                        <TablerIcons.IconMessageCircle size={28} style={{ color: '#ec4899', marginBottom: '0.75rem' }} />
                                                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', lineHeight: 1 }}>{userActivity.forumPosts?.length || 0}</div>
                                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Questions</div>
                                                    </div>

                                                    <div className="glass-card" style={{ padding: '1.5rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                                        <TablerIcons.IconMessage2 size={28} style={{ color: '#8b5cf6', marginBottom: '0.75rem' }} />
                                                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', lineHeight: 1 }}>{userActivity.forumAnswers?.length || 0}</div>
                                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Answers</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </dialog>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {users
                                        .filter(u => userFilter === 'ALL' || u.role === userFilter)
                                        .filter(u => userStatusFilter === 'ALL' || (userStatusFilter === 'ACTIVE' ? !u.isSuspended : u.isSuspended))
                                        .filter(u => {
                                            const searchLower = userSearch.toLowerCase();
                                            return (
                                                `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchLower) ||
                                                u.email.toLowerCase().includes(searchLower)
                                            );
                                        })
                                        .map(u => {
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
                                                        <ActionMenu>
                                                            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4rem 0.8rem', fontSize: '0.8rem', border: 'none' }} onClick={() => handleViewActivity(u.id)}>View Activity</button>
                                                            {u.role !== 'ADMIN' && (
                                                                <button
                                                                    className="btn btn-outline"
                                                                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: u.isSuspended ? 'var(--success)' : 'var(--danger)', border: 'none' }}
                                                                    onClick={() => handleSuspendUser(u.id, u.isSuspended)}
                                                                >
                                                                    {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                                                                </button>
                                                            )}
                                                        </ActionMenu>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    {users
                                        .filter(u => userFilter === 'ALL' || u.role === userFilter)
                                        .filter(u => userStatusFilter === 'ALL' || (userStatusFilter === 'ACTIVE' ? !u.isSuspended : u.isSuspended))
                                        .filter(u => {
                                            const searchLower = userSearch.toLowerCase();
                                            return (
                                                `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchLower) ||
                                                u.email.toLowerCase().includes(searchLower)
                                            );
                                        })
                                        .length === 0 && (
                                            <p style={{ color: 'var(--text-muted)' }}>No users found.</p>
                                        )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'categories' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                                    <h2 style={{ fontSize: '2rem' }}>Categories & Heuristic Questions</h2>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search categories..."
                                            style={{ width: '250px' }}
                                            value={categorySearch}
                                            onChange={e => setCategorySearch(e.target.value)}
                                        />
                                        <button className="btn btn-primary" onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', description: '', iconName: '', questions: [] }); setDeletedQuestions([]); document.getElementById('categoryFormModal').showModal(); }}>+ Add Category</button>
                                    </div>
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
                                        <div className="form-group">
                                            <label className="form-label">Icon (Optional)</label>
                                            <IconPicker
                                                value={categoryForm.iconName}
                                                onChange={val => setCategoryForm({ ...categoryForm, iconName: val })}
                                                categoryName={categoryForm.name}
                                            />
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
                                            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setCategoryForm({ name: '', description: '', iconName: '', questions: [] }); setDeletedQuestions([]); document.getElementById('categoryFormModal').close(); }}>Cancel</button>
                                        </div>
                                    </form>
                                </dialog>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    {categories
                                        .filter(cat => {
                                            const searchLower = categorySearch.toLowerCase();
                                            return (
                                                cat.name.toLowerCase().includes(searchLower) ||
                                                (cat.description && cat.description.toLowerCase().includes(searchLower))
                                            );
                                        })
                                        .map(cat => {
                                            const CategoryIcon = cat.iconName ? TablerIcons[cat.iconName] : null;
                                            return (
                                                <div key={cat.id} className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-blue)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                    <div>
                                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            {CategoryIcon && <CategoryIcon size={24} style={{ color: 'var(--accent-blue)' }} />}
                                                            {cat.name}
                                                        </h3>
                                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>{cat.description}</p>
                                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 500 }}>
                                                            {cat.questions?.length || 0} heuristic question{cat.questions?.length === 1 ? '' : 's'} defined
                                                        </p>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <ActionMenu>
                                                            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4rem 0.8rem', fontSize: '0.8rem', border: 'none' }} onClick={() => { setEditingCategory(cat); setCategoryForm({ name: cat.name, description: cat.description || '', iconName: cat.iconName || '', questions: cat.questions || [] }); setDeletedQuestions([]); document.getElementById('categoryFormModal').showModal(); }}>Edit Category</button>
                                                            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)', border: 'none' }} onClick={() => handleCategoryDelete(cat.id)}>Delete</button>
                                                        </ActionMenu>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    {categories
                                        .filter(cat => {
                                            const searchLower = categorySearch.toLowerCase();
                                            return (
                                                cat.name.toLowerCase().includes(searchLower) ||
                                                (cat.description && cat.description.toLowerCase().includes(searchLower))
                                            );
                                        })
                                        .length === 0 && <p style={{ color: 'var(--text-muted)' }}>No categories created yet.</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'forums' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h2 style={{ fontSize: '2rem' }}>Moderate Forums</h2>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search questions or apps..."
                                            style={{ width: '250px' }}
                                            value={forumSearch}
                                            onChange={e => setForumSearch(e.target.value)}
                                        />
                                        <select className="form-control" style={{ width: 'auto', padding: '0.4rem 2.5rem 0.4rem 1rem' }} value={forumFilter} onChange={e => setForumFilter(e.target.value)}>
                                            <option value="ALL">All Statuses</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="APPROVED">Approved</option>
                                            <option value="REJECTED">Rejected</option>
                                        </select>
                                    </div>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Pending Questions ({pendingForums?.posts?.length || 0})</h3>
                                {pendingForums?.posts?.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>No pending questions to moderate.</p>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                                        {pendingForums.posts.filter(post => {
                                            const matchesSearch = post.title.toLowerCase().includes(forumSearch.toLowerCase()) ||
                                                post.content.toLowerCase().includes(forumSearch.toLowerCase()) ||
                                                (post.app?.title && post.app.title.toLowerCase().includes(forumSearch.toLowerCase()));
                                            const matchesFilter = forumFilter === 'ALL' || post.approvalStatus === forumFilter;
                                            return matchesSearch && matchesFilter;
                                        }).map(post => (
                                            <div key={post.id} className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--warning)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{post.title}</h4>
                                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{post.content}</p>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                            Posted by <strong style={{ color: 'var(--text-primary)' }}>{post.user?.firstName} {post.user?.lastName}</strong> for app <strong style={{ color: 'var(--text-primary)' }}>{post.app?.title}</strong>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                                                        {post.approvalStatus === 'PENDING' ? (
                                                            <>
                                                                <button className="btn btn-outline" style={{ color: 'var(--success)', borderColor: 'var(--success)', padding: '0.4rem 1rem', width: '100%' }} onClick={() => handleApproveReject('forums/posts', post.id, 'APPROVED')}>Approve</button>
                                                                <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.4rem 1rem', width: '100%' }} onClick={() => handleApproveReject('forums/posts', post.id, 'REJECTED')}>Reject</button>
                                                            </>
                                                        ) : (
                                                            <span style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', background: post.approvalStatus === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: post.approvalStatus === 'APPROVED' ? 'var(--success)' : 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>
                                                                {post.approvalStatus}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Pending Answers ({pendingForums?.answers?.length || 0})</h3>
                                {pendingForums?.answers?.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)' }}>No pending answers to moderate.</p>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr)', gap: '1.5rem' }}>
                                        {pendingForums.answers.filter(answer => {
                                            const matchesSearch = answer.content.toLowerCase().includes(forumSearch.toLowerCase()) ||
                                                (answer.post?.title && answer.post.title.toLowerCase().includes(forumSearch.toLowerCase()));
                                            const matchesFilter = forumFilter === 'ALL' || answer.approvalStatus === forumFilter;
                                            return matchesSearch && matchesFilter;
                                        }).map(answer => (
                                            <div key={answer.id} className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--warning)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <p style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.05rem' }}>{answer.content}</p>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                            Answered by <strong style={{ color: 'var(--text-primary)' }}>{answer.user?.firstName} {answer.user?.lastName}</strong> on question <strong style={{ color: 'var(--text-primary)' }}>{answer.post?.title}</strong>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                                                        {answer.approvalStatus === 'PENDING' ? (
                                                            <>
                                                                <button className="btn btn-outline" style={{ color: 'var(--success)', borderColor: 'var(--success)', padding: '0.4rem 1rem', width: '100%' }} onClick={() => handleApproveReject('forums/answers', answer.id, 'APPROVED')}>Approve</button>
                                                                <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.4rem 1rem', width: '100%' }} onClick={() => handleApproveReject('forums/answers', answer.id, 'REJECTED')}>Reject</button>
                                                            </>
                                                        ) : (
                                                            <span style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', background: answer.approvalStatus === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: answer.approvalStatus === 'APPROVED' ? 'var(--success)' : 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>
                                                                {answer.approvalStatus}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </section>

        </div>
    );
};

export default AdminDashboard;
