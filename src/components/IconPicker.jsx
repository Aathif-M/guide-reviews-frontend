import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as TablerIcons from '@tabler/icons-react';

const allIconNames = Object.keys(TablerIcons).filter(
    (name) => name.startsWith('Icon') && name !== 'IconProvider' && name !== 'Icon'
);

const IconPicker = ({ value, onChange, categoryName }) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const suggestedIcons = useMemo(() => {
        if (!categoryName) return [];
        const words = categoryName.toLowerCase().split(/[\s\-&_]+/).filter(w => w.length > 2);
        if (words.length === 0) return [];

        return allIconNames
            .filter((iconName) => {
                const lowerIcon = iconName.toLowerCase();
                return words.some((w) => lowerIcon.includes(w));
            })
            .slice(0, 12); // Limit suggestions
    }, [categoryName]);

    const filteredIcons = useMemo(() => {
        if (!search) return allIconNames.slice(0, 48); // Initial render
        const lowerSearch = search.toLowerCase();
        return allIconNames
            .filter((name) => name.toLowerCase().includes(lowerSearch))
            .slice(0, 48); // Limit to avoid performance issues rendering 4000 icons
    }, [search]);

    const SelectedIcon = value && TablerIcons[value] ? TablerIcons[value] : null;

    return (
        <div className="icon-picker" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            <div
                className="form-control"
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', justifyContent: 'space-between', padding: '0.6rem 1rem' }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {SelectedIcon ? <SelectedIcon size={20} style={{ color: 'var(--accent-blue)' }} /> : <span style={{ color: 'var(--text-muted)' }}>None</span>}
                    <span>{value ? value.replace('Icon', '') : 'Select an Icon'}</span>
                </div>
                <TablerIcons.IconChevronDown size={18} style={{ color: 'var(--text-muted)' }} />
            </div>

            {isOpen && (
                <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.5rem',
                    zIndex: 1000,
                    padding: '1rem',
                    maxHeight: '400px',
                    overflowY: 'auto'
                }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search icons..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ marginBottom: '1rem' }}
                        onClick={(e) => e.stopPropagation()}
                    />

                    {suggestedIcons.length > 0 && !search && (
                        <div style={{ marginBottom: '1rem' }}>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Suggested based on name</strong>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '0.5rem' }}>
                                {suggestedIcons.map((iconName) => {
                                    const Icon = TablerIcons[iconName];
                                    const isSelected = value === iconName;
                                    return (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => { onChange(iconName); setIsOpen(false); }}
                                            style={{
                                                padding: '0.5rem',
                                                background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                                border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                            title={iconName}
                                            className="icon-btn"
                                        >
                                            <Icon size={20} style={{ color: isSelected ? 'var(--accent-blue)' : 'var(--text-primary)' }} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>{search ? 'Search Results' : 'All Available'}</strong>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '0.5rem' }}>
                            {filteredIcons.map((iconName) => {
                                const Icon = TablerIcons[iconName];
                                const isSelected = value === iconName;
                                return (
                                    <button
                                        key={'all-' + iconName}
                                        type="button"
                                        onClick={() => { onChange(iconName); setIsOpen(false); }}
                                        style={{
                                            padding: '0.5rem',
                                            background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                            border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        title={iconName}
                                        className="icon-btn-all"
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = isSelected ? 'var(--accent-blue)' : 'var(--border-color)'; }}
                                    >
                                        <Icon size={20} style={{ color: isSelected ? 'var(--accent-blue)' : 'var(--text-primary)' }} />
                                    </button>
                                );
                            })}
                        </div>
                        {allIconNames.length > 48 && !search && (
                            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>Search to find more icons...</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default IconPicker;
