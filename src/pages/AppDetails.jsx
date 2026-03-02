import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';

const AppDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    useEffect(() => {
        const fetchAppDetails = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/v1/apps/${id}`);
                setApp(res.data);
            } catch (err) {
                console.error('Error fetching app limits/details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAppDetails();
    }, [id]);

    useEffect(() => {
        if (!loading && app) {
            gsap.fromTo(containerRef.current,
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }
            );
        }
    }, [loading, app]);

    if (loading) return <div className="container flex-center" style={{ minHeight: '80vh' }}>Loading...</div>;
    if (!app) return <div className="container flex-center" style={{ minHeight: '80vh' }}>App not found</div>;

    return (
        <div className="container" style={{ padding: '2rem 1.5rem' }} ref={containerRef}>
            <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '2rem' }}>
                &larr; Back
            </button>

            <div className="glass-panel" style={{ padding: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem' }} className="text-gradient">{app.title}</h1>
                    <span style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(42, 104, 255, 0.2)', color: 'var(--accent-blue)', fontWeight: 600 }}>
                        {app.category?.name || 'General'}
                    </span>
                </div>

                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
                    {app.description}
                </p>

                <div className="grid-cols-2" style={{ gap: '2rem', marginBottom: '3rem' }}>
                    {app.playstoreLink && (
                        <a href={app.playstoreLink} target="_blank" rel="noreferrer" className="btn btn-primary">
                            Get on Play Store
                        </a>
                    )}
                    {app.appstoreLink && (
                        <a href={app.appstoreLink} target="_blank" rel="noreferrer" className="btn btn-outline">
                            Get on App Store
                        </a>
                    )}
                </div>

                {app.youtubeTutorialUrl && (
                    <div style={{ marginBottom: '3rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Tutorial Video</h3>
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px' }}>
                            <iframe
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                src={app.youtubeTutorialUrl.replace('watch?v=', 'embed/')}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen>
                            </iframe>
                        </div>
                    </div>
                )}

                <div>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        Community Reviews ({app.reviews?.length || 0})
                    </h3>

                    {app.reviews?.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to review this application!</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {app.reviews?.map(review => (
                                <div key={review.id} className="glass-card" style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <strong>{review.user?.firstName} {review.user?.lastName}</strong>
                                        <span style={{ color: 'var(--warning)' }}>★ {review.rating}/5</span>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)' }}>{review.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppDetails;
