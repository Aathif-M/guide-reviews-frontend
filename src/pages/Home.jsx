import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import axios from 'axios';
import { IconSearch, IconStarFilled, IconStarHalfFilled, IconStar } from '@tabler/icons-react';
import * as TablerIcons from '@tabler/icons-react';

const Home = () => {
    const [apps, setApps] = useState([]);
    const [recentReviews, setRecentReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortOrder, setSortOrder] = useState('default');

    // Refs for animations
    const headerRef = useRef(null);
    const categoryRef = useRef(null);
    const recentReviewsRef = useRef(null);
    const cardsRef = useRef([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [appsRes, reviewsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/v1/apps'),
                    axios.get('http://localhost:5000/api/v1/reviews/recent').catch(() => ({ data: [] }))
                ]);
                setApps(appsRes.data);
                setRecentReviews(reviewsRes.data);
            } catch (err) {
                console.error('Error fetching home data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    useEffect(() => {
        if (!loading) {
            gsap.fromTo(headerRef.current,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
            );

            gsap.fromTo(categoryRef.current,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
            );

            gsap.fromTo(recentReviewsRef.current,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.3 }
            );

            gsap.fromTo(cardsRef.current,
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power2.out', delay: 0.4 }
            );
        }
    }, [loading, apps, recentReviews]);

    // Data Processing
    const categories = ['All', ...new Set(apps.map(app => app.category?.name).filter(Boolean))];
    const categoryDetails = apps.reduce((acc, app) => {
        if (app.category && app.category.name && !acc[app.category.name]) {
            acc[app.category.name] = app.category.iconName;
        }
        return acc;
    }, {});

    const filteredApps = apps.filter(app => {
        const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || app.category?.name === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const sortedApps = [...filteredApps].sort((a, b) => {
        if (sortOrder === 'highToLow') {
            return (b.computedRating || 0) - (a.computedRating || 0);
        } else if (sortOrder === 'lowToHigh') {
            return (a.computedRating || 0) - (b.computedRating || 0);
        }
        return 0; // default is often chronological or raw array order
    });

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<IconStarFilled key={i} size={16} style={{ color: 'var(--warning)' }} />);
            } else if (i - 0.5 <= rating) {
                stars.push(<IconStarHalfFilled key={i} size={16} style={{ color: 'var(--warning)' }} />);
            } else {
                stars.push(<IconStar key={i} size={16} style={{ color: '#dcdce6' }} />);
            }
        }
        return <div style={{ display: 'flex', gap: '2px' }}>{stars}</div>;
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '80vh' }}>
                <div className="text-gradient" style={{ fontSize: '1.5rem' }}>Loading G.U.I.D.E...</div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* HERO SECTION */}
            <section ref={headerRef} className="hero-section" style={{
                background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <h1 className="hero-title">
                        Discover accessible apps. <br />
                        <span className="text-gradient">Find tools you can rely on.</span>
                    </h1>
                    <p className="text-body" style={{ margin: '0 auto 3rem auto' }}>
                        G.U.I.D.E. is the premier platform for discovering and reviewing elderly-friendly mobile applications.
                    </p>

                    {/* Big Hero Search Bar */}
                    <div className="search-bar-wrap">
                        <div style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                            <IconSearch size={24} />
                        </div>
                        <input
                            type="text"
                            placeholder="What are you looking for?"
                            style={{
                                flexGrow: 1,
                                border: 'none',
                                outline: 'none',
                                fontSize: '1.2rem',
                                padding: '1rem',
                                color: 'var(--text-primary)',
                                borderRadius: '32px'
                            }}
                            value={searchQuery}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            className="btn btn-primary"
                            style={{
                                padding: '0 2rem',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                borderRadius: '32px'
                            }}
                            onClick={() => {
                                // Scroll to apps section
                                window.scrollTo({ top: document.getElementById('apps-section').offsetTop - 100, behavior: 'smooth' });
                            }}
                        >
                            Search
                        </button>
                    </div>

                    {/* Search Auto-Suggestions Dropdown */}
                    {isSearchFocused && searchQuery.trim() !== '' && (
                        <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 10px)',
                            left: '0',
                            right: '0',
                            maxWidth: '800px',
                            margin: '0 auto',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: '16px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                            zIndex: 50,
                            overflow: 'hidden',
                            border: '1px solid var(--border-color)',
                            textAlign: 'left'
                        }}>
                            {filteredApps.length > 0 ? (
                                filteredApps.slice(0, 5).map((app, idx) => (
                                    <div
                                        key={app.id}
                                        onClick={() => navigate(`/apps/${app.id}`)}
                                        style={{
                                            padding: '1rem 1.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            cursor: 'pointer',
                                            borderBottom: idx === Math.min(filteredApps.length, 5) - 1 ? 'none' : '1px solid var(--border-color)',
                                            backgroundColor: 'var(--bg-secondary)',
                                            transition: 'background-color 0.2s',
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                                    >
                                        {app.logoUrl ? (
                                            <img src={app.logoUrl?.startsWith('/uploads') ? `http://localhost:5000${app.logoUrl}` : app.logoUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <TablerIcons.IconDeviceMobile size={20} style={{ color: 'var(--text-muted)' }} />
                                            </div>
                                        )}
                                        <div style={{ flexGrow: 1 }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.05rem' }}>{app.title}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{app.category?.name || 'Uncategorized'}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <IconStarFilled size={14} style={{ color: 'var(--warning)' }} />
                                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                {app.computedRating > 0 ? parseFloat(app.computedRating).toFixed(1) : 'New'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '1.5rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                    No apps found matching "{searchQuery}"
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Decorative background blobs */}
                <div style={{ position: 'absolute', top: '-100px', left: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', zIndex: 1 }}></div>
                <div style={{ position: 'absolute', bottom: '-150px', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', zIndex: 1 }}></div>
            </section>

            {/* EXPLORE CATEGORIES SECTION */}
            <section ref={categoryRef} className="container" style={{ padding: '4rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center', color: 'var(--text-primary)' }}>
                    Explore categories
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '1.5rem',
                    justifyContent: 'center'
                }}>
                    <div
                        onClick={() => {
                            setSelectedCategory('All');
                            window.scrollTo({ top: document.getElementById('apps-section').offsetTop - 100, behavior: 'smooth' });
                        }}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                            padding: '1.5rem 1rem', backgroundColor: selectedCategory === 'All' ? 'rgba(14, 165, 233, 0.1)' : 'var(--bg-secondary)',
                            borderRadius: '12px', cursor: 'pointer', border: selectedCategory === 'All' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TablerIcons.IconApps size={24} style={{ color: 'var(--text-primary)' }} />
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>All Categories</span>
                    </div>

                    {Object.entries(categoryDetails).map(([catName, iconName]) => {
                        const Icon = iconName && TablerIcons[iconName] ? TablerIcons[iconName] : TablerIcons.IconCategory;
                        const isSelected = selectedCategory === catName;
                        return (
                            <div
                                key={catName}
                                onClick={() => {
                                    setSelectedCategory(catName);
                                    window.scrollTo({ top: document.getElementById('apps-section').offsetTop - 100, behavior: 'smooth' });
                                }}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                                    padding: '1.5rem 1rem', backgroundColor: isSelected ? 'rgba(14, 165, 233, 0.1)' : 'var(--bg-secondary)',
                                    borderRadius: '12px', cursor: 'pointer', border: isSelected ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                                }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={24} style={{ color: 'var(--text-primary)' }} />
                                </div>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', fontSize: '0.9rem' }}>{catName}</span>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* RECENT REVIEWS SECTION */}
            {recentReviews.length > 0 && (
                <section id="recent-reviews" ref={recentReviewsRef} style={{ backgroundColor: 'var(--bg-tertiary)', padding: '4rem 0' }}>
                    <div className="container" style={{ padding: '0 1.5rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-primary)' }}>
                            Recent reviews
                        </h2>

                        {/* Reviews Grid */}
                        <div className="grid-cols-4">
                            {recentReviews.slice(0, 4).map(review => (
                                <div
                                    key={review.id}
                                    style={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        borderRadius: '16px',
                                        padding: '1.25rem',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: 'pointer',
                                        border: '1px solid var(--border-color)',
                                        height: '100%'
                                    }}
                                    onClick={() => navigate(`/apps/${review.appId}`)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                                            {review.user?.firstName?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                                {review.user?.firstName} {review.user?.lastName}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        {renderStars(review.rating)}
                                    </div>

                                    <p style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: 1.5, flexGrow: 1, marginBottom: '1.5rem' }}>
                                        {review.content.length > 120 ? `${review.content.substring(0, 120)}...` : review.content}
                                    </p>

                                    {/* App Info Footer */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                        {review.app?.logoUrl ? (
                                            <img src={review.app.logoUrl?.startsWith('/uploads') ? `http://localhost:5000${review.app.logoUrl}` : review.app.logoUrl} alt={`${review.app.title} logo`} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <TablerIcons.IconDeviceMobile size={16} />
                                            </div>
                                        )}
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {review.app?.title}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* APPS GRID SECTION */}
            <section id="apps-section" className="container" style={{ padding: '4rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {selectedCategory === 'All' ? Object.keys(categoryDetails).length > 0 ? 'Top Rated Apps' : 'Platform Apps' : `${selectedCategory} Apps`}
                    </h2>

                    <select
                        className="form-control"
                        style={{ maxWidth: '200px', padding: '0.5rem 1rem', borderRadius: '8px' }}
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="default">Most Relevant</option>
                        <option value="highToLow">Highest Rated</option>
                        <option value="lowToHigh">Lowest Rated</option>
                    </select>
                </div>

                <div className="grid-cols-3">
                    {sortedApps.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0' }}>
                            <TablerIcons.IconSearch size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>No apps found</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or category filter.</p>
                        </div>
                    ) : (
                        sortedApps.map((app, index) => (
                            <div
                                key={app.id}
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border-color)',
                                    padding: '1.5rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                                }}
                                ref={el => cardsRef.current[index] = el}
                                onClick={() => navigate(`/apps/${app.id}`)}
                                onMouseOver={e => {
                                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)';
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.02)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                                    {app.logoUrl ? (
                                        <img src={app.logoUrl?.startsWith('/uploads') ? `http://localhost:5000${app.logoUrl}` : app.logoUrl} alt={`${app.title} logo`} style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                                    ) : (
                                        <div style={{ width: '64px', height: '64px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <TablerIcons.IconDeviceMobile size={32} style={{ color: 'var(--text-muted)' }} />
                                        </div>
                                    )}
                                    <div style={{ flexGrow: 1 }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {app.title}
                                        </h3>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            {renderStars(app.computedRating || 0)}
                                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                                {app.computedRating > 0 ? parseFloat(app.computedRating).toFixed(1) : 'New'}
                                            </span>
                                        </div>

                                        <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            {app.category?.name || 'Uncategorized'}
                                        </span>
                                    </div>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {app.description}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section id="how-it-works" style={{ padding: '4rem 1.5rem', backgroundColor: 'var(--bg-main)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                        How it works
                    </h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
                        Getting started with G.U.I.D.E. is simple and straightforward.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1', minWidth: '250px', maxWidth: '300px', backgroundColor: 'var(--bg-secondary)', padding: '2rem 1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', border: '4px solid var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <TablerIcons.IconSearch size={36} style={{ color: 'var(--accent-blue)' }} />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>1. Discover Apps</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>Browse or search for apps based on categories related to accessibility and lifestyle.</p>
                        </div>

                        <div style={{ flex: '1', minWidth: '250px', maxWidth: '300px', backgroundColor: 'var(--bg-secondary)', padding: '2rem 1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', border: '4px solid #0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <TablerIcons.IconBook size={36} style={{ color: '#0ea5e9' }} />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>2. Read Reviews</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>Read detailed heuristic evaluations from other users to ensure the app meets your needs.</p>
                        </div>

                        <div style={{ flex: '1', minWidth: '250px', maxWidth: '300px', backgroundColor: 'var(--bg-secondary)', padding: '2rem 1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', border: '4px solid #8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <TablerIcons.IconPencil size={36} style={{ color: '#8b5cf6' }} />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>3. Share Experience</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>Leave your own reviews to help the community make informed decisions.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* TRUST INDICATORS SECTION */}
            <section style={{ padding: '4rem 1.5rem', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                        Be heard
                    </h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
                        G.U.I.D.E. is a review platform that's open to everyone. Share your experiences to help others make better choices and encourage companies to up their game.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1', minWidth: '250px', maxWidth: '300px' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <TablerIcons.IconUserCheck size={32} style={{ color: 'var(--accent-blue)' }} />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Authentic Reviews</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>We use smart moderation to ensure reviews are genuine and helpful for the elderly community.</p>
                        </div>
                        <div style={{ flex: '1', minWidth: '250px', maxWidth: '300px' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <TablerIcons.IconAccessible size={32} style={{ color: '#0ea5e9' }} />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Heuristic Focus</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Our platform emphasizes accessibility, readability, and ease-of-use guidelines tailored for older adults.</p>
                        </div>
                        <div style={{ flex: '1', minWidth: '250px', maxWidth: '300px' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <TablerIcons.IconBuildingCommunity size={32} style={{ color: '#8b5cf6' }} />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Community Driven</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Join thousands of users sharing their insights through Q&A forums and detailed app feedback.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
