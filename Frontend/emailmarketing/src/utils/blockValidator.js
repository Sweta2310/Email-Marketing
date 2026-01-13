/**
 * Block Validator
 * Validates blocks to ensure no HTML in content
 */

import { hasHtmlTags } from './htmlNormalizer';

/**
 * Validate a single block
 * @param {object} block - Block to validate
 * @returns {object} Validation result
 */
export function validateBlock(block) {
    const errors = [];

    if (!block) {
        return {
            isValid: false,
            errors: ['Block is null or undefined']
        };
    }

    if (!block.type) {
        errors.push('Block type is required');
    }

    if (!block.settings) {
        errors.push('Block settings are required');
    }

    // Check for HTML in content
    if (block.settings?.content) {
        if (hasHtmlTags(block.settings.content)) {
            errors.push(`HTML tags found in content: "${block.settings.content.substring(0, 50)}..."`);
        }

        // Check for < or > characters
        if (block.settings.content.includes('<') || block.settings.content.includes('>')) {
            errors.push('Content contains < or > characters which are not allowed');
        }
    }

    // Validate emphasis structure if present
    if (block.settings?.emphasis) {
        const emphasisErrors = validateEmphasis(block.settings.emphasis, block.settings.content);
        errors.push(...emphasisErrors);
    }

    // Validate links structure if present
    if (block.settings?.links) {
        const linkErrors = validateLinks(block.settings.links, block.settings.content);
        errors.push(...linkErrors);
    }

    // Validate columns if present
    if (block.type === 'columns' && block.settings?.columns) {
        const columnErrors = validateColumns(block.settings.columns);
        errors.push(...columnErrors);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate emphasis structure
 * @param {object} emphasis - Emphasis object
 * @param {string} content - Content text
 * @returns {array} Errors
 */
function validateEmphasis(emphasis, content) {
    const errors = [];

    if (!emphasis.ranges || !Array.isArray(emphasis.ranges)) {
        errors.push('Emphasis must have a ranges array');
        return errors;
    }

    emphasis.ranges.forEach((range, index) => {
        if (typeof range.start !== 'number' || typeof range.end !== 'number') {
            errors.push(`Emphasis range ${index}: start and end must be numbers`);
        }

        if (range.start < 0 || range.end > content.length) {
            errors.push(`Emphasis range ${index}: out of bounds`);
        }

        if (range.start >= range.end) {
            errors.push(`Emphasis range ${index}: start must be less than end`);
        }

        if (!range.style) {
            errors.push(`Emphasis range ${index}: style is required`);
        }

        const validStyles = ['bold', 'italic', 'highlight'];
        if (range.style && !validStyles.includes(range.style)) {
            errors.push(`Emphasis range ${index}: invalid style "${range.style}"`);
        }

        if (range.style === 'highlight' && !range.color) {
            errors.push(`Emphasis range ${index}: highlight style requires color`);
        }
    });

    return errors;
}

/**
 * Validate links structure
 * @param {array} links - Links array
 * @param {string} content - Content text
 * @returns {array} Errors
 */
function validateLinks(links, content) {
    const errors = [];

    if (!Array.isArray(links)) {
        errors.push('Links must be an array');
        return errors;
    }

    links.forEach((link, index) => {
        if (typeof link.start !== 'number' || typeof link.end !== 'number') {
            errors.push(`Link ${index}: start and end must be numbers`);
        }

        if (link.start < 0 || link.end > content.length) {
            errors.push(`Link ${index}: out of bounds`);
        }

        if (link.start >= link.end) {
            errors.push(`Link ${index}: start must be less than end`);
        }

        if (!link.url) {
            errors.push(`Link ${index}: url is required`);
        }

        // Basic URL validation
        if (link.url && !isValidUrl(link.url)) {
            errors.push(`Link ${index}: invalid URL "${link.url}"`);
        }
    });

    return errors;
}

/**
 * Validate columns structure
 * @param {array} columns - Columns array
 * @returns {array} Errors
 */
function validateColumns(columns) {
    const errors = [];

    if (!Array.isArray(columns)) {
        errors.push('Columns must be an array');
        return errors;
    }

    columns.forEach((col, index) => {
        if (!col.id) {
            errors.push(`Column ${index}: id is required`);
        }

        if (!col.blocks || !Array.isArray(col.blocks)) {
            errors.push(`Column ${index}: blocks array is required`);
        } else {
            // Validate nested blocks
            col.blocks.forEach((block, blockIndex) => {
                const validation = validateBlock(block);
                if (!validation.isValid) {
                    errors.push(`Column ${index}, Block ${blockIndex}: ${validation.errors.join(', ')}`);
                }
            });
        }
    });

    return errors;
}

/**
 * Basic URL validation
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
function isValidUrl(url) {
    if (!url || typeof url !== 'string') return false;

    // Allow relative URLs and anchors
    if (url.startsWith('/') || url.startsWith('#')) return true;

    // Validate absolute URLs
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate all blocks in an array
 * @param {array} blocks - Array of blocks
 * @returns {object} Validation result
 */
export function validateAllBlocks(blocks) {
    if (!Array.isArray(blocks)) {
        return {
            isValid: false,
            errors: ['Blocks must be an array']
        };
    }

    const allErrors = [];

    blocks.forEach((block, index) => {
        const validation = validateBlock(block);
        if (!validation.isValid) {
            allErrors.push(`Block ${index} (${block.type}): ${validation.errors.join(', ')}`);
        }
    });

    return {
        isValid: allErrors.length === 0,
        errors: allErrors
    };
}

/**
 * Sanitize content by removing HTML
 * @param {string} content - Content to sanitize
 * @returns {string} Sanitized content
 */
export function sanitizeContent(content) {
    if (!content || typeof content !== 'string') return '';

    // Remove all HTML tags
    let sanitized = content.replace(/<[^>]*>/g, '');

    // Remove < and > characters
    sanitized = sanitized.replace(/[<>]/g, '');

    return sanitized.trim();
}

export default {
    validateBlock,
    validateAllBlocks,
    sanitizeContent
};
