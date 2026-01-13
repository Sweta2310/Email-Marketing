import { nanoid } from 'nanoid';

/**
 * Recursively assigns unique IDs to all blocks in a template
 * This ensures each block can be properly tracked by the editor's drag-and-drop system
 * @param {Array} blocks - Array of block objects from a template
 * @returns {Array} - New array with all blocks having unique IDs
 */
export const assignBlockIds = (blocks) => {
    if (!Array.isArray(blocks)) return [];

    return blocks.map(block => {
        const newBlock = {
            ...block,
            id: nanoid()
        };

        // Handle nested blocks in columns
        if (block.type === 'columns' && block.settings?.columns) {
            newBlock.settings = {
                ...block.settings,
                columns: block.settings.columns.map(col => ({
                    ...col,
                    id: col.id || nanoid(),
                    blocks: assignBlockIds(col.blocks || [])
                }))
            };
        }

        return newBlock;
    });
};

/**
 * Validates that all blocks have required properties
 * @param {Array} blocks - Array of block objects
 * @returns {boolean} - True if all blocks are valid
 */
export const validateBlocks = (blocks) => {
    if (!Array.isArray(blocks)) return false;

    return blocks.every(block => {
        if (!block.id || !block.type || !block.settings) return false;

        // Recursively validate column blocks
        if (block.type === 'columns' && block.settings?.columns) {
            return block.settings.columns.every(col =>
                col.id && validateBlocks(col.blocks || [])
            );
        }

        return true;
    });
};
