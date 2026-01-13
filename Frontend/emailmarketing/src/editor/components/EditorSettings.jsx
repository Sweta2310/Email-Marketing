import React from 'react';
import { X, Settings, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Trash2, GripVertical, Plus, Minus, ChevronDown, ChevronUp, Share2, Facebook, Instagram, Twitter, Youtube, ChevronLeft, Wand2, Image as ImageIcon, Sparkles, MoreHorizontal, MousePointer2, Code2, ListFilter, Layout, MoveHorizontal, HelpCircle, Grid } from 'lucide-react';
import { nanoid } from 'nanoid';

const EditorSettings = ({ block, updateBlock, onClose, openLibrary }) => {
    const getDefaultSection = () => {
        if (block?.type === 'image') return 'image-main';
        if (block?.type === 'text' || block?.type === 'title') return 'text-settings';
        return 'links';
    };
    const [expandedSection, setExpandedSection] = React.useState(getDefaultSection());

    if (!block) return null;

    const handleChange = (key, value) => {
        updateBlock(block.id, { [key]: value });
    };

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const addSocialLink = () => {
        const networks = ['facebook', 'twitter', 'instagram', 'youtube', 'linkedin'];
        const existingNetworks = block.settings.networks.map(n => n.name);
        const nextNetwork = networks.find(n => !existingNetworks.includes(n)) || 'link';

        const newNetworks = [...block.settings.networks, { name: nextNetwork, url: '' }];
        handleChange('networks', newNetworks);
    };

    const removeSocialLink = (index) => {
        const newNetworks = block.settings.networks.filter((_, i) => i !== index);
        handleChange('networks', newNetworks);
    };

    const updateSocialLink = (index, url) => {
        const newNetworks = [...block.settings.networks];
        newNetworks[index] = { ...newNetworks[index], url };
        handleChange('networks', newNetworks);
    };

    const renderAccordionHeader = (id, label) => (
        <div className="accordion-header" onClick={(e) => {
            e.stopPropagation();
            toggleSection(id);
        }}>
            <span className="accordion-label">{label}</span>
            {expandedSection === id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
    );

    const renderField = (label, type, key, props = {}) => (
        <div className="settings-field-v2">
            <label>{label}</label>
            {type === 'text' && (
                <textarea
                    value={block.settings[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    {...props}
                />
            )}
            {type === 'input' && (
                <input
                    type="text"
                    value={block.settings[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    {...props}
                />
            )}
            {type === 'color' && (
                <div className="settings-row-inline" style={{ marginTop: 0, marginBottom: 0 }}>
                    <div className="color-swatch-v2" style={{ backgroundColor: block.settings[key] || '#ffffff' }}>
                        <input
                            type="color"
                            value={block.settings[key] || '#ffffff'}
                            onChange={(e) => handleChange(key, e.target.value)}
                        />
                    </div>
                </div>
            )}
            {type === 'select' && (
                <select
                    value={block.settings[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                >
                    {props.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            )}
        </div>
    );

    const renderAlignmentV2 = (key = 'alignment') => (
        <div className="settings-row-inline">
            <div className="label-with-help">
                <label>Block alignment</label>
                <HelpCircle size={14} className="help-icon" />
            </div>
            <div className="alignment-toggle-v2">
                {['left', 'center', 'right'].map((align) => (
                    <button
                        key={align}
                        className={(block.settings[key] || block.settings.align) === align ? 'active' : ''}
                        onClick={() => handleChange(key, align)}
                    >
                        {align === 'left' && <AlignLeft size={18} />}
                        {align === 'center' && <AlignCenter size={18} />}
                        {align === 'right' && <AlignRight size={18} />}
                    </button>
                ))}
            </div>
        </div>
    );

    const renderWidthV2 = () => (
        <div className="settings-row-inline">
            <label>Width</label>
            <div className="input-group-v2">
                <MoveHorizontal size={18} className="input-prefix-icon" />
                <div className="input-with-select">
                    <input
                        type="number"
                        value={parseInt(block.settings.width) || 100}
                        onChange={(e) => handleChange('width', block.settings.widthUnit === 'px' ? e.target.value : `${e.target.value}%`)}
                    />
                    <select
                        value={block.settings.widthUnit || (String(block.settings.width).includes('%') ? '%' : 'px')}
                        onChange={(e) => {
                            const unit = e.target.value;
                            const val = parseInt(block.settings.width) || 100;
                            handleChange('widthUnit', unit);
                            handleChange('width', unit === '%' ? `${val}%` : val);
                        }}
                    >
                        <option value="%">%</option>
                        <option value="px">px</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderBorderRadiusV2 = (key = 'borderRadius') => (
        <div className="settings-row-inline">
            <label>Rounded corners</label>
            <div className="stepper-group-v2">
                <Grid size={18} className="input-prefix-icon" />
                <div className="stepper-v2">
                    <button onClick={() => handleChange(key, Math.max(0, (parseInt(block.settings[key]) || 0) - 1))}>
                        <Minus size={14} />
                    </button>
                    <div className="stepper-value">
                        <span>{parseInt(block.settings[key]) || 0}</span>
                        <span className="unit">px</span>
                    </div>
                    <button onClick={() => handleChange(key, (parseInt(block.settings[key]) || 0) + 1)}>
                        <Plus size={14} />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderBackgroundV2 = () => (
        <div className="settings-section">
            {renderAccordionHeader('background-uni', 'Background')}
            {expandedSection === 'background-uni' && (
                <div className="accordion-content">
                    <div className="settings-row-inline">
                        <label>Background color</label>
                        <div className="color-swatch-v2" style={{ backgroundColor: block.settings.backgroundColor || '#ffffff' }}>
                            <input
                                type="color"
                                value={block.settings.backgroundColor || '#ffffff'}
                                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="settings-field-v2">
                        <label>Background image</label>
                        <button className="v2-outline-btn full-width" onClick={() => openLibrary((url) => handleChange('backgroundImage', url))}>
                            Add image
                        </button>
                    </div>

                    <div className="settings-field-v2">
                        <label>Insert image from URL</label>
                        <input
                            type="text"
                            placeholder="https://mydomain.com/myimage.png"
                            value={block.settings.backgroundImage || ''}
                            onChange={(e) => handleChange('backgroundImage', e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>
    );

    const renderSpacingV2 = () => (
        <div className="settings-section">
            {renderAccordionHeader('spacing-uni', 'Spacing')}
            {expandedSection === 'spacing-uni' && (
                <div className="accordion-content" style={{ padding: '0 20px 24px' }}>
                    <div className="settings-row-inline" style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <label style={{ fontSize: '16px', color: '#111', fontWeight: '500' }}>Padding</label>
                        <div className={`switch-v2 ${block.settings.useAdvancedPadding ? 'active' : ''}`} onClick={() => handleChange('useAdvancedPadding', !block.settings.useAdvancedPadding)}>
                            <div className="switch-handle-v2" />
                        </div>
                    </div>
                    {block.settings.useAdvancedPadding && (
                        <div className="spacing-grid-v2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '16px', padding: '0 4px' }}>
                            {['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].map((side) => (
                                <div key={side} className="mini-stepper-v2">
                                    <label style={{ fontSize: '12px', marginBottom: '6px', display: 'block', color: '#64748b', fontWeight: '500' }}>{side.replace('padding', '')}</label>
                                    <div className="stepper-v2 full-width">
                                        <button onClick={() => handleChange(side, Math.max(0, parseInt(block.settings[side]) - 1))}>
                                            <Minus size={14} />
                                        </button>
                                        <div className="stepper-value">
                                            <span>{parseInt(block.settings[side]) || 0}</span>
                                        </div>
                                        <button onClick={() => handleChange(side, (parseInt(block.settings[side]) || 0) + 1)}>
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {!block.settings.useAdvancedPadding && (
                        <div className="settings-field-v2" style={{ marginTop: '16px', padding: '0 4px' }}>
                            <div className="stepper-v2 full-width">
                                <button onClick={() => handleChange('padding', Math.max(0, parseInt(block.settings.padding) - 1))}>
                                    <Minus size={14} />
                                </button>
                                <div className="stepper-value">
                                    <span>{parseInt(block.settings.padding) || 0}</span>
                                    <span className="unit">px</span>
                                </div>
                                <button onClick={() => handleChange('padding', (parseInt(block.settings.padding) || 0) + 1)}>
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="settings-row-inline" style={{ padding: '12px 0', marginTop: '8px', borderBottom: '1px solid #f1f5f9' }}>
                        <label style={{ fontSize: '16px', color: '#111', fontWeight: '500' }}>Margin</label>
                        <div className={`switch-v2 ${block.settings.useAdvancedMargin ? 'active' : ''}`} onClick={() => handleChange('useAdvancedMargin', !block.settings.useAdvancedMargin)}>
                            <div className="switch-handle-v2" />
                        </div>
                    </div>
                    {block.settings.useAdvancedMargin && (
                        <div className="spacing-grid-v2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '16px', padding: '0 4px' }}>
                            {['marginTop', 'marginRight', 'marginBottom', 'marginLeft'].map((side) => (
                                <div key={side} className="mini-stepper-v2">
                                    <label style={{ fontSize: '12px', marginBottom: '6px', display: 'block', color: '#64748b', fontWeight: '500' }}>{side.replace('margin', '')}</label>
                                    <div className="stepper-v2 full-width">
                                        <button onClick={() => handleChange(side, Math.max(0, parseInt(block.settings[side]) - 1))}>
                                            <Minus size={14} />
                                        </button>
                                        <div className="stepper-value">
                                            <span>{parseInt(block.settings[side]) || 0}</span>
                                        </div>
                                        <button onClick={() => handleChange(side, (parseInt(block.settings[side]) || 0) + 1)}>
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {!block.settings.useAdvancedMargin && (
                        <div className="settings-field-v2" style={{ marginTop: '16px', padding: '0 4px' }}>
                            <div className="stepper-v2 full-width">
                                <button onClick={() => handleChange('margin', Math.max(0, parseInt(block.settings.margin) - 1))}>
                                    <Minus size={14} />
                                </button>
                                <div className="stepper-value">
                                    <span>{parseInt(block.settings.margin) || 0}</span>
                                    <span className="unit">px</span>
                                </div>
                                <button onClick={() => handleChange('margin', (parseInt(block.settings.margin) || 0) + 1)}>
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const getNetworkIcon = (name) => {
        const colors = {
            'facebook': '#1877F2',
            'twitter': '#000000',
            'instagram': '#E4405F',
            'youtube': '#FF0000',
            'linkedin': '#0A66C2',
            'link': '#64748b'
        };

        const iconSVGs = {
            'facebook': (
                <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            ),
            'instagram': (
                <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
            ),
            'linkedin': (
                <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            ),
            'youtube': (
                <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
            ),
            'twitter': (
                <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            )
        };

        return (
            <div className={`network-icon-circle ${name}`} style={{ backgroundColor: colors[name] || colors.link, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {iconSVGs[name] || 'L'}
            </div>
        );
    };

    const getBlockIcon = (type) => {
        const iconSize = 20;
        switch (type) {
            case 'text':
            case 'title': return <AlignLeft size={iconSize} />;
            case 'image': return <ImageIcon size={iconSize} />;
            case 'button': return <MousePointer2 size={iconSize} />;
            case 'social': return <Share2 size={iconSize} />;
            case 'divider': return <GripVertical size={iconSize} />;
            case 'spacer': return <MoreHorizontal size={iconSize} />;
            case 'logo': return <ImageIcon size={iconSize} />;
            case 'html': return <Code2 size={iconSize} />;
            case 'product': return <ImageIcon size={iconSize} />;
            case 'navigation': return <ListFilter size={iconSize} />;
            case 'payment': return <Code2 size={iconSize} />;
            case 'video': return <Youtube size={iconSize} />;
            case 'columns': return <Layout size={iconSize} />;
            default: return <Settings size={iconSize} />;
        }
    };

    return (
        <div className="editor-settings premium">
            <div className="settings-header">
                <div className="title-area">
                    <div className="block-type-icon">
                        {getBlockIcon(block.type)}
                    </div>
                    <h3 className="capitalize">{block.type}</h3>
                </div>
                <button className="close-btn" onClick={onClose} title="Close settings">
                    <X size={20} />
                </button>
            </div>

            <div className="settings-content">
                {block.type === 'social' ? (
                    <div className="social-editor-v2">
                        <div className="settings-section">
                            {renderAccordionHeader('links', 'Social media links')}
                            {expandedSection === 'links' && (
                                <div className="accordion-content">
                                    <div className="links-list-v2">
                                        {block.settings.networks.map((net, index) => (
                                            <div key={index} className="link-item-v2">
                                                <div className="drag-handle-v2">
                                                    <GripVertical size={16} />
                                                </div>
                                                <div className="net-icon">
                                                    {getNetworkIcon(net.name)}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={net.url}
                                                    onChange={(e) => updateSocialLink(index, e.target.value)}
                                                    placeholder="https://mydomain.com"
                                                />
                                                <button className="delete-link-btn" onClick={() => removeSocialLink(index)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="add-more-btn" onClick={addSocialLink}>
                                        <Plus size={16} />
                                        <span>Add more</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Icon Design Section */}
                        <div className="settings-section">
                            {renderAccordionHeader('icon-design', 'Icon design')}
                            {expandedSection === 'icon-design' && (
                                <div className="accordion-content">
                                    <div className="settings-field-v2">
                                        <label>Size</label>
                                        <select
                                            value={block.settings.iconSizePreset || 'small'}
                                            onChange={(e) => {
                                                const sizes = { small: '32px', medium: '40px', large: '48px' };
                                                handleChange('iconSizePreset', e.target.value);
                                                handleChange('iconSize', sizes[e.target.value]);
                                            }}
                                        >
                                            <option value="small">Small</option>
                                            <option value="medium">Medium</option>
                                            <option value="large">Large</option>
                                        </select>
                                    </div>

                                    <div className="settings-field-v2">
                                        <label>Style</label>
                                        <select
                                            value={block.settings.iconStyle || 'rounded'}
                                            onChange={(e) => handleChange('iconStyle', e.target.value)}
                                        >
                                            <option value="rounded">Rounded</option>
                                            <option value="square">Square</option>
                                        </select>
                                    </div>

                                    <div className="settings-field-v2">
                                        <label>Theme</label>
                                        <select
                                            value={block.settings.iconTheme || 'colored'}
                                            onChange={(e) => handleChange('iconTheme', e.target.value)}
                                        >
                                            <option value="colored">Colored</option>
                                            <option value="monochrome">Monochrome</option>
                                        </select>
                                    </div>

                                    <div className="settings-field-v2">
                                        <label>Spacing</label>
                                        <div className="input-with-unit">
                                            <input
                                                type="number"
                                                value={parseInt(block.settings.iconSpacing) || 5}
                                                onChange={(e) => handleChange('iconSpacing', `${e.target.value}px`)}
                                                min="0"
                                            />
                                            <span className="unit-label">px</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* Layout Section */}
                        <div className="settings-section">
                            {renderAccordionHeader('layout', 'Layout')}
                            {expandedSection === 'layout' && (
                                <div className="accordion-content">
                                    <div className="settings-field-v2">
                                        <label>Alignment</label>
                                        <div className="align-options-v2">
                                            {['left', 'center', 'right'].map((align) => (
                                                <button
                                                    key={align}
                                                    className={`align-btn ${block.settings.align === align ? 'active' : ''}`}
                                                    onClick={() => handleChange('align', align)}
                                                >
                                                    {align === 'left' && <AlignLeft size={18} />}
                                                    {align === 'center' && <AlignCenter size={18} />}
                                                    {align === 'right' && <AlignRight size={18} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Spacing Section */}
                        <div className="settings-section">
                            {renderAccordionHeader('spacing', 'Spacing')}
                            {expandedSection === 'spacing' && (
                                <div className="accordion-content">
                                    <div className="settings-field-v2">
                                        <label>Padding</label>
                                        <div className="stepper-v2 full-width">
                                            <button onClick={() => handleChange('padding', Math.max(0, (parseInt(block.settings.padding) || 0) - 5))}>
                                                <Minus size={14} />
                                            </button>
                                            <div className="stepper-value">
                                                <span>{parseInt(block.settings.padding) || 0}</span>
                                                <span className="unit">px</span>
                                            </div>
                                            <button onClick={() => handleChange('padding', (parseInt(block.settings.padding) || 0) + 5)}>
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="settings-field-v2" style={{ marginTop: '16px' }}>
                                        <label>Margin</label>
                                        <div className="stepper-v2 full-width">
                                            <button onClick={() => handleChange('margin', Math.max(0, (parseInt(block.settings.margin) || 0) - 5))}>
                                                <Minus size={14} />
                                            </button>
                                            <div className="stepper-value">
                                                <span>{parseInt(block.settings.margin) || 0}</span>
                                                <span className="unit">px</span>
                                            </div>
                                            <button onClick={() => handleChange('margin', (parseInt(block.settings.margin) || 0) + 5)}>
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content Visibility Section */}
                        <div className="settings-section">
                            {renderAccordionHeader('visibility', 'Content visibility')}
                            {expandedSection === 'visibility' && (
                                <div className="accordion-content">
                                    <div className="settings-row-inline">
                                        <label>Hide on Desktop</label>
                                        <div className={`switch-v2 ${block.settings.hideDesktop ? 'active' : ''}`} onClick={() => handleChange('hideDesktop', !block.settings.hideDesktop)}>
                                            <div className="switch-handle-v2" />
                                        </div>
                                    </div>
                                    <div className="settings-row-inline" style={{ marginTop: '12px' }}>
                                        <label>Hide on Mobile</label>
                                        <div className={`switch-v2 ${block.settings.hideMobile ? 'active' : ''}`} onClick={() => handleChange('hideMobile', !block.settings.hideMobile)}>
                                            <div className="switch-handle-v2" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Text Settings Panel */}
                        {(block.type === 'text' || block.type === 'title') && (
                            <div className="text-settings-panel">
                                <div className="settings-section">
                                    <div className="accordion-header" onClick={() => toggleSection('text-settings')}>
                                        <span className="accordion-label">Text settings</span>
                                        {expandedSection === 'text-settings' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                    {expandedSection === 'text-settings' && (
                                        <div className="accordion-content">
                                            {/* AI Agent */}
                                            <div className="ai-agent-row">
                                                <span className="ai-label">AI agent</span>
                                                <button className="refine-text-btn">
                                                    <Sparkles size={14} />
                                                    Refine text
                                                </button>
                                            </div>

                                            {/* Text Content */}
                                            <div className="settings-field-v2">
                                                <label>Content</label>
                                                <textarea
                                                    value={block.settings.content}
                                                    onChange={(e) => handleChange('content', e.target.value)}
                                                    rows={4}
                                                    placeholder="Enter your text..."
                                                />
                                            </div>

                                            {/* Text Alignment */}
                                            <div className="settings-field-v2">
                                                <label>Text alignment</label>
                                                <div className="alignment-toggle-v2">
                                                    {['left', 'center', 'right', 'justify'].map((align) => (
                                                        <button
                                                            key={align}
                                                            className={block.settings.textAlign === align ? 'active' : ''}
                                                            onClick={() => handleChange('textAlign', align)}
                                                        >
                                                            {align === 'left' && <AlignLeft size={18} />}
                                                            {align === 'center' && <AlignCenter size={18} />}
                                                            {align === 'right' && <AlignRight size={18} />}
                                                            {align === 'justify' && <AlignJustify size={18} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Line Height */}
                                            <div className="settings-field-v2">
                                                <label>Line height</label>
                                                <div className="button-group-v2">
                                                    {['1', '1.5', '2', 'custom'].map((height) => (
                                                        <button
                                                            key={height}
                                                            className={`icon-toggle-btn ${(block.settings.lineHeight === height) ? 'active' : ''}`}
                                                            onClick={() => handleChange('lineHeight', height)}
                                                        >
                                                            {height === 'custom' ? <MoreHorizontal size={16} /> : <AlignLeft size={16} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Writing Direction */}
                                            <div className="settings-field-v2">
                                                <label>Writing direction</label>
                                                <div className="button-group-v2 two-col">
                                                    <button
                                                        className={`icon-toggle-btn ${(block.settings.direction === 'ltr' || !block.settings.direction) ? 'active' : ''}`}
                                                        onClick={() => handleChange('direction', 'ltr')}
                                                    >
                                                        <span style={{ fontSize: '12px', fontWeight: 600 }}>→</span>
                                                    </button>
                                                    <button
                                                        className={`icon-toggle-btn ${(block.settings.direction === 'rtl') ? 'active' : ''}`}
                                                        onClick={() => handleChange('direction', 'rtl')}
                                                    >
                                                        <span style={{ fontSize: '12px', fontWeight: 600 }}>←</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {renderBackgroundV2()}

                                {/* Layout Section */}
                                <div className="settings-section">
                                    {renderAccordionHeader('layout-text', 'Layout')}
                                    {expandedSection === 'layout-text' && (
                                        <div className="accordion-content">
                                            {renderWidthV2()}
                                            {renderAlignmentV2()}
                                            {renderBorderRadiusV2()}
                                        </div>
                                    )}
                                </div>

                                {renderSpacingV2()}

                                {/* Borders Section */}
                                <div className="settings-section">
                                    {renderAccordionHeader('borders', 'Borders')}
                                    {expandedSection === 'borders' && (
                                        <div className="accordion-content" style={{ padding: '0 20px 24px' }}>
                                            <div className="settings-row-inline" style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                                                <label style={{ fontSize: '16px', color: '#111', fontWeight: '500' }}>Apply on all sides</label>
                                                <div className={`switch-v2 ${block.settings.useUniformBorder ? 'active' : ''}`} onClick={() => handleChange('useUniformBorder', !block.settings.useUniformBorder)}>
                                                    <div className="switch-handle-v2" />
                                                </div>
                                            </div>
                                            <div className="settings-row-inline" style={{ marginTop: '16px', padding: '0 4px' }}>
                                                <label style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>All</label>
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    <Grid size={18} style={{ color: '#94a3b8' }} />
                                                    <div className="stepper-v2">
                                                        <button onClick={() => handleChange('borderWidth', Math.max(0, (parseInt(block.settings.borderWidth) || 0) - 1))}>
                                                            <Minus size={14} />
                                                        </button>
                                                        <div className="stepper-value">
                                                            <span>{parseInt(block.settings.borderWidth) || 0}</span>
                                                            <span className="unit">px</span>
                                                        </div>
                                                        <button onClick={() => handleChange('borderWidth', (parseInt(block.settings.borderWidth) || 0) + 1)}>
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="color-swatch-v2" style={{ backgroundColor: block.settings.borderColor || '#e2e8f0' }}>
                                                        <input
                                                            type="color"
                                                            value={block.settings.borderColor || '#e2e8f0'}
                                                            onChange={(e) => handleChange('borderColor', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content Visibility Section */}
                                {/* <div className="settings-section">
                                    {renderAccordionHeader('content-visibility', 'Content visibility')}
                                    {expandedSection === 'content-visibility' && (
                                        <div className="accordion-content">
                                            <p style={{ fontSize: '13px', color: '#64748b' }}>Control when this content is visible</p>
                                        </div>
                                    )}
                                </div> */}
                            </div>
                        )}
                        {/* Button Content Field */}
                        {block.type === 'button' && renderField('Content', 'input', 'content')}

                        {block.type === 'image' && (
                            <div className="v2-image-settings">
                                <div className="settings-section">
                                    {renderAccordionHeader('image-main', 'Image settings')}
                                    {expandedSection === 'image-main' && (
                                        <div className="accordion-content">
                                            <div className="image-actions-row">
                                                <button className="v2-action-btn"><Wand2 size={14} /> Use AI</button>
                                                <button className="v2-action-btn" onClick={() => openLibrary((url) => handleChange('url', url))}><ImageIcon size={14} /> Replace</button>
                                            </div>
                                            <div className="image-preview-card" onClick={() => openLibrary((url) => handleChange('url', url))}>
                                                {block.settings.url ? (
                                                    <img src={block.settings.url} alt="Preview" />
                                                ) : (
                                                    <div className="preview-placeholder">
                                                        <div className="center-replace-overlay">
                                                            <button className="canvas-replace-btn">
                                                                <ImageIcon size={14} /> Replace
                                                            </button>
                                                        </div>
                                                        <ImageIcon size={48} strokeWidth={1} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="image-info-text">
                                                1912 x 1400 px - 20KB
                                            </div>

                                            <div className="settings-field-v2">
                                                <label>Insert image from URL</label>
                                                <div className="input-with-action">
                                                    <input
                                                        type="text"
                                                        value={block.settings.url}
                                                        onChange={(e) => handleChange('url', e.target.value)}
                                                        placeholder="https://..."
                                                    />
                                                    <button className="icon-action-btn"><span style={{ fontSize: '10px' }}>{'{}'}</span></button>
                                                </div>
                                            </div>

                                            <div className="settings-field-v2">
                                                <label>Alt text</label>
                                                <input
                                                    type="text"
                                                    value={block.settings.alt}
                                                    onChange={(e) => handleChange('alt', e.target.value)}
                                                    placeholder="Describe your image"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="settings-section">
                                    {renderAccordionHeader('link-settings', 'Link settings')}
                                    {expandedSection === 'link-settings' && (
                                        <div className="accordion-content">
                                            <div className="settings-field-v2">
                                                <label>Link type</label>
                                                <select
                                                    value={block.settings.linkType || 'url'}
                                                    onChange={(e) => handleChange('linkType', e.target.value)}
                                                >
                                                    <option value="url">Absolute link (URL)</option>
                                                    <option value="email">Email address</option>
                                                    <option value="phone">Phone number</option>
                                                </select>
                                            </div>

                                            <div className="settings-field-v2">
                                                <label>Link target</label>
                                                <div className="input-with-action">
                                                    <input
                                                        type="text"
                                                        value={block.settings.linkUrl || ''}
                                                        onChange={(e) => handleChange('linkUrl', e.target.value)}
                                                        placeholder="Enter URL"
                                                    />
                                                    <button className="icon-action-btn"><span style={{ fontSize: '10px' }}>{'{}'}</span></button>
                                                </div>
                                            </div>

                                            <div className="settings-field-v2">
                                                <label>Tooltip text</label>
                                                <input
                                                    type="text"
                                                    value={block.settings.tooltip || ''}
                                                    onChange={(e) => handleChange('tooltip', e.target.value)}
                                                />
                                            </div>

                                            <div className="remove-link-wrapper">
                                                <button className="text-action-link" onClick={() => {
                                                    handleChange('linkUrl', '');
                                                    handleChange('tooltip', '');
                                                }}>
                                                    <Wand2 size={14} style={{ transform: 'rotate(45deg)' }} /> Remove link
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="settings-section">
                                    {renderAccordionHeader('layout', 'Layout')}
                                    {expandedSection === 'layout' && (
                                        <div className="accordion-content">
                                            {renderWidthV2()}
                                            {renderAlignmentV2()}
                                            {renderBorderRadiusV2()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}


                        {block.type === 'divider' && (
                            <>
                                {renderField('Color', 'color', 'color')}
                                {renderField('Height (px)', 'input', 'height')}
                            </>
                        )}

                        {block.type === 'spacer' && renderField('Height (px)', 'input', 'height')}

                        {block.type === 'logo' && (
                            <>
                                <div className="settings-field-v2">
                                    <label>Logo Preview</label>
                                    <div className="image-preview-card mini" onClick={() => openLibrary((url) => handleChange('url', url))}>
                                        <img src={block.settings.url} alt="Logo" />
                                    </div>
                                    <button className="add-more-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => openLibrary((url) => handleChange('url', url))}>
                                        <ImageIcon size={14} /> Change Logo
                                    </button>
                                </div>
                                {renderWidthV2()}
                                {renderAlignmentV2('alignment')}
                            </>
                        )}

                        {block.type === 'html' && renderField('HTML Code', 'text', 'content', { rows: 8 })}

                        {block.type === 'product' && (
                            <>
                                <div className="settings-field-v2">
                                    <label>Product Image</label>
                                    <div className="image-preview-card" onClick={() => openLibrary((url) => handleChange('image', url))}>
                                        <img src={block.settings.image} alt="Product" />
                                    </div>
                                    <button className="add-more-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => openLibrary((url) => handleChange('image', url))}>
                                        <ImageIcon size={14} /> Change Image
                                    </button>
                                </div>
                                {renderField('Product Title', 'input', 'title')}
                                {renderField('Price', 'input', 'price')}
                                {renderField('Button Text', 'input', 'buttonText')}
                                {renderField('Product URL', 'input', 'url')}
                                {renderAlignmentV2('alignment')}
                            </>
                        )}

                        {block.type === 'navigation' && (
                            <div className="navigation-editor">
                                <label>Links</label>
                                {block.settings.links.map((link, index) => (
                                    <div key={index} className="settings-field row" style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                                        <input
                                            type="text"
                                            value={link.label}
                                            onChange={(e) => {
                                                const newLinks = [...block.settings.links];
                                                newLinks[index].label = e.target.value;
                                                handleChange('links', newLinks);
                                            }}
                                            placeholder="Label"
                                            style={{ flex: 1 }}
                                        />
                                        <input
                                            type="text"
                                            value={link.url}
                                            onChange={(e) => {
                                                const newLinks = [...block.settings.links];
                                                newLinks[index].url = e.target.value;
                                                handleChange('links', newLinks);
                                            }}
                                            placeholder="URL"
                                            style={{ flex: 1 }}
                                        />
                                        <button className="delete-btn" onClick={() => {
                                            const newLinks = block.settings.links.filter((_, i) => i !== index);
                                            handleChange('links', newLinks);
                                        }}><Trash2 size={16} /></button>
                                    </div>
                                ))}
                                <button className="add-more-btn" onClick={() => {
                                    handleChange('links', [...block.settings.links, { label: 'New Link', url: '#' }]);
                                }}>
                                    <Plus size={16} /> Add Link
                                </button>
                                {renderField('Font Size', 'input', 'fontSize')}
                                {renderField('Link Color', 'color', 'color')}
                                {renderAlignmentV2('alignment')}
                            </div>
                        )}

                        {block.type === 'payment' && (
                            <>
                                {renderField('Button Label', 'input', 'label')}
                                {renderField('Payment URL', 'input', 'url')}
                                {renderField('Bg Color', 'color', 'backgroundColor')}
                                {renderField('Text Color', 'color', 'color')}
                                {renderBorderRadiusV2()}
                                {renderAlignmentV2('alignment')}
                            </>
                        )}

                        {block.type === 'video' && (
                            <div className="video-settings-panel">
                                {/* Video Settings Section */}
                                <div className="settings-section">
                                    {renderAccordionHeader('video-settings', 'Video settings')}
                                    {expandedSection === 'video-settings' && (
                                        <div className="accordion-content">
                                            {renderWidthV2()}
                                            {renderBorderRadiusV2()}

                                            {/* Video URL */}
                                            <div className="settings-field-v2">
                                                <label>Video URL</label>
                                                <input
                                                    type="text"
                                                    value={block.settings.url || ''}
                                                    onChange={(e) => {
                                                        const url = e.target.value;
                                                        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                                        const match = url.match(regExp);
                                                        const videoId = (match && match[2].length === 11) ? match[2] : null;

                                                        const updates = { url };
                                                        if (videoId) {
                                                            updates.thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                                                            updates.videoId = videoId;
                                                        }
                                                        updateBlock(block.id, updates);
                                                    }}
                                                    placeholder="https://www.youtube.com/watch?v=..."
                                                />
                                            </div>

                                            {/* Alt Text */}
                                            <div className="settings-field-v2">
                                                <label>Alt text</label>
                                                <input
                                                    type="text"
                                                    value={block.settings.alt || ''}
                                                    onChange={(e) => handleChange('alt', e.target.value)}
                                                    placeholder="Describe your video"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="settings-section">
                                    {renderAccordionHeader('layout', 'Layout')}
                                    {expandedSection === 'layout' && (
                                        <div className="accordion-content">
                                            {renderAlignmentV2()}
                                        </div>
                                    )}
                                </div>


                                {/* Borders Section */}
                                <div className="settings-section">
                                    {renderAccordionHeader('borders', 'Borders')}
                                    {expandedSection === 'borders' && (
                                        <div className="accordion-content">
                                            {renderField('Border Width', 'input', 'borderWidth')}
                                            {renderField('Border Color', 'color', 'borderColor')}
                                        </div>
                                    )}
                                </div>

                                {/* Content Visibility Section */}
                                <div className="settings-section">
                                    {renderAccordionHeader('content-visibility', 'Content visibility')}
                                    {expandedSection === 'content-visibility' && (
                                        <div className="accordion-content">
                                            <p style={{ fontSize: '13px', color: '#64748b' }}>Control when this content is visible</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {block.type === 'columns' && (
                            <div className="layout-editor">
                                <label>Column Count</label>
                                <div className="alignment-toggle">
                                    {[1, 2, 3, 4].map((count) => (
                                        <button
                                            key={count}
                                            className={block.settings.columnCount === count ? 'active' : ''}
                                            onClick={() => {
                                                const newColumns = [...block.settings.columns];
                                                if (count > newColumns.length) {
                                                    for (let i = newColumns.length; i < count; i++) {
                                                        newColumns.push({ id: `col-${nanoid()}`, blocks: [] });
                                                    }
                                                } else {
                                                    newColumns.splice(count);
                                                }
                                                updateBlock(block.id, {
                                                    columnCount: count,
                                                    columns: newColumns,
                                                    layout: Array(count).fill(Math.floor(100 / count))
                                                });
                                            }}
                                        >
                                            {count}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="settings-grid">
                            {block.type !== 'divider' && block.type !== 'spacer' && block.type !== 'social' && block.type !== 'columns' && block.type !== 'text' && block.type !== 'title' && block.type !== 'video' && block.type !== 'image' && block.type !== 'button' && renderField('Font Size', 'input', 'fontSize')}
                            {block.type !== 'image' && block.type !== 'video' && block.type !== 'social' && block.type !== 'spacer' && block.type !== 'columns' && block.type !== 'text' && block.type !== 'title' && block.type !== 'button' && renderField('Text Color', 'color', 'color')}
                        </div>

                        {block.type === 'button' && (
                            <>
                                <div className="settings-section">
                                    {renderAccordionHeader('link-settings-button', 'Link settings')}
                                    {expandedSection === 'link-settings-button' && (
                                        <div className="accordion-content">
                                            <div className="settings-field-v2">
                                                <label>Link type</label>
                                                <select
                                                    value={block.settings.linkType || 'url'}
                                                    onChange={(e) => handleChange('linkType', e.target.value)}
                                                >
                                                    <option value="url">Absolute link (URL)</option>
                                                    <option value="email">Email address</option>
                                                    <option value="phone">Phone number</option>
                                                </select>
                                            </div>

                                            <div className="settings-field-v2">
                                                <label>Link target</label>
                                                <div className="input-with-action">
                                                    <input
                                                        type="text"
                                                        value={block.settings.url || ''}
                                                        onChange={(e) => handleChange('url', e.target.value)}
                                                        placeholder="Enter URL"
                                                    />
                                                    <button className="icon-action-btn"><span style={{ fontSize: '10px' }}>{'{}'}</span></button>
                                                </div>
                                            </div>

                                            <div className="settings-field-v2">
                                                <label>Tooltip text</label>
                                                <input
                                                    type="text"
                                                    value={block.settings.tooltip || ''}
                                                    onChange={(e) => handleChange('tooltip', e.target.value)}
                                                />
                                            </div>

                                            <div className="remove-link-wrapper">
                                                <button className="text-action-link" onClick={() => {
                                                    handleChange('url', '');
                                                    handleChange('tooltip', '');
                                                }}>
                                                    <Wand2 size={14} style={{ transform: 'rotate(45deg)' }} /> Remove link
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="settings-section">
                                    {renderAccordionHeader('button-settings', 'Button settings')}
                                    {expandedSection === 'button-settings' && (
                                        <div className="accordion-content" style={{ padding: '0 20px 24px' }}>
                                            {/* AI Refine Button */}
                                            <div style={{ marginBottom: '16px' }}>
                                                <button className="v2-action-btn" style={{ width: '100%', justifyContent: 'center' }}>
                                                    <Wand2 size={14} /> Refine text
                                                </button>
                                            </div>

                                            {/* Width */}
                                            {renderWidthV2()}

                                            {/* Rounded Corners */}
                                            {renderBorderRadiusV2()}

                                            {/* Background Color */}
                                            <div className="settings-row-inline" style={{ marginTop: '16px', padding: '0 4px' }}>
                                                <label style={{ fontSize: '14px', color: '#04060aff', fontWeight: '500' }}>Background color</label>
                                                <div className="color-swatch-v2" style={{ backgroundColor: block.settings.backgroundColor || '#f97316' }}>
                                                    <input
                                                        type="color"
                                                        value={block.settings.backgroundColor || '#f97316'}
                                                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Borders */}
                                            <div className="settings-row-inline" style={{ marginTop: '16px', padding: '0 4px' }}>
                                                <label style={{ fontSize: '14px', color: '#04060aff', fontWeight: '500' }}>Borders</label>
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    <div className="stepper-v2">
                                                        <button onClick={() => handleChange('borderWidth', Math.max(0, (parseInt(block.settings.borderWidth) || 0) - 1))}>
                                                            <Minus size={14} />
                                                        </button>
                                                        <div className="stepper-value">
                                                            <span>{parseInt(block.settings.borderWidth) || 0}</span>
                                                            <span className="unit">px</span>
                                                        </div>
                                                        <button onClick={() => handleChange('borderWidth', (parseInt(block.settings.borderWidth) || 0) + 1)}>
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="color-swatch-v2" style={{ backgroundColor: block.settings.borderColor || '#e2e8f0' }}>
                                                        <input
                                                            type="color"
                                                            value={block.settings.borderColor || '#e2e8f0'}
                                                            onChange={(e) => handleChange('borderColor', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Writing Direction */}
                                            <div className="settings-row-inline" style={{ marginTop: '16px', padding: '0 4px' }}>
                                                <label style={{ fontSize: '14px', color: '#04060aff', fontWeight: '500' }}>Writing direction</label>
                                                <div className="alignment-toggle-v2">
                                                    <button
                                                        className={block.settings.direction === 'ltr' ? 'active' : ''}
                                                        onClick={() => handleChange('direction', 'ltr')}
                                                    >
                                                        <AlignLeft size={18} />
                                                    </button>
                                                    <button
                                                        className={block.settings.direction === 'rtl' ? 'active' : ''}
                                                        onClick={() => handleChange('direction', 'rtl')}
                                                    >
                                                        <AlignRight size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                        {block.type !== 'text' && block.type !== 'title' && renderSpacingV2()}
                    </>
                )}
            </div>
        </div>
    );
};

export default EditorSettings;
