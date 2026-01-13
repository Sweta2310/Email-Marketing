import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import BlockRenderer from './BlockRenderer';
import { ArrowDown } from 'lucide-react';

const TemplateCanvas = ({ blocks, selectedBlockId, setSelectedBlockId, deleteBlock, duplicateBlock }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'canvas-droppable',
    });

    return (
        <div className="canvas-container">
            <div
                ref={setNodeRef}
                className={`template-canvas ${isOver ? 'is-over' : ''}`}
                onClick={() => setSelectedBlockId(null)}
            >
                <div className="email-wrapper" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', background: '#ffffff', minHeight: '100%' }}>
                    {blocks.length === 0 ? (
                        <div className="v2-empty-canvas">
                            <div className="empty-placeholder-box">
                                <div className="placeholder-icon-circle">
                                    <ArrowDown size={20} color="#5a57d9" />
                                </div>
                                <span className="placeholder-text">Drop your block here</span>
                            </div>
                        </div>
                    ) : (
                        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                            {blocks.map((block) => (
                                <BlockRenderer
                                    key={block.id}
                                    block={block}
                                    isSelected={selectedBlockId === block.id}
                                    onSelect={setSelectedBlockId}
                                    onDelete={deleteBlock}
                                    onDuplicate={duplicateBlock}
                                />
                            ))}
                        </SortableContext>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TemplateCanvas;


