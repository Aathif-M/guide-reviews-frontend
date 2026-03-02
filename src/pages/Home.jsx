import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import axios from 'axios';

const Home = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
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

    return (
        <div className="container" style={{ padding: '4rem 1.5rem' }}>
            <div ref={headerRef} className="text-center" style={{ marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
                    Welcome to <span className="text-gradient">G.U.I.D.E.</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                    The Trustpilot for elderly-friendly mobile applications. Discover, review, and help improve the digital experience for older adults.
                </p>
            </div>

            {loading ? (
                <div className="flex-center">
                    <div className="text-gradient" style={{ fontSize: '1.5rem' }}>Loading platforms...</div>
                </div>
            ) : (
                <div className="grid-cols-3">
                    {apps.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No apps approved yet. Check back later!
                        </div>
                    ) : (
                        apps.map((app, index) => (
                            <div
                                key={app.id}
                                className="glass-card"
                                style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                                ref={el => cardsRef.current[index] = el}
                                onClick={() => navigate(`/apps/${app.id}`)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{app.title}</h3>
                                    <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-cyan)' }}>
                                        {app.category?.name || 'Category'}
                                    </span>
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
