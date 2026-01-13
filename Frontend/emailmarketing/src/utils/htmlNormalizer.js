/**
 * HTML Normalizer
 * Strips HTML tags and converts to structured properties
 */

/**
 * Strip all HTML tags from a string
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
export function stripHtmlTags(html) {
    if (!html || typeof html !== 'string') return '';

    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, '');

    // Decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    text = textarea.value;

    return text.trim();
}

/**
 * Convert <br> tags to newlines
 * @param {string} html - HTML string
 * @returns {string} Text with newlines
 */
export function convertBrToNewlines(html) {
    if (!html || typeof html !== 'string') return '';

    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<p>/gi, '');
}

/**
 * Extract emphasis (bold, italic, etc.) from HTML
 * @param {string} html - HTML string
 * @param {string} plainText - Plain text version
 * @returns {object} Emphasis ranges
 */
export function extractEmphasis(html, plainText) {
    if (!html || typeof html !== 'string') return { ranges: [] };

    const ranges = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const container = doc.querySelector('div');

    let currentIndex = 0;

    function traverse(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            currentIndex += text.length;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            const startIndex = currentIndex;

            // Process children first
            Array.from(node.childNodes).forEach(child => traverse(child));

            const endIndex = currentIndex;

            // Add range based on tag type
            if (tagName === 'strong' || tagName === 'b') {
                ranges.push({
                    start: startIndex,
                    end: endIndex,
                    style: 'bold'
                });
            } else if (tagName === 'em' || tagName === 'i') {
                ranges.push({
                    start: startIndex,
                    end: endIndex,
                    style: 'italic'
                });
            } else if (tagName === 'span' || tagName === 'font') {
                const style = node.getAttribute('style') || '';
                const color = extractColor(style);

                if (color) {
                    ranges.push({
                        start: startIndex,
                        end: endIndex,
                        style: 'highlight',
                        color: color
                    });
                }
            }
        }
    }

    if (container) {
        Array.from(container.childNodes).forEach(child => traverse(child));
    }

    return { ranges };
}

/**
 * Extract color from style string
 * @param {string} style - CSS style string
 * @returns {string|null} Color value
 */
function extractColor(style) {
    const colorMatch = style.match(/color:\s*([^;]+)/i);
    return colorMatch ? colorMatch[1].trim() : null;
}

/**
 * Extract links from HTML
 * @param {string} html - HTML string
 * @param {string} plainText - Plain text version
 * @returns {array} Link ranges
 */
export function extractLinks(html, plainText) {
    if (!html || typeof html !== 'string') return [];

    const links = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const anchors = doc.querySelectorAll('a');

    let currentIndex = 0;

    anchors.forEach(anchor => {
        const text = anchor.textContent;
        const url = anchor.getAttribute('href');
        const start = plainText.indexOf(text, currentIndex);

        if (start !== -1 && url) {
            links.push({
                start: start,
                end: start + text.length,
                url: url
            });
            currentIndex = start + text.length;
        }
    });

    return links;
}

/**
 * Normalize block content - main function
 * @param {object} block - Block object
 * @returns {object} Normalized block
 */
export function normalizeBlockContent(block) {
    if (!block || !block.settings) return block;

    const { content } = block.settings;

    // If content is already plain text (no HTML), return as is
    if (!content || !hasHtmlTags(content)) {
        return block;
    }

    // Convert <br> to newlines first
    const withNewlines = convertBrToNewlines(content);

    // Extract plain text
    const plainText = stripHtmlTags(withNewlines);

    // Extract structured data
    const emphasis = extractEmphasis(content, plainText);
    const links = extractLinks(content, plainText);

    // Create normalized block
    const normalized = {
        ...block,
        settings: {
            ...block.settings,
            content: plainText,
            // Only add emphasis if there are ranges
            ...(emphasis.ranges.length > 0 && { emphasis }),
            // Only add links if there are any
            ...(links.length > 0 && { links })
        }
    };

    return normalized;
}

/**
 * Check if string contains HTML tags
 * @param {string} str - String to check
 * @returns {boolean} True if contains HTML
 */
export function hasHtmlTags(str) {
    if (!str || typeof str !== 'string') return false;
    return /<[^>]*>/g.test(str);
}

/**
 * Normalize all blocks in an array
 * @param {array} blocks - Array of blocks
 * @returns {array} Normalized blocks
 */
export function normalizeAllBlocks(blocks) {
    if (!Array.isArray(blocks)) return blocks;

    return blocks.map(block => {
        // Handle columns block with nested blocks
        if (block.type === 'columns' && block.settings?.columns) {
            return {
                ...block,
                settings: {
                    ...block.settings,
                    columns: block.settings.columns.map(col => ({
                        ...col,
                        blocks: normalizeAllBlocks(col.blocks || [])
                    }))
                }
            };
        }

        return normalizeBlockContent(block);
    });
}

export default {
    stripHtmlTags,
    convertBrToNewlines,
    extractEmphasis,
    extractLinks,
    normalizeBlockContent,
    normalizeAllBlocks,
    hasHtmlTags
};
