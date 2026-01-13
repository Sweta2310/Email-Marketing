/**
 * HTML Exporter
 * Generates final HTML for email export from structured blocks
 */

/**
 * Apply emphasis to text
 * @param {string} content - Plain text content
 * @param {object} emphasis - Emphasis object with ranges
 * @returns {string} HTML with formatting
 */
function applyEmphasis(content, emphasis) {
    if (!emphasis || !emphasis.ranges || emphasis.ranges.length === 0) {
        return escapeHtml(content);
    }

    // Sort ranges by start position (descending) to apply from end to start
    const sortedRanges = [...emphasis.ranges].sort((a, b) => b.start - a.start);

    let result = content;

    sortedRanges.forEach(range => {
        const before = result.substring(0, range.start);
        const text = result.substring(range.start, range.end);
        const after = result.substring(range.end);

        let formatted = text;

        switch (range.style) {
            case 'bold':
                formatted = `<strong>${escapeHtml(text)}</strong>`;
                break;
            case 'italic':
                formatted = `<em>${escapeHtml(text)}</em>`;
                break;
            case 'highlight':
                formatted = `<span style="color: ${range.color};">${escapeHtml(text)}</span>`;
                break;
            default:
                formatted = escapeHtml(text);
        }

        result = before + formatted + after;
    });

    // Escape any remaining unformatted text
    return result;
}

/**
 * Apply links to text
 * @param {string} html - HTML with emphasis applied
 * @param {array} links - Links array
 * @param {string} originalContent - Original plain text
 * @returns {string} HTML with links
 */
function applyLinks(html, links, originalContent) {
    if (!links || links.length === 0) {
        return html;
    }

    // This is complex because we need to find the text positions in the HTML
    // For now, we'll use a simpler approach: replace text with links
    let result = html;

    // Sort links by start position (descending)
    const sortedLinks = [...links].sort((a, b) => b.start - a.start);

    sortedLinks.forEach(link => {
        const linkText = originalContent.substring(link.start, link.end);
        const escapedText = escapeHtml(linkText);

        // Find and replace the text with a link
        // This is a simplified approach - in production, you'd want more robust matching
        const linkHtml = `<a href="${escapeHtml(link.url)}" style="color: #007bff; text-decoration: underline;">${escapedText}</a>`;
        result = result.replace(escapedText, linkHtml);
    });

    return result;
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    if (!text) return '';

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Convert newlines to <br> tags
 * @param {string} text - Text with newlines
 * @returns {string} HTML with <br> tags
 */
function newlinesToBr(text) {
    if (!text) return '';
    return text.replace(/\n/g, '<br/>');
}

/**
 * Render text block to HTML
 * @param {object} block - Text block
 * @returns {string} HTML
 */
function renderTextBlock(block) {
    const { content, emphasis, links, fontSize, color, textAlign, padding, lineHeight } = block.settings;

    // Apply emphasis
    let html = applyEmphasis(content || '', emphasis);

    // Apply links
    html = applyLinks(html, links, content || '');

    // Convert newlines to <br>
    html = newlinesToBr(html);

    // Build style
    const style = [
        fontSize && `font-size: ${fontSize}`,
        color && `color: ${color}`,
        textAlign && `text-align: ${textAlign}`,
        padding && `padding: ${padding}`,
        lineHeight && `line-height: ${lineHeight}`,
        'margin: 0'
    ].filter(Boolean).join('; ');

    return `<p style="${style}">${html}</p>`;
}

/**
 * Render title block to HTML
 * @param {object} block - Title block
 * @returns {string} HTML
 */
function renderTitleBlock(block) {
    const { content, fontSize, fontWeight, color, textAlign, padding } = block.settings;

    const style = [
        fontSize && `font-size: ${fontSize}`,
        fontWeight && `font-weight: ${fontWeight}`,
        color && `color: ${color}`,
        textAlign && `text-align: ${textAlign}`,
        padding && `padding: ${padding}`,
        'margin: 0'
    ].filter(Boolean).join('; ');

    return `<h2 style="${style}">${escapeHtml(content || '')}</h2>`;
}

/**
 * Render button block to HTML
 * @param {object} block - Button block
 * @returns {string} HTML
 */
function renderButtonBlock(block) {
    const { text, url, backgroundColor, textColor, fontSize, padding, borderRadius, align } = block.settings;

    const buttonStyle = [
        backgroundColor && `background-color: ${backgroundColor}`,
        textColor && `color: ${textColor}`,
        fontSize && `font-size: ${fontSize}`,
        padding && `padding: ${padding}`,
        borderRadius && `border-radius: ${borderRadius}`,
        'text-decoration: none',
        'display: inline-block',
        'font-weight: bold',
        'border: none',
        'cursor: pointer'
    ].filter(Boolean).join('; ');

    const containerStyle = align ? `text-align: ${align}` : '';

    return `
        <div style="${containerStyle}">
            <a href="${escapeHtml(url || '#')}" style="${buttonStyle}">
                ${escapeHtml(text || 'Button')}
            </a>
        </div>
    `;
}

/**
 * Render image block to HTML
 * @param {object} block - Image block
 * @returns {string} HTML
 */
function renderImageBlock(block) {
    const { url, alt, width, borderRadius, padding } = block.settings;

    const imgStyle = [
        width && `width: ${width}`,
        borderRadius && `border-radius: ${borderRadius}`,
        'display: block',
        'max-width: 100%',
        'height: auto'
    ].filter(Boolean).join('; ');

    const containerStyle = padding ? `padding: ${padding}` : '';

    return `
        <div style="${containerStyle}">
            <img src="${escapeHtml(url || '')}" alt="${escapeHtml(alt || '')}" style="${imgStyle}" />
        </div>
    `;
}

/**
 * Render divider block to HTML
 * @param {object} block - Divider block
 * @returns {string} HTML
 */
function renderDividerBlock(block) {
    const { height, color, padding, width } = block.settings;

    const hrStyle = [
        height && `height: ${height}`,
        color && `background-color: ${color}`,
        width && `width: ${width}`,
        'border: none',
        'margin: 0'
    ].filter(Boolean).join('; ');

    const containerStyle = padding ? `padding: ${padding}` : '';

    return `
        <div style="${containerStyle}">
            <hr style="${hrStyle}" />
        </div>
    `;
}

/**
 * Render columns block to HTML
 * @param {object} block - Columns block
 * @returns {string} HTML
 */
function renderColumnsBlock(block) {
    const { columns, padding } = block.settings;

    if (!columns || columns.length === 0) return '';

    const columnHtml = columns.map(col => {
        const colBlocks = col.blocks || [];
        const colContent = colBlocks.map(b => renderBlockToHtml(b)).join('\n');

        return `
            <td style="vertical-align: top; padding: 10px;">
                ${colContent}
            </td>
        `;
    }).join('');

    const containerStyle = padding ? `padding: ${padding}` : '';

    return `
        <div style="${containerStyle}">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    ${columnHtml}
                </tr>
            </table>
        </div>
    `;
}

/**
 * Render social block to HTML
 */
function renderSocialBlock(block) {
    const { networks, align, iconSize, iconStyle, iconTheme, iconSpacing, padding, margin } = block.settings;

    // Helper for icons (simplified for export - ideally we'd use images or more robust SVGs)
    // For email compatibility, images are safer, but here we'll use simple text/shapes or SVGs if possible.
    // Since we can't easily inline complex SVGs reliably in all email clients without cid: attachments,
    // we might want to use a reliable CDN for social icons or fallback to text.
    // For now, let's try to map the SVG paths from BlockRenderer if possible, or simple links.

    // Use clearbit logo API or similar for social icons if images are preferred, 
    // but here we will try to replicate the SVG logic or simple placeholder.
    // Actually, inline SVGs have poor support in some email clients (Gmail). 
    // Best practice is to use images. For this generator, I will use text links with background colors as a fallback 
    // that looks decent, or just the SVGs as they are in BlockRenderer (hoping for best support).

    // Reusing the SVG paths from BlockRenderer:
    const getSocialIconPath = (name) => {
        const paths = {
            'facebook': "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
            'instagram': "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
            'linkedin': "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
            'youtube': "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
            'twitter': "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        };
        return paths[name] || "";
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

    if (!networks || networks.length === 0) return '';

    const iconsHtml = networks.map(net => `
        <a href="${escapeHtml(net.url)}" style="display: inline-block; margin: 0 ${iconSpacing || '5px'}; text-decoration: none;">
             <div style="width: ${iconSize || '32px'}; height: ${iconSize || '32px'}; background-color: ${iconTheme === 'monochrome' ? '#64748b' : getSocialIconColor(net.name)}; border-radius: ${iconStyle === 'square' ? '8px' : '50%'}; display: flex; align-items: center; justify-content: center;">
                <svg viewBox="0 0 24 24" fill="white" width="16" height="16" style="margin: auto; display: block;">
                    <path d="${getSocialIconPath(net.name)}" />
                </svg>
             </div>
        </a>
    `).join('');

    return `
        <div style="text-align: ${align || 'center'}; ${padding ? `padding: ${padding};` : ''} ${margin ? `margin: ${margin};` : ''}">
            ${iconsHtml}
        </div>
    `;
}

function renderLogoBlock(block) {
    const { url, width, alignment, padding, margin } = block.settings;
    return `
        <div style="text-align: ${alignment || 'center'}; ${padding ? `padding: ${padding};` : ''} ${margin ? `margin: ${margin};` : ''}">
             <img src="${escapeHtml(url)}" alt="Logo" style="width: ${width || 'auto'}; max-width: 100%; border: 0;" />
        </div>
    `;
}

function renderVideoBlock(block) {
    const { url, thumbnail, alt, borderRadius, borderWidth, borderColor, padding, margin, width } = block.settings;
    // Email clients usually don't support video tags. We show a thumbnail with a play button link.
    // If thumbnail isn't provided, specific handling might be needed, but assuming thumbnail exists:

    return `
        <div style="text-align: center; ${padding ? `padding: ${padding};` : ''} ${margin ? `margin: ${margin};` : ''}">
            <a href="${escapeHtml(url)}" target="_blank" style="display: block; position: relative; text-decoration: none;">
                 <img src="${escapeHtml(thumbnail || '')}" alt="${escapeHtml(alt || 'Video')}" style="width: ${width || '100%'}; max-width: 100%; display: block; border-radius: ${borderRadius || 0}px; border: ${borderWidth ? `${borderWidth}px solid ${borderColor}` : 'none'};" />
                 <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.6); color: white; padding: 10px 20px; border-radius: 30px; font-weight: bold; font-family: sans-serif;">
                    Play Video
                 </div>
            </a>
        </div>
    `;
}

function renderProductBlock(block) {
    const { image, title, price, url, buttonText, alignment, padding, margin } = block.settings;
    return `
        <div style="text-align: ${alignment || 'center'}; ${padding ? `padding: ${padding};` : ''} ${margin ? `margin: ${margin};` : ''}">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" style="width: 100%; max-width: 200px; border-radius: 8px; display: inline-block;" />
            <h3 style="margin: 10px 0 5px; font-size: 18px; font-family: sans-serif;">${escapeHtml(title)}</h3>
            <p style="margin: 0 0 10px; font-weight: bold; color: #111; font-family: sans-serif;">${escapeHtml(price)}</p>
            <a href="${escapeHtml(url)}" style="display: inline-block; padding: 8px 16px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px; font-size: 14px; font-family: sans-serif;">
                ${escapeHtml(buttonText || 'Buy Now')}
            </a>
        </div>
    `;
}

function renderNavigationBlock(block) {
    const { links, alignment, color, fontSize, padding, margin } = block.settings;
    if (!links || links.length === 0) return '';

    const linksHtml = links.map(link => `
        <a href="${escapeHtml(link.url)}" style="margin: 0 10px; color: ${color || '#000'}; font-size: ${fontSize || '14px'}; text-decoration: none; font-family: sans-serif;">
            ${escapeHtml(link.label)}
        </a>
    `).join('');

    return `
        <div style="text-align: ${alignment || 'center'}; ${padding ? `padding: ${padding};` : ''} ${margin ? `margin: ${margin};` : ''}">
            ${linksHtml}
        </div>
    `;
}

function renderPaymentBlock(block) {
    const { label, url, backgroundColor, color, borderRadius, fontSize, alignment, padding, margin } = block.settings;
    return `
        <div style="text-align: ${alignment || 'center'}; ${padding ? `padding: ${padding};` : ''} ${margin ? `margin: ${margin};` : ''}">
            <a href="${escapeHtml(url)}" style="display: inline-block; padding: 12px 24px; background-color: ${backgroundColor || '#22c55e'}; color: ${color || '#fff'}; border-radius: ${borderRadius || 0}px; font-size: ${fontSize || '16px'}; text-decoration: none; font-weight: 600; font-family: sans-serif;">
                ${escapeHtml(label || 'Pay Now')}
            </a>
        </div>
    `;
}
export function renderBlockToHtml(block) {
    if (!block || !block.type) return '';

    switch (block.type) {
        case 'text':
            return renderTextBlock(block);
        case 'title':
            return renderTitleBlock(block);
        case 'button':
            return renderButtonBlock(block);
        case 'image':
            return renderImageBlock(block);
        case 'divider':
            return renderDividerBlock(block);
        case 'columns':
            return renderColumnsBlock(block);
        case 'spacer':
            return `<div style="height: ${block.settings.height || '20px'};"></div>`;
        case 'social':
            return renderSocialBlock(block);
        case 'logo':
            return renderLogoBlock(block);
        case 'video':
            return renderVideoBlock(block);
        case 'product':
            return renderProductBlock(block);
        case 'navigation':
            return renderNavigationBlock(block);
        case 'payment':
            return renderPaymentBlock(block);
        default:
            console.warn(`Unknown block type: ${block.type}`);
            return '';
    }
}

/**
 * Export blocks to HTML
 * @param {array} blocks - Array of blocks
 * @returns {string} Complete HTML
 */
export function exportToHtml(blocks) {
    if (!Array.isArray(blocks)) return '';

    const bodyContent = blocks.map(block => renderBlockToHtml(block)).join('\n');

    return bodyContent;
}

/**
 * Generate complete email HTML with wrapper
 * @param {object} campaign - Campaign object
 * @returns {string} Complete email HTML
 */
export function generateEmailHtml(campaign) {
    if (!campaign || !campaign.blocks) return '';

    const bodyContent = exportToHtml(campaign.blocks);

    // Email HTML template with proper structure
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${escapeHtml(campaign.content?.subject || 'Email')}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
    </style>
</head>
<body>
    <div class="email-container">
        ${bodyContent}
    </div>
</body>
</html>
    `.trim();
}

export default {
    renderBlockToHtml,
    exportToHtml,
    generateEmailHtml
};
