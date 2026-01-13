// Utility to convert template blocks to HTML
export const blocksToHTML = (blocks) => {
    if (!blocks || blocks.length === 0) return '';

    const renderBlock = (block) => {
        const { type, settings } = block;

        // Helper to convert settings to inline styles
        const getStyles = (settings) => {
            const styleMap = {
                fontSize: 'font-size',
                fontWeight: 'font-weight',
                color: 'color',
                textAlign: 'text-align',
                padding: 'padding',
                margin: 'margin',
                backgroundColor: 'background-color',
                borderRadius: 'border-radius',
                lineHeight: 'line-height',
                width: 'width',
                height: 'height',
                display: 'display'
            };

            return Object.entries(settings)
                .filter(([key]) => styleMap[key])
                .map(([key, value]) => `${styleMap[key]}: ${value}`)
                .join('; ');
        };

        switch (type) {
            case 'title':
                return `<h1 style="${getStyles(settings)}">${settings.content || ''}</h1>`;

            case 'text':
                return `<p style="${getStyles(settings)}">${settings.content || ''}</p>`;

            case 'button':
                const btnStyles = `
                    ${getStyles(settings)};
                    text-decoration: none;
                    display: inline-block;
                `;
                return `
                    <div style="text-align: ${settings.textAlign || settings.align || 'center'}; padding: ${settings.padding || '20px 0'}">
                        <a href="${settings.url || '#'}" style="${btnStyles}">
                            ${settings.content || settings.text || 'Button'}
                        </a>
                    </div>
                `;

            case 'image':
                return `
                    <div style="padding: ${settings.padding || '0'}; text-align: ${settings.textAlign || 'center'}">
                        <img src="${settings.url || ''}" 
                             alt="${settings.alt || ''}" 
                             style="width: ${settings.width || 'auto'}; border-radius: ${settings.borderRadius || '0'}; max-width: 100%;" />
                    </div>
                `;

            case 'logo':
                return `
                    <div style="text-align: ${settings.align || 'center'}; padding: ${settings.padding || '20px'}">
                        <img src="${settings.url || ''}" 
                             alt="Logo" 
                             style="width: ${settings.width || '150px'};" />
                    </div>
                `;

            case 'divider':
                return `
                    <div style="padding: ${settings.padding || '20px 0'}">
                        <hr style="border: none; border-top: ${settings.height || '1px'} solid ${settings.color || '#e2e8f0'}; width: ${settings.width || '100%'}; margin: 0;" />
                    </div>
                `;

            case 'spacer':
                return `<div style="height: ${settings.height || '20px'}"></div>`;

            case 'social':
                const icons = (settings.networks || []).map(network =>
                    `<a href="${network.url || '#'}" style="margin: 0 ${settings.iconSpacing || '10px'}; display: inline-block;">
                        <span style="font-size: ${settings.iconSize || '24px'};">🔗</span>
                    </a>`
                ).join('');
                return `<div style="text-align: ${settings.align || 'center'}; padding: ${settings.padding || '20px'}">${icons}</div>`;

            case 'columns':
                const columnBlocks = (settings.columns || []).map(col => {
                    const colWidth = settings.layout?.[settings.columns.indexOf(col)] || (100 / settings.columnCount);
                    const colHTML = (col.blocks || []).map(renderBlock).join('');
                    return `<td style="width: ${colWidth}%; vertical-align: top; padding: 10px;">${colHTML}</td>`;
                }).join('');
                return `
                    <table style="width: 100%; padding: ${settings.padding || '0'}">
                        <tr>${columnBlocks}</tr>
                    </table>
                `;

            case 'navigation':
                const links = (settings.links || []).map(link =>
                    `<a href="${link.url || '#'}" style="color: ${settings.color || '#000'}; font-size: ${settings.fontSize || '14px'}; text-decoration: none; margin: 0 10px;">${link.label}</a>`
                ).join('');
                return `<div style="text-align: ${settings.align || 'center'}; padding: ${settings.padding || '20px'}">${links}</div>`;

            default:
                return '';
        }
    };

    const bodyHTML = blocks.map(renderBlock).join('\n');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7fafc;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td>
                            ${bodyHTML}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
};
