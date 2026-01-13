import React, { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { templateAPI } from '../../services/template.services';
import { Loader2 } from 'lucide-react';
import {
    Type as TextIcon, Image as ImageIcon, Video, Square,
    Link2, Share2, Code2, CreditCard, Minus, Package, Map,
    GripVertical, Box, Type
} from 'lucide-react';
import { EDITOR_SECTIONS } from '../data/sections';

const DraggableSectionItem = ({ section }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `section-${section.id}`,
        data: {
            section,
            isSectionItem: true,
        },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
        zIndex: 1000,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`v2-palette-item section-item ${isDragging ? 'dragging' : ''}`}
        >
            <div className="v2-item-handle">
                <GripVertical size={12} />
            </div>
            <div className="section-preview">
                {section.thumbnail ? (
                    <img src={section.thumbnail} alt={section.name} />
                ) : (
                    <Box size={32} color="#cbd5e1" />
                )}
            </div>
            <div className="section-info">
                <span className="section-name">{section.name}</span>
                <span className="section-desc">{section.description}</span>
            </div>
        </div>
    );
};

const PALETTE_ITEMS = [
    { type: 'title', label: 'Title', icon: <Type size={24} strokeWidth={1.5} /> },
    { type: 'text', label: 'Text', icon: <TextIcon size={24} strokeWidth={1.5} /> },
    { type: 'image', label: 'Image', icon: <ImageIcon size={24} strokeWidth={1.5} /> },
    { type: 'video', label: 'Video', icon: <Video size={24} strokeWidth={1.5} /> },
    { type: 'button', label: 'Button', icon: <Square size={24} strokeWidth={1.5} /> },
    { type: 'logo', label: 'Logo', icon: <Box size={24} strokeWidth={1.5} /> },
    { type: 'social', label: 'Social', icon: <Share2 size={24} strokeWidth={1.5} /> },
    { type: 'html', label: 'HTML', icon: <Code2 size={24} strokeWidth={1.5} /> },
    { type: 'payment', label: 'Payment link', icon: <CreditCard size={24} strokeWidth={1.5} /> },
    { type: 'divider', label: 'Divider', icon: <Minus size={24} strokeWidth={1.5} /> },
    { type: 'product', label: 'Product', icon: <Package size={24} strokeWidth={1.5} /> },
    { type: 'navigation', label: 'Navigation', icon: <Map size={24} strokeWidth={1.5} /> },
    { type: 'spacer', label: 'Spacer', icon: <Box size={24} strokeWidth={1.5} /> },
    { type: 'columns', label: 'Layout', icon: <Box size={24} strokeWidth={1.5} /> },
];

const DraggableItem = ({ item }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `palette-${item.type}`,
        data: {
            type: item.type,
            isPaletteItem: true,
        },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`v2-palette-item ${isDragging ? 'dragging' : ''}`}
        >
            <div className="v2-item-handle">
                <GripVertical size={12} />
            </div>
            <div className="v2-item-icon">{item.icon}</div>
            <span className="v2-item-label">{item.label}</span>
        </div>
    );
};

const DraggableTemplateItem = ({ template }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `template-${template._id}`,
        data: {
            template,
            isTemplateItem: true,
        },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
        zIndex: 1000,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`v2-palette-item saved-tpl-item ${isDragging ? 'dragging' : ''}`}
        >
            <div className="v2-item-handle">
                <GripVertical size={12} />
            </div>
            <div className="v2-item-icon">
                <Box size={24} strokeWidth={1.5} />
            </div>
            <span className="v2-item-label">{template.name}</span>
        </div>
    );
};

const BlockPalette = () => {
    const [subTab, setSubTab] = useState('Blocks');
    const [savedTemplates, setSavedTemplates] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (subTab === 'Saved') {
            fetchSavedTemplates();
        }
    }, [subTab]);

    const fetchSavedTemplates = async () => {
        try {
            setLoading(true);
            const data = await templateAPI.getTemplates('saved');
            setSavedTemplates(data || []);
        } catch (error) {
            console.error('Error fetching saved templates:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="v2-block-palette">
            <div className="palette-tabs">
                <button
                    className={`palette-tab ${subTab === 'Blocks' ? 'active' : ''}`}
                    onClick={() => setSubTab('Blocks')}
                >
                    Blocks
                </button>
                <button
                    className={`palette-tab ${subTab === 'Sections' ? 'active' : ''}`}
                    onClick={() => setSubTab('Sections')}
                >
                    Sections
                </button>
                <button
                    className={`palette-tab ${subTab === 'Saved' ? 'active' : ''}`}
                    onClick={() => setSubTab('Saved')}
                >
                    Saved
                </button>
            </div>

            <div className="v2-palette-content">
                {subTab === 'Blocks' && (
                    <div className="v2-palette-grid">
                        {PALETTE_ITEMS.map((item) => (
                            <DraggableItem key={item.type} item={item} />
                        ))}
                    </div>
                )}

                {subTab === 'Saved' && (
                    <div className="saved-templates-list">
                        {loading ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="animate-spin text-indigo-600" size={24} />
                            </div>
                        ) : savedTemplates.length > 0 ? (
                            <div className="v2-palette-grid">
                                {savedTemplates.map((tpl) => (
                                    <DraggableTemplateItem key={tpl._id} template={tpl} />
                                ))}
                            </div>
                        ) : (
                            <div className="v2-empty-state">
                                <p>No saved templates yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {subTab === 'Sections' && (
                    <div className="sections-list">
                        {EDITOR_SECTIONS.map((section) => (
                            <DraggableSectionItem key={section.id} section={section} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlockPalette;

