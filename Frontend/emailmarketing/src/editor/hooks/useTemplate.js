import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { arrayMove } from '@dnd-kit/sortable';

const DEFAULT_SETTINGS = {
    title: {
        content: 'Click to edit title',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
        padding: '20px',
        fontFamily: 'Arial, Helvetica, sans-serif',
    },
    text: {
        content: 'Enter your text here. This is a sample paragraph for your email template.',
        fontSize: '16px',
        color: '#666666',
        textAlign: 'left',
        padding: '10px 20px',
        lineHeight: '1.5',
        fontFamily: 'Arial, Helvetica, sans-serif',
    },
    image: {
        url: 'https://via.placeholder.com/600x300?text=Placeholder+Image',
        alt: 'Email Image',
        width: '100%',
        borderRadius: '8px',
        padding: '10px 20px',
    },
    button: {
        content: 'Click Me',
        url: '#',
        backgroundColor: '#007bff',
        color: '#ffffff',
        borderRadius: '5px',
        padding: '12px 24px',
        fontSize: '16px',
        textAlign: 'center',
        display: 'inline-block',
        margin: '10px auto',
    },
    social: {
        networks: [
            { name: 'facebook', url: 'https://facebook.com' },
            { name: 'twitter', url: 'https://twitter.com' },
            { name: 'instagram', url: 'https://instagram.com' },
            { name: 'youtube', url: 'https://youtube.com' }
        ],
        align: 'center',
        padding: '20px',
        iconSize: '32px',
        iconSpacing: '10px'
    },
    divider: {
        height: '1px',
        color: '#e0e0e0',
        padding: '20px 0',
        width: '100%'
    },
    spacer: {
        height: '40px'
    },
    video: {
        url: '',
        thumbnail: 'https://via.placeholder.com/600x340?text=Video+Placeholder',
        padding: '10px 20px',
        width: '100%'
    },
    columns: {
        columnCount: 2,
        layout: [50, 50],
        padding: '10px 0',
        columns: [
            { id: 'col-1', blocks: [] },
            { id: 'col-2', blocks: [] }
        ]
    },
    logo: {
        url: 'https://via.placeholder.com/150x50?text=LOGO',
        width: '150px',
        align: 'center',
        padding: '20px',
    },
    html: {
        content: '<div>Editable HTML content</div>',
        padding: '10px',
    },
    product: {
        image: 'https://via.placeholder.com/200?text=Product',
        title: 'Premium Product Name',
        price: '$99.00',
        buttonText: 'Shop Now',
        url: '#',
        padding: '20px',
        textAlign: 'center',
    },
    navigation: {
        links: [
            { label: 'Home', url: '#' },
            { label: 'Shop', url: '#' },
            { label: 'Contact', url: '#' }
        ],
        padding: '15px',
        align: 'center',
        color: '#333333',
        fontSize: '14px',
    },
    payment: {
        label: 'Pay Now',
        url: '#',
        backgroundColor: '#10b981',
        color: '#ffffff',
        borderRadius: '5px',
        padding: '12px 24px',
        fontSize: '16px',
        textAlign: 'center',
    }
};

export const useTemplate = () => {
    const [blocks, setBlocks] = useState([]);
    const [selectedBlockId, setSelectedBlockId] = useState(null);

    const findBlockById = useCallback((list, id) => {
        for (const block of list) {
            if (block.id === id) return block;
            if (block.type === 'columns') {
                for (const col of block.settings.columns) {
                    const found = findBlockById(col.blocks, id);
                    if (found) return found;
                }
            }
        }
        return null;
    }, []);

    const addBlock = useCallback((type, containerId = null) => {
        const newBlock = {
            id: nanoid(),
            type,
            settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS[type])),
        };

        if (!containerId || containerId === 'canvas-droppable') {
            setBlocks((prev) => [...prev, newBlock]);
        } else {
            setBlocks((prev) => {
                const updateList = (list) => {
                    return list.map(block => {
                        if (block.type === 'columns') {
                            const updatedCols = block.settings.columns.map(col => {
                                if (col.id === containerId) {
                                    return { ...col, blocks: [...col.blocks, newBlock] };
                                }
                                return { ...col, blocks: updateList(col.blocks) };
                            });
                            return { ...block, settings: { ...block.settings, columns: updatedCols } };
                        }
                        return block;
                    });
                };
                return updateList(prev);
            });
        }
        setSelectedBlockId(newBlock.id);
    }, []);

    const updateBlock = useCallback((id, newSettings) => {
        const updateList = (list) => {
            return list.map(block => {
                if (block.id === id) {
                    return { ...block, settings: { ...block.settings, ...newSettings } };
                }
                if (block.type === 'columns') {
                    const updatedCols = block.settings.columns.map(col => ({
                        ...col,
                        blocks: updateList(col.blocks)
                    }));
                    return { ...block, settings: { ...block.settings, columns: updatedCols } };
                }
                return block;
            });
        };
        setBlocks((prev) => updateList(prev));
    }, []);

    const deleteBlock = useCallback((id) => {
        const deleteFromList = (list) => {
            return list
                .filter(block => block.id !== id)
                .map(block => {
                    if (block.type === 'columns') {
                        const updatedCols = block.settings.columns.map(col => ({
                            ...col,
                            blocks: deleteFromList(col.blocks)
                        }));
                        return { ...block, settings: { ...block.settings, columns: updatedCols } };
                    }
                    return block;
                });
        };
        setBlocks((prev) => deleteFromList(prev));
        if (selectedBlockId === id) setSelectedBlockId(null);
    }, [selectedBlockId]);

    const reorderBlocks = useCallback((activeId, overId) => {
        setBlocks((prev) => {
            let activeBlock = null;

            // 1. Recursive function to find and remove the active block
            const removeBlock = (list) => {
                const index = list.findIndex(b => b.id === activeId);
                if (index !== -1) {
                    activeBlock = list[index];
                    const newList = [...list];
                    newList.splice(index, 1);
                    return newList;
                }
                return list.map(block => {
                    if (block.type === 'columns') {
                        const updatedCols = block.settings.columns.map(col => ({
                            ...col,
                            blocks: removeBlock(col.blocks)
                        }));
                        return { ...block, settings: { ...block.settings, columns: updatedCols } };
                    }
                    return block;
                });
            };

            // 2. Recursive function to find the over target and insert the active block
            const insertBlock = (list) => {
                // If the list itself is the target container (e.g., a column id)
                // However, dnd-kit usually gives us the ID of an ITEM or a Container

                const index = list.findIndex(b => b.id === overId);
                if (index !== -1) {
                    const newList = [...list];
                    newList.splice(index, 0, activeBlock);
                    return newList;
                }

                return list.map(block => {
                    // Check if block is a column container itself
                    if (block.id === overId) {
                        // This handles dropping onto an empty container
                    }

                    if (block.type === 'columns') {
                        const updatedCols = block.settings.columns.map(col => {
                            if (col.id === overId) {
                                return { ...col, blocks: [...col.blocks, activeBlock] };
                            }
                            return { ...col, blocks: insertBlock(col.blocks) };
                        });
                        return { ...block, settings: { ...block.settings, columns: updatedCols } };
                    }
                    return block;
                });
            };

            // First find and remove
            const listWithoutActive = removeBlock(prev);
            if (!activeBlock) return prev; // Should not happen

            // Special case: if dropping onto canvas-droppable
            if (overId === 'canvas-droppable') {
                return [...listWithoutActive, activeBlock];
            }

            // Then insert
            return insertBlock(listWithoutActive);
        });
    }, []);

    const duplicateBlock = useCallback((id) => {
        const sourceBlock = findBlockById(blocks, id);
        if (!sourceBlock) return;

        const newBlock = JSON.parse(JSON.stringify(sourceBlock));
        newBlock.id = nanoid();

        const duplicateInList = (list) => {
            const index = list.findIndex(b => b.id === id);
            if (index !== -1) {
                const newList = [...list];
                newList.splice(index + 1, 0, newBlock);
                return newList;
            }
            return list.map(block => {
                if (block.type === 'columns') {
                    const updatedCols = block.settings.columns.map(col => ({
                        ...col,
                        blocks: duplicateInList(col.blocks)
                    }));
                    return { ...block, settings: { ...block.settings, columns: updatedCols } };
                }
                return block;
            });
        };

        setBlocks((prev) => duplicateInList(prev));
        setSelectedBlockId(newBlock.id);
    }, [blocks, findBlockById]);

    const addTemplateBlocks = useCallback((templateBlocks, containerId = null) => {
        const clonedBlocks = JSON.parse(JSON.stringify(templateBlocks)).map(block => ({
            ...block,
            id: nanoid()
        }));

        if (!containerId || containerId === 'canvas-droppable') {
            setBlocks((prev) => [...prev, ...clonedBlocks]);
        } else {
            setBlocks((prev) => {
                const updateList = (list) => {
                    return list.map(block => {
                        if (block.type === 'columns') {
                            const updatedCols = block.settings.columns.map(col => {
                                if (col.id === containerId) {
                                    return { ...col, blocks: [...col.blocks, ...clonedBlocks] };
                                }
                                return { ...col, blocks: updateList(col.blocks) };
                            });
                            return { ...block, settings: { ...block.settings, columns: updatedCols } };
                        }
                        return block;
                    });
                };
                return updateList(prev);
            });
        }
    }, []);

    return {
        blocks,
        setBlocks,
        selectedBlockId,
        setSelectedBlockId,
        addBlock,
        addTemplateBlocks,
        updateBlock,
        deleteBlock,
        reorderBlocks,
        duplicateBlock,
        selectedBlock: findBlockById(blocks, selectedBlockId),
    };
};
