import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [apps, setApps] = useState([]);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [feedback, setFeedback] = useState([]);

    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({ name: '', description: '', questions: [] });
    const [deletedQuestions, setDeletedQuestions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('apps'); // 'apps' | 'users' | 'categories' | 'reviews' | 'feedback'
    const [message, setMessage] = useState({ type: '', text: '' });

    const navigate = useNavigate();

    const fetchApps = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/v1/apps');
            setApps(res.data);
        } catch (err) { console.error('Error fetching apps:', err); }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/v1/users/me');
            setUsers([res.data]);
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

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            if (activeTab === 'apps') await fetchApps();
            if (activeTab === 'users') await fetchUsers();
            if (activeTab === 'categories') await fetchCategories();
            if (activeTab === 'reviews') await fetchReviews();
            if (activeTab === 'feedback') await fetchFeedback();
            setLoading(false);
        };
        loadAll();
    }, [activeTab]);

    const handleApproveReject = async (type, id, status) => {
        // type: 'apps' | 'reviews' | 'feedback'
        try {
            await axios.patch(`http://localhost:5000/api/v1/${type}/${id}/approve`, { status });
            setMessage({ type: 'success', text: `Item was successfully ${status.toLowerCase()}` });
            if (type === 'apps') fetchApps();
            if (type === 'reviews') fetchReviews();
            if (type === 'feedback') fetchFeedback();
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

    return (
        <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', gap: '2rem', minHeight: '80vh' }}>

            {/* Sidebar Navigation */}
            <aside className="glass-panel" style={{ width: '250px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }} className="text-gradient">Admin Center</h2>
                <button
                    className={`btn ${activeTab === 'apps' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setActiveTab('apps'); setMessage({ type: '', text: '' }); }}
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                    Manage Apps
                </button>
                <button
                    className={`btn ${activeTab === 'reviews' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setActiveTab('reviews'); setMessage({ type: '', text: '' }); }}
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                    Moderate Reviews
                </button>
                <button
                    className={`btn ${activeTab === 'feedback' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setActiveTab('feedback'); setMessage({ type: '', text: '' }); }}
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                    User Feedback
                </button>
                <button
                    className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setActiveTab('users'); setMessage({ type: '', text: '' }); }}
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                    Manage Users
                </button>
                <button
                    className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setActiveTab('categories'); setMessage({ type: '', text: '' }); }}
                    style={{ width: '100%', justifyContent: 'flex-start' }}
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
                                    <button className="btn btn-primary" onClick={() => navigate('/submit')}>+ Add App Directly</button>
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
                                        {apps.map(app => (
                                            <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '1rem 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    {app.logoUrl && (
                                                        <img src={app.logoUrl} alt={`${app.title} logo`} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
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
                                                    <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }} onClick={() => navigate(`/apps/${app.id}`)}>View</button>
                                                    {app.approvalStatus === 'PENDING' && (
                                                        <>
                                                            <button className="btn btn-primary" style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }} onClick={() => handleApproveReject('apps', app.id, 'APPROVED')}>Approve</button>
                                                            <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleApproveReject('apps', app.id, 'REJECTED')}>Reject</button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {apps.length === 0 && (
                                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>No pending applications.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div>
                                <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Review Moderation queue</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {reviews.map(rev => (
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
                                                    <span style={{ color: 'var(--warning)' }}>★ {rev.rating}/5</span>
                                                </span>
                                            </div>
                                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{rev.content}</p>
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
                                    {reviews.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No reviews in queue.</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'feedback' && (
                            <div>
                                <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>System Feedback</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {feedback.map(fb => (
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
                                    {feedback.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No feedback collected yet.</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div>
                                <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>User Management</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {users.map(u => (
                                        <div key={u.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <strong style={{ fontSize: '1.1rem' }}>{u.firstName} {u.lastName}</strong>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{u.email}</div>
                                            </div>
                                            <span style={{ padding: '0.3rem 0.8rem', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '0.8rem' }}>{u.role}</span>
                                        </div>
                                    ))}
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
                                        <div key={cat.id} className="glass-card" style={{ padding: '1.5rem', borderLeft: '3px solid var(--accent-blue)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{cat.name}</h3>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>{cat.description}</p>
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
