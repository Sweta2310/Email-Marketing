import React from 'react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { useDroppable, DndContext } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Copy, MoveVertical } from 'lucide-react';
import { stripHtmlTags, convertBrToNewlines } from '../../utils/htmlNormalizer';

const Column = ({ col, blocks, selectedBlockId, onSelect, onDelete, onDuplicate }) => {
    const { setNodeRef } = useDroppable({
        id: col.id,
    });

    return (
        <div
            ref={setNodeRef}
            className="editor-column"
            style={{ flex: 1 }}
        >
            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                <div className="column-blocks-container" style={{ minHeight: '50px' }}>
                    {blocks.map((b) => (
                        <BlockRenderer
                            key={b.id}
                            block={b}
                            isSelected={selectedBlockId === b.id}
                            selectedBlockId={selectedBlockId}
                            onSelect={onSelect}
                            onDelete={onDelete}
                            onDuplicate={onDuplicate}
                        />
                    ))}
                    {blocks.length === 0 && (
                        <div className="column-placeholder">
                            Drop here
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
};

function BlockRenderer({ block, isSelected, selectedBlockId, onSelect, onDelete, onDuplicate }) {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const formatCSSValue = (value) => {
        if (value === undefined || value === null || value === '') return undefined;
        // If it's a string and already has a unit or space-separated values, return as is
        if (typeof value === 'string' && (
            value.includes('px') ||
            value.includes('%') ||
            value.includes('rem') ||
            value.includes('em') ||
            value.includes(' ') ||
            isNaN(value)
        )) {
            return value;
        }
        // Otherwise, append px
        return `${value}px`;
    };

    const getPaddingStyle = (settings) => {
        if (settings.useAdvancedPadding) {
            return {
                paddingTop: formatCSSValue(settings.paddingTop),
                paddingRight: formatCSSValue(settings.paddingRight),
                paddingBottom: formatCSSValue(settings.paddingBottom),
                paddingLeft: formatCSSValue(settings.paddingLeft),
            };
        }
        const p = formatCSSValue(settings.padding);
        return p ? { padding: p } : {};
    };

    const getMarginStyle = (settings) => {
        if (settings.useAdvancedMargin) {
            return {
                marginTop: formatCSSValue(settings.marginTop),
                marginRight: formatCSSValue(settings.marginRight),
                marginBottom: formatCSSValue(settings.marginBottom),
                marginLeft: formatCSSValue(settings.marginLeft),
            };
        }
        const m = formatCSSValue(settings.margin);
        return m ? { margin: m } : {};
    };

    const getSocialIcon = (name) => {
        const iconSVGs = {
            'facebook': (
                <svg viewBox="0 0 24 24" fill="white" width="16" height="16">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            ),
            'instagram': (
                <svg viewBox="0 0 24 24" fill="white" width="16" height="16">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
            ),
            'linkedin': (
                <svg viewBox="0 0 24 24" fill="white" width="16" height="16">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            ),
            'youtube': (
                <svg viewBox="0 0 24 24" fill="white" width="16" height="16">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
            ),
            'twitter': (
                <svg viewBox="0 0 24 24" fill="white" width="16" height="16">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            )
        };

        return iconSVGs[name] || name[0].toUpperCase();
    };

    const getSocialIconColor = (name) => {
        const colors = {
            'facebook': '#1877F2',
            'twitter': '#000000',
            'instagram': '#E4405F',
            'youtube': '#FF0000',
            'linkedin': '#0A66C2'
        };
        return colors[name] || '#444';
    };

    const renderContent = () => {
        const { type, settings } = block;
        switch (type) {
            case 'columns':
                return (
                    <div className="responsive-columns" style={{
                        display: 'flex',
                        gap: '20px',
                        ...getPaddingStyle(settings),
                        ...getMarginStyle(settings),
                        alignItems: 'stretch'
                    }}>
                        {settings.columns.map((col, idx) => (
                            <Column
                                key={col.id}
                                col={col}
                                blocks={col.blocks}
                                selectedBlockId={selectedBlockId}
                                onSelect={onSelect}
                                onDelete={onDelete}
                                onDuplicate={onDuplicate}
                            />
                        ))}
                    </div>
                );
            case 'title':
                // Clean HTML tags and convert <br> to newlines for title
                const cleanedTitleContent = (() => {
                    const content = settings.content || '';
                    const withNewlines = convertBrToNewlines(content);
                    return stripHtmlTags(withNewlines);
                })();

                return (
                    <div style={{ position: 'relative', textAlign: settings.alignment || 'center' }}>
                        <h1
                            style={{
                                display: 'inline-block',
                                width: settings.width || '100%',
                                maxWidth: '100%',
                                fontSize: settings.fontSize,
                                fontWeight: settings.fontWeight,
                                color: settings.color,
                                backgroundColor: settings.backgroundColor,
                                textAlign: settings.textAlign || 'inherit',
                                ...getPaddingStyle(settings),
                                ...getMarginStyle(settings),
                                whiteSpace: 'pre-wrap' // Preserve newlines
                            }}
                        >
                            {cleanedTitleContent}
                        </h1>
                        {isSelected && (
                            <div className="image-inline-toolbar">
                                <button className="toolbar-btn" title="Move" {...listeners} {...attributes}>
                                    <MoveVertical size={18} />
                                </button>
                                <div className="toolbar-divider"></div>
                                <button className="toolbar-btn" title="Duplicate" onClick={(e) => { e.stopPropagation(); onDuplicate(block.id); }}>
                                    <Copy size={18} />
                                </button>
                                <div className="toolbar-divider"></div>
                                <button className="toolbar-btn toolbar-btn-ai" title="Use AI">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                        <path d="M2 17l10 5 10-5" />
                                        <path d="M2 12l10 5 10-5" />
                                    </svg>
                                    <span style={{ marginLeft: '6px', fontSize: '14px', fontWeight: '600' }}>Use AI</span>
                                </button>
                                <div className="toolbar-divider"></div>
                                <button className="toolbar-btn toolbar-btn-delete" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'text':
                // Clean HTML tags and convert <br> to newlines
                const cleanedContent = (() => {
                    const content = settings.content || '';
                    const withNewlines = convertBrToNewlines(content);
                    return stripHtmlTags(withNewlines);
                })();

                return (
                    <div style={{ position: 'relative', textAlign: settings.alignment || 'left' }}>
                        <p
                            style={{
                                display: 'inline-block',
                                width: settings.width || '100%',
                                maxWidth: '100%',
                                fontSize: settings.fontSize,
                                color: settings.color,
                                backgroundColor: settings.backgroundColor,
                                textAlign: settings.textAlign || 'inherit',
                                ...getPaddingStyle(settings),
                                ...getMarginStyle(settings),
                                lineHeight: settings.lineHeight,
                                whiteSpace: 'pre-wrap' // Preserve newlines
                            }}
                        >
                            {cleanedContent}
                        </p>
                        {isSelected && (
                            <div className="image-inline-toolbar">
                                <button className="toolbar-btn" title="Move" {...listeners} {...attributes}>
                                    <MoveVertical size={18} />
                                </button>
                                <div className="toolbar-divider"></div>
                                <button className="toolbar-btn" title="Duplicate" onClick={(e) => { e.stopPropagation(); onDuplicate(block.id); }}>
                                    <Copy size={18} />
                                </button>
                                <div className="toolbar-divider"></div>
                                <button className="toolbar-btn toolbar-btn-ai" title="Use AI">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                        <path d="M2 17l10 5 10-5" />
                                        <path d="M2 12l10 5 10-5" />
                                    </svg>
                                    <span style={{ marginLeft: '6px', fontSize: '14px', fontWeight: '600' }}>Use AI</span>
                                </button>
                                <div className="toolbar-divider"></div>
                                <button className="toolbar-btn toolbar-btn-delete" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'image':
                return (
                    <div style={{ ...getPaddingStyle(settings), ...getMarginStyle(settings), textAlign: settings.alignment || 'center', position: 'relative' }}>
                        <img
                            src={settings.url}
                            alt={settings.alt}
                            style={{
                                width: settings.width || 'auto',
                                borderRadius: (settings.borderRadius || 0) + 'px',
                                maxWidth: '100%'
                            }}
                        />
                        {isSelected && (
                            <div className="image-inline-toolbar">
                                <button className="toolbar-btn" title="Move" {...listeners} {...attributes}>
                                    <MoveVertical size={18} />
                                </button>
                                <div className="toolbar-divider"></div>
                                <button className="toolbar-btn" title="Duplicate" onClick={(e) => { e.stopPropagation(); onDuplicate(block.id); }}>
                                    <Copy size={18} />
                                </button>
                                <div className="toolbar-divider"></div>
                                <button className="toolbar-btn toolbar-btn-ai" title="Use AI">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                        <path d="M2 17l10 5 10-5" />
                                        <path d="M2 12l10 5 10-5" />
                                    </svg>
                                    <span style={{ marginLeft: '6px', fontSize: '14px', fontWeight: '600' }}>Use AI</span>
                                </button>
                                <div className="toolbar-divider"></div>
                                <button className="toolbar-btn toolbar-btn-delete" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'button':
                return (
                    <div style={{ position: 'relative' }}>
                        <div style={{ textAlign: settings.alignment || 'center', ...getPaddingStyle(settings), ...getMarginStyle(settings) }}>
                            <a
                                href={settings.url}
                                className="canvas-btn"
                                style={{
                                    backgroundColor: settings.backgroundColor,
                                    color: settings.color,
                                    borderRadius: (settings.borderRadius || 0) + 'px',
                                    padding: '8px 16px', // Standard button inner padding
                                    fontSize: settings.fontSize,
                                    display: settings.display,
                                    textDecoration: 'none'
                                }}
                            >
                                {settings.content}
                            </a>
                        </div>
                        {isSelected && (
                            <div className="image-inline-toolbar">
                                <button className="toolbar-btn" title="Move" {...listeners} {...attributes}>
                                    <MoveVertical size={18} />
                                </button>
                                <div className="toolbar-divider"></div>
                                <button className="toolbar-btn" title="Duplicate" onClick={(e) => { e.stopPropagation(); onDuplicate(block.id); }}>
                                    <Copy size={18} />
                                </button>
                                <div className="toolbar-divider"></div>
                                <button className="toolbar-btn toolbar-btn-ai" title="Use AI">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                        <path d="M2 17l10 5 10-5" />
                                        <path d="M2 12l10 5 10-5" />
                                    </svg>
                                    <span style={{ marginLeft: '6px', fontSize: '14px', fontWeight: '600' }}>Use AI</span>
                                </button>
                                <div className="toolbar-divider"></div>
                                <button className="toolbar-btn toolbar-btn-delete" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'divider':
                return (
                    <div style={{ ...getPaddingStyle(settings), ...getMarginStyle(settings), textAlign: settings.alignment || 'center' }}>
                        <hr style={{
                            border: 'none',
                            borderTop: `${settings.height} solid ${settings.color}`,
                            width: settings.width || '100%',
                            margin: (settings.alignment === 'left' ? '0' : settings.alignment === 'right' ? '0 0 0 auto' : '0 auto')
                        }} />
                    </div>
                );
            case 'spacer':
                return <div style={{ height: settings.height }} />;
            case 'video':
                return (
                    <div style={{ ...getPaddingStyle(settings), ...getMarginStyle(settings), textAlign: settings.alignment || 'center' }}>
                        <div className="video-placeholder" style={{
                            width: settings.width || '100%',
                            maxWidth: '100%',
                            position: 'relative',
                            display: 'inline-block'
                        }}>
                            {isPlaying ? (
                                (() => {
                                    // Check if YouTube
                                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                    const match = settings.url?.match(regExp);
                                    const videoId = (match && match[2].length === 11) ? match[2] : null;

                                    if (videoId) {
                                        return (
                                            <iframe
                                                width="100%"
                                                height="315"
                                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                style={{ borderRadius: settings.borderRadius ? `${settings.borderRadius}px` : '0px', width: '100%', aspectRatio: '16/9' }}
                                            ></iframe>
                                        );
                                    } else {
                                        // Assume direct video file
                                        return (
                                            <video
                                                width="100%"
                                                controls
                                                autoPlay
                                                style={{
                                                    borderRadius: settings.borderRadius ? `${settings.borderRadius}px` : '0px',
                                                    border: (settings.borderWidth && parseInt(settings.borderWidth) > 0) ? `${settings.borderWidth}px solid ${settings.borderColor}` : 'none',
                                                    display: 'block'
                                                }}
                                            >
                                                <source src={settings.url} />
                                                Your browser does not support the video tag.
                                            </video>
                                        );
                                    }
                                })()
                            ) : (
                                <div onClick={() => setIsPlaying(true)} style={{ cursor: 'pointer' }}>
                                    <img
                                        src={settings.thumbnail}
                                        alt={settings.alt || "Video"}
                                        style={{
                                            width: '100%',
                                            borderRadius: settings.borderRadius ? `${settings.borderRadius}px` : '0px',
                                            border: (settings.borderWidth && parseInt(settings.borderWidth) > 0) ? `${settings.borderWidth}px solid ${settings.borderColor}` : 'none',
                                            display: 'block'
                                        }}
                                    />
                                    <div className="play-button-overlay">
                                        <span style={{
                                            background: 'rgba(0,0,0,0.6)',
                                            color: 'white',
                                            padding: '10px 20px',
                                            borderRadius: '30px'
                                        }}>Play Video</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'social':
                return (
                    <div style={{ textAlign: settings.align, ...getPaddingStyle(settings), ...getMarginStyle(settings) }}>
                        {settings.networks.map((net, i) => (
                            <a
                                key={i}
                                href={net.url}
                                style={{
                                    display: 'inline-block',
                                    margin: `0 ${settings.iconSpacing || '5px'}`,
                                    textDecoration: 'none'
                                }}
                            >
                                <div style={{
                                    width: settings.iconSize || '32px',
                                    height: settings.iconSize || '32px',
                                    backgroundColor: settings.iconTheme === 'monochrome' ? '#64748b' : getSocialIconColor(net.name),
                                    borderRadius: settings.iconStyle === 'square' ? '8px' : '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '12px',
                                    textTransform: 'capitalize'
                                }}>
                                    {getSocialIcon(net.name)}
                                </div>
                            </a>
                        ))}
                    </div>
                );
            case 'logo':
                return (
                    <div style={{ ...getPaddingStyle(settings), ...getMarginStyle(settings), textAlign: settings.alignment || 'center' }}>
                        <img src={settings.url} alt="Logo" style={{ width: settings.width || 'auto', maxWidth: '100%' }} />
                    </div>
                );
            case 'html':
                return (
                    <div style={{ ...getPaddingStyle(settings), ...getMarginStyle(settings), color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>
                        HTML Block: {settings.content.substring(0, 100)}{settings.content.length > 100 ? '...' : ''}
                    </div>
                );
            case 'product':
                return (
                    <div className="product-block-renderer" style={{ ...getPaddingStyle(settings), ...getMarginStyle(settings), textAlign: settings.alignment || 'center' }}>
                        <img src={settings.image} alt={settings.title} style={{ width: '100%', maxWidth: '200px', borderRadius: '8px' }} />
                        <h3 style={{ margin: '10px 0 5px', fontSize: '18px' }}>{settings.title}</h3>
                        <p style={{ margin: '0 0 10px', fontWeight: 'bold', color: '#111' }}>{settings.price}</p>
                        <a href={settings.url} className="product-btn" style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            backgroundColor: '#000',
                            color: '#fff',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}>
                            {settings.buttonText}
                        </a>
                    </div>
                );
            case 'navigation':
                return (
                    <div style={{ ...getPaddingStyle(settings), ...getMarginStyle(settings), textAlign: settings.alignment || 'center' }}>
                        {settings.links.map((link, i) => (
                            <a key={i} href={link.url} style={{
                                margin: '0 10px',
                                color: settings.color,
                                fontSize: settings.fontSize,
                                textDecoration: 'none'
                            }}>
                                {link.label}
                            </a>
                        ))}
                    </div>
                );
                return null;
            case 'payment':
                return (
                    <div style={{ ...getPaddingStyle(settings), ...getMarginStyle(settings), textAlign: settings.alignment || 'center' }}>
                        <a href={settings.url} style={{
                            display: 'inline-block',
                            padding: '12px 24px', // Standard button padding
                            backgroundColor: settings.backgroundColor,
                            color: settings.color,
                            borderRadius: (settings.borderRadius || 0) + 'px',
                            fontSize: settings.fontSize,
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}>
                            {settings.label}
                        </a>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`canvas-block ${isSelected ? 'selected' : ''}`}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(block.id);
            }}
        >
            <div className="block-content-wrapper">
                {renderContent()}
            </div>
        </div>
    );
};

export default BlockRenderer;
