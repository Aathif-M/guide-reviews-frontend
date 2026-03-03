import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EditApp = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        playstoreLink: '',
        appstoreLink: ''
    });
    const [tutorials, setTutorials] = useState([]);
    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await axios.get('http://localhost:5000/api/v1/categories');
            setCategories(res.data);
        };
        const fetchAppDetails = async () => {
            const res = await axios.get(`http://localhost:5000/api/v1/apps/${id}`);
            const app = res.data;
            setFormData({
                title: app.title || '',
                description: app.description || '',
                categoryId: app.categoryId || '',
                playstoreLink: app.playstoreLink || '',
                appstoreLink: app.appstoreLink || ''
            });

            if (app.tutorials) {
                setTutorials(app.tutorials.map(t => ({ id: t.id, title: t.title, url: t.videoUrl, approvalStatus: t.approvalStatus })));
            }
        };

        const loadContent = async () => {
            try {
                await fetchCategories();
                await fetchAppDetails();
            } catch (err) {
                console.error(err);
            }
        }
        loadContent();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            await axios.put(`http://localhost:5000/api/v1/apps/${id}`, {
                ...formData,
                tutorials: tutorials.filter(t => t.title.trim() !== '' && t.url.trim() !== '')
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setMessage('Application updated successfully!');
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update application.');
        }
    };

    return (
        <div className="container" style={{ padding: '3rem 1.5rem', minHeight: '80vh' }}>
            <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '2rem' }}>
                &larr; Back
            </button>

            <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Edit Application</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Make core changes to the app's metadata globally.
                </p>

                {message && <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '8px', marginBottom: '1.5rem' }}>{message}</div>}
                {error && <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">App Title *</label>
                        <input type="text" className="form-control" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. MedicaReminder" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Category *</label>
                        <select className="form-control" required value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}>
                            <option value="" disabled>Select a category...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description *</label>
                        <textarea className="form-control" rows="5" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe what this app does and why it's useful..." />
                    </div>

                    <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Google Play Store Link</label>
                            <input type="url" className="form-control" value={formData.playstoreLink} onChange={(e) => setFormData({ ...formData, playstoreLink: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Apple App Store Link</label>
                            <input type="url" className="form-control" value={formData.appstoreLink} onChange={(e) => setFormData({ ...formData, appstoreLink: e.target.value })} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>YouTube Tutorials</span>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline"
                                onClick={() => setTutorials([...tutorials, { title: '', url: '' }])}
                            >
                                + Add Tutorial
                            </button>
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            {tutorials.map((tutorial, index) => (
                                <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="What is this tutorial for? (e.g. How to log in)"
                                            value={tutorial.title}
                                            onChange={(e) => {
                                                const newTutorials = [...tutorials];
                                                newTutorials[index].title = e.target.value;
                                                setTutorials(newTutorials);
                                            }}
                                            required
                                        />
                                        <input
                                            type="url"
                                            className="form-control"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            value={tutorial.url}
                                            onChange={(e) => {
                                                const newTutorials = [...tutorials];
                                                newTutorials[index].url = e.target.value;
                                                setTutorials(newTutorials);
                                            }}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        style={{ height: '48px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                        onClick={() => {
                                            const newTutorials = [...tutorials];
                                            newTutorials.splice(index, 1);
                                            setTutorials(newTutorials);
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditApp;
