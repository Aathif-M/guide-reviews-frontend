import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';

const AppDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [app, setApp] = useState(null);
    const [forums, setForums] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    // Form States
    const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' | 'forum'
    const [reviewRating, setReviewRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0); // Track hovering over stars
    const [reviewText, setReviewText] = useState('');
    const [forumTitle, setForumTitle] = useState('');
    const [forumContent, setForumContent] = useState('');
    const [questionAnswers, setQuestionAnswers] = useState({}); // Stores answers as { questionId: rating }
    const [message, setMessage] = useState({ type: '', text: '' }); // type: 'success' | 'error'
    const [editingReviewId, setEditingReviewId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [appRes, forumRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/v1/apps/${id}`),
                    axios.get(`http://localhost:5000/api/v1/apps/${id}/forums`)
                ]);
                setApp(appRes.data);
                setForums(forumRes.data);
            } catch (err) {
                console.error('Error fetching details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (!loading && app) {
            gsap.fromTo(containerRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
            );
        }
    }, [loading, app]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Ensure all category questions are answered
        const categoryQuestions = app.category?.questions || [];
        if (categoryQuestions.length > Object.keys(questionAnswers).length) {
            setMessage({ type: 'error', text: 'Please answer all category-specific questions before submitting your review.' });
            return;
        }

        try {
            const formattedAnswers = Object.entries(questionAnswers).map(([questionId, rating]) => ({
                questionId,
                answerRating: Number(rating)
            }));

            if (editingReviewId) {
                await axios.put(`http://localhost:5000/api/v1/reviews/${editingReviewId}`, {
                    rating: Number(reviewRating),
                    content: reviewText,
                    answers: formattedAnswers
                });
                setMessage({ type: 'success', text: 'Review updated successfully! It is now pending admin approval.' });
                setEditingReviewId(null);
            } else {
                await axios.post(`http://localhost:5000/api/v1/apps/${id}/reviews`, {
                    rating: Number(reviewRating),
                    content: reviewText,
                    answers: formattedAnswers
                });
                setMessage({ type: 'success', text: 'Review submitted! It is pending admin approval.' });
            }

            // Reload page to fetch updated state
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to submit review' });
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete your review?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/v1/reviews/${reviewId}`);
            setMessage({ type: 'success', text: 'Review deleted successfully.' });
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to delete review' });
        }
    };

    const handleEditStart = (review) => {
        setEditingReviewId(review.id);
        setReviewRating(review.rating);
        setReviewText(review.content);
        const mappedAnswers = {};
        if (review.questionAnswers) {
            review.questionAnswers.forEach(qa => {
                mappedAnswers[qa.questionId] = qa.answerRating;
            });
        }
        setQuestionAnswers(mappedAnswers);
    };

    const handleEditCancel = () => {
        setEditingReviewId(null);
        setReviewRating(5);
        setReviewText('');
        setQuestionAnswers({});
    };

    const existingUserReview = user && app?.reviews?.find(r => r.userId === user.id);

    const handleForumSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            const res = await axios.post(`http://localhost:5000/api/v1/apps/${id}/forums`, {
                title: forumTitle,
                content: forumContent
            });
            setMessage({ type: 'success', text: 'Forum question posted successfully!' });
            setForums([res.data, ...forums]);
            setForumTitle('');
            setForumContent('');
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to post to forum' });
        }
    };

    if (loading) return <div className="container flex-center" style={{ minHeight: '80vh' }}>Loading...</div>;
    if (!app) return <div className="container flex-center" style={{ minHeight: '80vh' }}>App not found or not approved yet.</div>;

    return (
        <div className="container" style={{ padding: '2rem 1.5rem' }} ref={containerRef}>
            <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '2rem' }}>
                &larr; Back
            </button>

            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {app.logoUrl && (
                            <img src={app.logoUrl} alt={`${app.title} logo`} style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover' }} />
                        )}
                        <div>
                            <h1 style={{ fontSize: '2.5rem' }} className="text-gradient">{app.title}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', background: 'var(--warning)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 700, fontSize: '1.1rem' }}>
                                    <svg style={{ width: '18px', height: '18px', marginRight: '4px' }} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    {app.computedRating > 0 ? parseFloat(app.computedRating).toFixed(1) : 'New'} / 5.0
                                </span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    ({app.reviews?.length || 0} reviews)
                                </span>
                                <span style={{ color: 'var(--border-color)', margin: '0 0.5rem' }}>•</span>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                    Added by {app.submitter?.firstName} {app.submitter?.lastName}
                                </span>
                            </div>
                        </div>
                    </div>
                    <span style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', fontWeight: 600 }}>
                        {app.category?.name || 'General App'}
                    </span>
                </div>

                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
                    {app.description}
                </p>

                <div className="grid-cols-2" style={{ gap: '2rem', marginBottom: '3rem' }}>
                    {app.playstoreLink && (
                        <a href={app.playstoreLink} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width: '100%' }}>
                            Get on Play Store
                        </a>
                    )}
                    {app.appstoreLink && (
                        <a href={app.appstoreLink} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ width: '100%' }}>
                            Get on App Store
                        </a>
                    )}
                </div>

                {app.tutorials && app.tutorials.length > 0 && (
                    <div style={{ marginBottom: '3rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Tutorial Videos</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {app.tutorials.map((tutorial) => (
                                <div key={tutorial.id}>
                                    <h4 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{tutorial.title}</h4>
                                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px' }}>
                                        <iframe
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                            src={tutorial.videoUrl.replace('watch?v=', 'embed/')}
                                            title={tutorial.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen>
                                        </iframe>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Interactive Section: Reviews & Forums */}
            <div className="glass-panel" style={{ padding: '0' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
                    <button
                        style={{ flex: 1, padding: '1.5rem', background: activeTab === 'reviews' ? 'rgba(59, 130, 246, 0.05)' : 'transparent', border: 'none', borderBottom: activeTab === 'reviews' ? '2px solid var(--accent-blue)' : '2px solid transparent', fontSize: '1.2rem', fontWeight: 600, color: activeTab === 'reviews' ? 'var(--accent-blue)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}
                        onClick={() => { setActiveTab('reviews'); setMessage({ type: '', text: '' }); }}
                    >
                        Community Reviews ({app.reviews?.length || 0})
                    </button>
                    <button
                        style={{ flex: 1, padding: '1.5rem', background: activeTab === 'forum' ? 'rgba(139, 92, 246, 0.05)' : 'transparent', border: 'none', borderBottom: activeTab === 'forum' ? '2px solid var(--accent-purple)' : '2px solid transparent', fontSize: '1.2rem', fontWeight: 600, color: activeTab === 'forum' ? 'var(--accent-purple)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}
                        onClick={() => { setActiveTab('forum'); setMessage({ type: '', text: '' }); }}
                    >
                        Q&A Forum ({forums.length})
                    </button>
                </div>

                <div style={{ padding: '2rem 3rem' }}>
                    {message.text && (
                        <div style={{ padding: '1rem', background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.type === 'success' ? 'var(--success)' : 'var(--danger)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            {message.text}
                        </div>
                    )}

                    {/* REVIEWS TAB */}
                    {activeTab === 'reviews' && (
                        <div>
                            {/* Add Review Form (Only standard Users) */}
                            {user && user.role === 'USER' ? (
                                existingUserReview && !editingReviewId ? (
                                    <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--accent-blue)', background: 'rgba(59, 130, 246, 0.02)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                                            <h4 style={{ fontSize: '1.2rem', margin: 0 }}>Your Review</h4>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => handleEditStart(existingUserReview)}>Edit</button>
                                                <button className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', background: 'var(--danger)', color: 'white' }} onClick={() => handleDeleteReview(existingUserReview.id)}>Delete</button>
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 600, color: 'var(--warning)', fontSize: '1.1rem' }}>★ {existingUserReview.rating} / 5</span>
                                                {existingUserReview.approvalStatus === 'PENDING' && <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', fontSize: '0.75rem', fontWeight: 600 }}>PENDING APPROVAL</span>}
                                                {existingUserReview.approvalStatus === 'REJECTED' && <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 600 }}>REJECTED</span>}
                                                {existingUserReview.approvalStatus === 'APPROVED' && <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600 }}>APPROVED</span>}
                                            </div>
                                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{existingUserReview.content}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleReviewSubmit} className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                                        <h4 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                                            {editingReviewId ? 'Edit Your Review' : 'Leave a Review'}
                                        </h4>

                                        <div style={{ display: 'grid', gridTemplateColumns: app.category?.questions?.length > 0 ? '1fr 1fr' : '1fr', gap: '3rem', marginBottom: '1.5rem' }}>
                                            {/* Left Column: General Rating and Experience */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                <div className="form-group" style={{ marginBottom: 0 }}>
                                                    <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Overall Rating (1-5)</label>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <svg
                                                                key={star}
                                                                onClick={() => setReviewRating(star)}
                                                                onMouseEnter={() => setHoverRating(star)}
                                                                onMouseLeave={() => setHoverRating(0)}
                                                                style={{
                                                                    width: '32px', height: '32px', cursor: 'pointer',
                                                                    color: (hoverRating || reviewRating) >= star ? 'var(--warning)' : 'var(--border-color)',
                                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                                                }}
                                                                fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
                                                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.8)'}
                                                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                            >
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        ))}
                                                        <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.1rem' }}>
                                                            {hoverRating || reviewRating} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 5</span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="form-group" style={{ marginBottom: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <label className="form-label">Written Experience</label>
                                                    <textarea className="form-control" rows="5" required placeholder="Tell us how easy this app was to navigate... Did the text size feel right? Were the buttons accessible?" value={reviewText} onChange={e => setReviewText(e.target.value)} style={{ flexGrow: 1, resize: 'vertical', minHeight: '130px', background: 'var(--bg-secondary)' }}></textarea>
                                                </div>
                                            </div>

                                            {/* Right Column: Category Questions */}
                                            {app.category?.questions?.length > 0 && (
                                                <div style={{ padding: '0' }}>
                                                    <h5 style={{ marginBottom: '0.3rem', fontSize: '1.05rem', color: 'var(--text-primary)' }}>Heuristic Usability Evaluation</h5>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Rate the following heuristics for the <strong>{app.category?.name}</strong> category.</p>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                        {app.category.questions.map(q => (
                                                            <div key={q.id}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                                                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.3, paddingRight: '1rem' }}>{q.question}</span>
                                                                    <span style={{ fontWeight: 700, color: '#fff', background: 'var(--accent-blue)', padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem', minWidth: '32px', textAlign: 'center' }}>
                                                                        {questionAnswers[q.id] !== undefined ? questionAnswers[q.id] : '-'}
                                                                    </span>
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-tertiary)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>0</span>
                                                                    <input
                                                                        type="range"
                                                                        min="0"
                                                                        max="10"
                                                                        step="1"
                                                                        className="custom-slider"
                                                                        value={questionAnswers[q.id] !== undefined ? questionAnswers[q.id] : 5}
                                                                        onChange={e => setQuestionAnswers({ ...questionAnswers, [q.id]: e.target.value })}
                                                                    />
                                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>10</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Reviews are manually approved by moderators.</span>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                {editingReviewId && (
                                                    <button type="button" className="btn btn-outline" style={{ padding: '0.75rem 2rem' }} onClick={handleEditCancel}>Cancel</button>
                                                )}
                                                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                                                    {editingReviewId ? 'Update Review' : 'Submit Review'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )
                            ) : !user && (
                                <div style={{ padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Please log in to leave a review.</p>
                                    <Link to="/login" className="btn btn-outline">Log In</Link>
                                </div>
                            )}

                            {/* Review List */}
                            {app.reviews?.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No reviews yet. Be the first to review this application!</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {app.reviews?.map(review => (
                                        <div key={review.id} className="glass-card" style={{ padding: '1.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <strong>{review.user?.firstName} {review.user?.lastName}</strong>
                                                <span style={{ color: 'var(--warning)', fontWeight: 600 }}>★ {review.rating}/5</span>
                                            </div>
                                            <p style={{ color: 'var(--text-secondary)' }}>{review.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* FORUM TAB */}
                    {activeTab === 'forum' && (
                        <div>
                            {/* Add Forum Post (Only standard Users) */}
                            {user && user.role === 'USER' ? (
                                <form onSubmit={handleForumSubmit} className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--accent-purple)' }}>
                                    <h4 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Ask a Question</h4>
                                    <div className="form-group">
                                        <label className="form-label">Question Title</label>
                                        <input type="text" className="form-control" required placeholder="e.g. How do I change the font size?" value={forumTitle} onChange={e => setForumTitle(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Details</label>
                                        <textarea className="form-control" rows="3" required placeholder="Explain what you are struggling with..." value={forumContent} onChange={e => setForumContent(e.target.value)}></textarea>
                                    </div>
                                    <button type="submit" className="btn " style={{ background: 'var(--accent-purple)', color: 'white' }}>Post Question</button>
                                </form>
                            ) : !user && (
                                <div style={{ padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Please log in to ask a question.</p>
                                    <Link to="/login" className="btn btn-outline">Log In</Link>
                                </div>
                            )}

                            {/* Forum Post List */}
                            {forums.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No questions asked yet in this community.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {forums.map(post => (
                                        <div key={post.id} className="glass-card" style={{ padding: '1.5rem', borderLeft: '3px solid var(--border-color)' }}>
                                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{post.title}</h3>
                                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{post.content}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Asked by {post.author?.firstName} {post.author?.lastName}</span>
                                                <span style={{ background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Answers: {post.answers?.length || 0}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppDetails;
