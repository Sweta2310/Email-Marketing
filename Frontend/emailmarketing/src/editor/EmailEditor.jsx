import React, { useState, useEffect } from 'react';
import { templateAPI } from '../services/template.services';
import { campaignAPI } from '../services/campaign.services';
import html2canvas from 'html2canvas';
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import { useTemplate } from './hooks/useTemplate';
import { useHistory } from './hooks/useHistory';
import { useAutoSave, formatLastSaved } from './hooks/useAutoSave';
import BlockPalette from './components/BlockPalette';
import TemplateCanvas from './components/TemplateCanvas';
import EditorSettings from './components/EditorSettings';
import ContentLibrary from './components/ContentLibrary';
import BlockRenderer from './components/BlockRenderer'; // For overlay
import './styles/editor.css';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Eye, Save, Code, Undo2, Redo2, Clock, Monitor, Smartphone,
    ChevronLeft, Palette, Wand2, Boxes, LogOut, MoreVertical, Check, Loader2
} from 'lucide-react';
import { generateEmailHtml } from '../utils/htmlExporter';

const EmailEditor = () => {
    const navigate = useNavigate();
    const { id: campaignId } = useParams();

    const {
        blocks,
        setBlocks,
        selectedBlockId,
        setSelectedBlockId,
        selectedBlock,
        addBlock,
        addTemplateBlocks,
        updateBlock,
        deleteBlock,
        reorderBlocks,
        duplicateBlock,
    } = useTemplate();

    const [campaignStatus, setCampaignStatus] = useState('draft'); // Default to draft for new templates

    // Load campaign data on mount
    useEffect(() => {
        const loadCampaign = async () => {
            if (!campaignId) return;

            try {
                const campaign = await campaignAPI.getCampaignById(campaignId);
                console.log('Loaded campaign:', campaign);

                if (campaign.status) {
                    setCampaignStatus(campaign.status.toLowerCase());
                }

                // Load blocks from campaign
                if (campaign.blocks && campaign.blocks.length > 0) {
                    console.log('Setting blocks:', campaign.blocks);
                    setBlocks(campaign.blocks);
                }
            } catch (error) {
                console.error('Error loading campaign:', error);
            }
        };

        loadCampaign();
    }, [campaignId, setBlocks]);

    // Undo/Redo History
    const {
        state: historyBlocks,
        setState: setHistoryBlocks,
        undo,
        redo,
        canUndo,
        canRedo
    } = useHistory(blocks);

    // Sync blocks with history
    useEffect(() => {
        setBlocks(historyBlocks);
    }, [historyBlocks, setBlocks]);

    // Update history when blocks change from user actions
    useEffect(() => {
        if (JSON.stringify(blocks) !== JSON.stringify(historyBlocks)) {
            setHistoryBlocks(blocks);
        }
    }, [blocks]);

    // Auto-save
    const { lastSaved, isSaving } = useAutoSave(
        campaignId,
        { blocks, design: { blocks } },
        3000, // 3 seconds debounce
        campaignStatus // Pass status to prevent non-draft saves
    );

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    const [activePaletteItem, setActivePaletteItem] = useState(null);
    const [viewMode, setViewMode] = useState('desktop');
    const [activeTab, setActiveTab] = useState('content'); // content, style, aura
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [libraryCallback, setLibraryCallback] = useState(null);

    const openLibrary = (callback) => {
        setLibraryCallback(() => callback);
        setIsLibraryOpen(true);
    };

    const handleSelectImage = (url) => {
        if (libraryCallback) libraryCallback(url);
        setIsLibraryOpen(false);
    };

    const handleBack = () => {
        if (campaignId) {
            navigate(`/campaign/${campaignId}`);
        } else {
            navigate('/dashboard');
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event) => {
        const { active } = event;
        if (active.data.current?.isPaletteItem || active.data.current?.isTemplateItem) {
            setActivePaletteItem(active.data.current);
        }
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // If dragging a block (not palette item)
        if (!active.data.current?.isPaletteItem) {
            // Check if containers are different
            // This would require finding which container activeId belongs to vs overId
            // For now, let's keep it simple and handle reordering in handleDragEnd
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActivePaletteItem(null);

        if (!over) return;

        // Logic for template item drop
        if (active.data.current?.isTemplateItem) {
            const template = active.data.current.template;
            addTemplateBlocks(template.design?.blocks || [], over.id);
            return;
        }

        // Logic for section item drop
        if (active.data.current?.isSectionItem) {
            const section = active.data.current.section;
            addTemplateBlocks(section.blocks || [], over.id);
            return;
        }

        // Logic for palette item drop
        if (active.data.current?.isPaletteItem) {
            addBlock(active.data.current.type, over.id);
            return;
        }

        // Logic for reordering
        if (active.id !== over.id) {
            reorderBlocks(active.id, over.id);
        }
    };

    return (
        <div className="email-editor-root">
            {/* NEW TOP NAVBAR */}
            <nav className="editor-navbar-v2">
                <div className="nav-left">
                    <button className="back-btn" onClick={handleBack}>
                        <LogOut size={20} />
                    </button>
                    <div className="v-divider"></div>
                    <div className="email-info">
                        <span className="email-name">email marketing</span>
                        <div className="history-actions">
                            <button
                                title="Undo (Ctrl+Z)"
                                onClick={undo}
                                disabled={!canUndo}
                                className={!canUndo ? 'disabled' : ''}
                            >
                                <Undo2 size={16} />
                            </button>
                            <button
                                title="Redo (Ctrl+Y)"
                                onClick={redo}
                                disabled={!canRedo}
                                className={!canRedo ? 'disabled' : ''}
                            >
                                <Redo2 size={16} />
                            </button>
                        </div>
                        <div className="save-status">
                            {isSaving ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Check size={14} />
                                    <span>Last saved {formatLastSaved(lastSaved)}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="nav-center">
                    <div className="device-toggle">
                        <button
                            className={`toggle-btn ${viewMode === 'desktop' ? 'active' : ''}`}
                            onClick={() => setViewMode('desktop')}
                        >
                            <Monitor size={18} />
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'mobile' ? 'active' : ''}`}
                            onClick={() => setViewMode('mobile')}
                        >
                            <Smartphone size={18} />
                        </button>
                    </div>
                </div>

                <div className="nav-right">

                    <button className="preview-btn">
                        Preview & test
                    </button>
                    {campaignStatus !== 'draft' && campaignId && (
                        <div style={{
                            padding: '6px 12px',
                            background: '#fff7ed',
                            color: '#c2410c',
                            border: '1px solid #ffedd5',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            marginRight: '0.5rem'
                        }}>
                            Editing (Will reset to Draft)
                        </div>
                    )}
                    <button
                        className="save-quit-btn"
                        onClick={async () => {
                            try {
                                const element = document.querySelector('.canvas-area-v2');
                                if (!element) throw new Error('Canvas element not found');

                                console.log('Starting capture...');
                                const canvas = await html2canvas(element, {
                                    useCORS: true,
                                    scale: 0.5, // Reduce size
                                    logging: false
                                });

                                const thumbnail = canvas.toDataURL('image/jpeg', 0.6);
                                console.log('Thumbnail generated, length:', thumbnail.length);

                                // Generate HTML from blocks
                                const htmlContent = generateEmailHtml({ blocks, content: { subject: 'Email' } }); // Subject is placeholder, will be preserved by backend merge
                                console.log('Generated HTML length:', htmlContent.length);

                                if (campaignId) {
                                    // Updating existing campaign
                                    const payload = {
                                        design: { blocks, thumbnail },
                                        blocks,
                                        content: {
                                            html: htmlContent
                                        }
                                    };

                                    // If we are editing a non-draft campaign, force it back to Draft
                                    if (campaignStatus !== 'draft') {
                                        payload.status = 'Draft';
                                    }

                                    await campaignAPI.updateCampaign(campaignId, payload);
                                    navigate(`/campaign/${campaignId}`);
                                } else {
                                    // Create new template flow
                                    const name = window.prompt("Enter a name for your template:", "My Awesome Template");
                                    if (!name) return;

                                    const payload = {
                                        name,
                                        design: { blocks },
                                        thumbnail, // Add to payload
                                        html: htmlContent,
                                        category: "saved"
                                    };

                                    await templateAPI.createTemplate(payload);
                                    alert("Template saved successfully!");
                                    navigate('/dashboard');
                                }
                            } catch (error) {
                                console.error("Save error:", error);
                                console.error("Error Status:", error.response?.status);
                                console.error("Error Data:", JSON.stringify(error.response?.data, null, 2));
                                alert("Failed to save: " + (error.response?.data?.message || error.message));
                            }
                        }}
                    >
                        Save & quit
                    </button>
                    <button className="more-btn">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </nav>

            <div className="editor-main-layout">
                {/* NEW VERTICAL SIDE NAV */}
                <aside className="vertical-side-nav">
                    <button
                        className={`nav-item ${activeTab === 'content' ? 'active' : ''}`}
                        onClick={() => setActiveTab('content')}
                    >
                        <Boxes size={22} />
                        <span>Content</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'style' ? 'active' : ''}`}
                        onClick={() => setActiveTab('style')}
                    >
                        <Palette size={22} />
                        <span>Style</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'aura' ? 'active' : ''}`}
                        onClick={() => setActiveTab('aura')}
                    >
                        <Wand2 size={22} />
                        <span>Aura AI</span>
                    </button>
                </aside>

                <div className="email-editor-container-v2">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToWindowEdges]}
                    >
                        {/* LEFT PALETTE PANEL */}
                        <div className="palette-panel">
                            {activeTab === 'content' && (
                                selectedBlockId ? (
                                    <EditorSettings
                                        block={selectedBlock}
                                        updateBlock={updateBlock}
                                        openLibrary={openLibrary}
                                        onClose={() => setSelectedBlockId(null)}
                                    />
                                ) : (
                                    <BlockPalette />
                                )
                            )}
                            {activeTab === 'style' && <div className="placeholder-panel">Style Settings</div>}
                            {activeTab === 'aura' && <div className="placeholder-panel">Aura AI Assistant</div>}
                        </div>

                        <ContentLibrary
                            isOpen={isLibraryOpen}
                            onClose={() => setIsLibraryOpen(false)}
                            onSelectImage={handleSelectImage}
                        />

                        {/* CANVAS AREA with Grid Background */}
                        <div className={`canvas-area-v2 ${viewMode}`}>
                            <div className="canvas-wrapper">
                                <TemplateCanvas
                                    blocks={blocks}
                                    selectedBlockId={selectedBlockId}
                                    setSelectedBlockId={setSelectedBlockId}
                                    deleteBlock={deleteBlock}
                                    duplicateBlock={duplicateBlock}
                                />
                            </div>
                        </div>

                        <DragOverlay>
                            {activePaletteItem ? (
                                <div className="palette-item dragging-overlay">
                                    <span>
                                        {activePaletteItem.isTemplateItem
                                            ? activePaletteItem.template?.name
                                            : activePaletteItem.type?.toUpperCase()}
                                    </span>
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>
        </div>
    );
};

export default EmailEditor;

