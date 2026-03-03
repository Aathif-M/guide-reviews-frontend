import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import axios from 'axios';

const Home = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const headerRef = useRef(null);
    const cardsRef = useRef([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch approved apps
        const fetchApps = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/v1/apps');
                setApps(res.data);
            } catch (err) {
                console.error('Error fetching apps:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, []);

    useEffect(() => {
        if (!loading) {
            gsap.fromTo(headerRef.current,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
            );

            gsap.fromTo(cardsRef.current,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out', delay: 0.3 }
            );
        }
    }, [loading, apps]);

    const categories = ['All', ...new Set(apps.map(app => app.category?.name).filter(Boolean))];

    const filteredApps = apps.filter(app => {
        const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || app.category?.name === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="container" style={{ padding: '4rem 1.5rem' }}>
            <div ref={headerRef} className="text-center" style={{ marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
                    Welcome to <span className="text-gradient">G.U.I.D.E.</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                    The Trustpilot for elderly-friendly mobile applications. Discover, review, and help improve the digital experience for older adults.
                </p>
                {/* <div style={{ marginTop: '2rem' }}>
                    <button
                        className="btn btn-primary"
                        style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', fontWeight: 600 }}
                        onClick={() => navigate('/submit')}
                    >
                        + Add App
                    </button>
                </div> */}
            </div>

            {/* Filters Section */}
            {!loading && apps.length > 0 && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search apps by name or description..."
                        style={{ maxWidth: '400px', flexGrow: 1 }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <select
                        className="form-control"
                        style={{ maxWidth: '250px' }}
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            )}

            {loading ? (
                <div className="flex-center">
                    <div className="text-gradient" style={{ fontSize: '1.5rem' }}>Loading platforms...</div>
                </div>
            ) : (
                <div className="grid-cols-3">
                    {filteredApps.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No apps found matching your criteria.
                        </div>
                    ) : (
                        filteredApps.map((app, index) => (
                            <div
                                key={app.id}
                                className="glass-card"
                                style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                                ref={el => cardsRef.current[index] = el}
                                onClick={() => navigate(`/apps/${app.id}`)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {app.logoUrl && (
                                            <img src={app.logoUrl?.startsWith('/uploads') ? `http://localhost:5000${app.logoUrl}` : app.logoUrl} alt={`${app.title} logo`} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                        )}
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.title}</h3>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                                        <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-cyan)' }}>
                                            {app.category?.name || 'Category'}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <svg key={star} style={{ width: '14px', height: '14px', color: star <= Math.round(app.computedRating || 0) ? 'var(--warning)' : 'var(--border-color)', fill: 'currentColor' }} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                                                {app.computedRating > 0 ? parseFloat(app.computedRating).toFixed(2) : 'New'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flexGrow: 1 }}>
                                    {app.description.length > 100 ? `${app.description.substring(0, 100)}...` : app.description}
                                </p>
                                <button className="btn btn-outline" style={{ width: '100%' }}>View Details</button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;
