import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const SubmitApp = () => {
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        playstoreLink: '',
        appstoreLink: ''
    });
    const [tutorials, setTutorials] = useState([]);
    const [logoFile, setLogoFile] = useState(null);
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/v1/categories');
                setCategories(res.data);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('categoryId', formData.categoryId);
            submitData.append('playstoreLink', formData.playstoreLink);
            submitData.append('appstoreLink', formData.appstoreLink);

            const validTutorials = tutorials.filter(t => t.title.trim() !== '' && t.url.trim() !== '');
            submitData.append('tutorials', JSON.stringify(validTutorials));

            if (logoFile) submitData.append('logo', logoFile);

            await axios.post('http://localhost:5000/api/v1/apps', submitData);
            addToast('Application submitted successfully! Sent for admin approval.', 'success');
            setFormData({ title: '', description: '', categoryId: '', playstoreLink: '', appstoreLink: '' });
            setTutorials([]);
            setLogoFile(null);
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed to submit application.', 'error');
        }
    };

    return (
        <div className="container" style={{ padding: '3rem 1.5rem', minHeight: '80vh' }}>
            <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '2rem' }}>
                &larr; Back
            </button>

            <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Submit an Application</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Help map the digital world for older adults by submitting an app you find useful or want to be reviewed.
                </p>

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
                        <label className="form-label">App Logo (Image File)</label>
                        <input type="file" accept="image/*" className="form-control" onChange={(e) => setLogoFile(e.target.files[0])} style={{ padding: '0.6rem' }} />
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
                            <button type="button" className="btn btn-sm btn-outline" onClick={() => setTutorials([...tutorials, { title: '', url: '' }])}>
                                + Add Tutorial
                            </button>
                        </label>
                        {tutorials.length === 0 && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Attach tutorial videos to help seniors learn to use this app. (Optional)</span>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            {tutorials.map((tutorial, index) => (
                                <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <input type="text" className="form-control" placeholder="What is this tutorial for? (e.g. How to log in)" value={tutorial.title} onChange={(e) => { const n = [...tutorials]; n[index].title = e.target.value; setTutorials(n); }} required />
                                        <input type="url" className="form-control" placeholder="YouTube URL (https://youtube.com/watch?v=...)" value={tutorial.url} onChange={(e) => { const n = [...tutorials]; n[index].url = e.target.value; setTutorials(n); }} required />
                                    </div>
                                    <button type="button" className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setTutorials(tutorials.filter((_, i) => i !== index))}>Remove</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Submit for Review</button>
                </form>
            </div>
        </div>
    );
};

export default SubmitApp;
