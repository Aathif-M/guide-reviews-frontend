import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const EditApp = () => {
    const { id } = useParams();
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        playstoreLink: '',
        appstoreLink: ''
    });
    const [tutorials, setTutorials] = useState([]);
    const [categories, setCategories] = useState([]);
    const [logoFile, setLogoFile] = useState(null);
    const [currentLogoUrl, setCurrentLogoUrl] = useState('');
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
            setCurrentLogoUrl(app.logoUrl || '');

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
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('categoryId', formData.categoryId);
            data.append('playstoreLink', formData.playstoreLink);
            data.append('appstoreLink', formData.appstoreLink);
            // Keep existing logo URL if no new file is selected
            data.append('logoUrl', currentLogoUrl);
            data.append('tutorials', JSON.stringify(tutorials.filter(t => t.title.trim() !== '' && t.url.trim() !== '')));

            if (logoFile) {
                data.append('logo', logoFile);
            }

            await axios.put(`http://localhost:5000/api/v1/apps/${id}`, data, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            addToast('Application updated successfully!', 'success');
            setTimeout(() => navigate('/admin'), 1500);
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed to update application.', 'error');
        }
    };

    const logoDisplayUrl = currentLogoUrl?.startsWith('/uploads')
        ? `http://localhost:5000${currentLogoUrl}`
        : currentLogoUrl;

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

                {/* No inline messages - using global toast */}

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

                    <div className="form-group">
                        <label className="form-label">App Logo</label>
                        {logoDisplayUrl && !logoFile && (
                            <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <img src={logoDisplayUrl} alt="Current logo" style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current logo — upload a new file below to replace it.</span>
                            </div>
                        )}
                        {logoFile && (
                            <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <img src={URL.createObjectURL(logoFile)} alt="New logo preview" style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', border: '2px solid var(--accent-blue)' }} />
                                <span style={{ fontSize: '0.85rem', color: 'var(--accent-blue)' }}>New logo selected — will be saved on submit.</span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="form-control"
                            onChange={(e) => setLogoFile(e.target.files[0] || null)}
                            style={{ padding: '0.6rem' }}
                        />
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
                        {tutorials.length === 0 && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No tutorials attached. Add one using the button above.</span>
                        )}
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
