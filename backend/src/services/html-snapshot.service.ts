/**
 * HTML Snapshot Service
 * Generates sanitized HTML from EditorJSON for public view
 */

import type { EditorJSON, FloatingItem, FlowDocument } from '../models/Post.js';

// Allowed HTML tags for sanitization
const ALLOWED_TAGS = new Set([
    'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
    'img', 'figure', 'figcaption', 'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr', 'br', 'span'
]);

// Allowed style properties for floating items
const ALLOWED_STYLE_PROPS = new Set([
    'left', 'top', 'width', 'height', 'z-index', 'position',
    'color', 'background-color', 'font-weight', 'font-style', 'text-decoration'
]);

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

/**
 * Sanitize URL (only allow http/https and data URLs)
 */
function sanitizeUrl(url: string): string {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
        return trimmed;
    }
    return '';
}

/**
 * Render flow layer (text content) from TipTap-like JSON
 */
function renderFlowLayer(flow: FlowDocument): string {
    if (!flow || !flow.content) return '';

    const renderNode = (node: any): string => {
        if (!node) return '';

        const type = node.type;

        if (type === 'doc') {
            return (node.content || []).map(renderNode).join('');
        }

        if (type === 'text') {
            return renderText(node);
        }

        if (type === 'paragraph') {
            const content = (node.content || []).map(renderNode).join('');
            return `<p>${content || '<br>'}</p>`;
        }

        if (type === 'heading') {
            const level = Math.min(6, Math.max(1, node.attrs?.level || 2));
            const content = (node.content || []).map(renderNode).join('');
            return `<h${level}>${content}</h${level}>`;
        }

        if (type === 'bulletList' || type === 'bullet_list') {
            const items = (node.content || []).map(renderNode).join('');
            return `<ul>${items}</ul>`;
        }

        if (type === 'orderedList' || type === 'ordered_list') {
            const items = (node.content || []).map(renderNode).join('');
            return `<ol>${items}</ol>`;
        }

        if (type === 'listItem' || type === 'list_item') {
            const content = (node.content || []).map(renderNode).join('');
            return `<li>${content}</li>`;
        }

        if (type === 'blockquote') {
            const content = (node.content || []).map(renderNode).join('');
            return `<blockquote>${content}</blockquote>`;
        }

        if (type === 'codeBlock' || type === 'code_block') {
            const content = (node.content || []).map((n: any) => escapeHtml(n.text || '')).join('');
            return `<pre><code>${content}</code></pre>`;
        }

        if (type === 'horizontalRule' || type === 'horizontal_rule') {
            return '<hr>';
        }

        if (type === 'hardBreak' || type === 'hard_break') {
            return '<br>';
        }

        // Legacy inline images in flow (not floating)
        if (type === 'image') {
            const src = sanitizeUrl(node.attrs?.src || '');
            const alt = escapeHtml(node.attrs?.alt || '');
            if (src) {
                return `<figure class="post-image"><img src="${src}" alt="${alt}" loading="lazy"></figure>`;
            }
        }

        return '';
    };

    const renderText = (node: any): string => {
        if (node.type !== 'text') return '';

        let text = escapeHtml(node.text || '');
        const styles: string[] = [];

        (node.marks || []).forEach((mark: any) => {
            if (mark.type === 'bold' || mark.type === 'strong') {
                text = `<strong>${text}</strong>`;
            }
            if (mark.type === 'italic' || mark.type === 'em') {
                text = `<em>${text}</em>`;
            }
            if (mark.type === 'underline') {
                text = `<u>${text}</u>`;
            }
            if (mark.type === 'strike') {
                text = `<s>${text}</s>`;
            }
            if (mark.type === 'code') {
                text = `<code>${text}</code>`;
            }
            if (mark.type === 'link') {
                const href = sanitizeUrl(mark.attrs?.href || '');
                if (href) {
                    text = `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
                }
            }
            if (mark.type === 'text_color' || mark.type === 'textColor') {
                const color = mark.attrs?.color;
                if (color && /^#[0-9a-fA-F]{3,6}$/.test(color)) {
                    styles.push(`color: ${color}`);
                }
            }
            if (mark.type === 'background_color' || mark.type === 'backgroundColor') {
                const color = mark.attrs?.color;
                if (color && /^#[0-9a-fA-F]{3,6}$/.test(color)) {
                    styles.push(`background-color: ${color}`);
                }
            }
        });

        if (styles.length > 0) {
            text = `<span style="${styles.join('; ')}">${text}</span>`;
        }

        return text;
    };

    return renderNode(flow);
}

/**
 * Render floating layer (images positioned absolutely)
 */
function renderFloatingLayer(floating: FloatingItem[]): string {
    if (!floating || floating.length === 0) return '';

    const items = floating.map(item => {
        if (item.type !== 'image') return '';

        const src = sanitizeUrl(item.src);
        if (!src) return '';

        const alt = escapeHtml(item.alt || '');
        const caption = item.caption ? `<div class="caption">${escapeHtml(item.caption)}</div>` : '';

        // Safe numeric values only
        const x = Number.isFinite(item.x) ? item.x : 0;
        const y = Number.isFinite(item.y) ? item.y : 0;
        const width = Number.isFinite(item.width) ? item.width : 200;
        const height = Number.isFinite(item.height) ? item.height : 150;
        const zIndex = Number.isFinite(item.zIndex) ? item.zIndex : 10;

        return `
      <div class="float-item image" style="position: absolute; left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px; z-index: ${zIndex};" data-id="${escapeHtml(item.id)}">
        <img src="${src}" alt="${alt}" width="${width}" height="${height}" loading="lazy">
        ${caption}
      </div>`;
    });

    return items.join('\n');
}

/**
 * Generate HTML snapshot from EditorJSON (flow content only)
 * NOTE: This returns ONLY the flow content HTML without wrapper divs.
 *       The Angular template provides .blog-canvas and .flow-layer wrappers.
 *       Floating images are also handled by the Angular template to prevent duplication.
 */
export function generateHtmlSnapshot(editorJson: EditorJSON): string {
    if (!editorJson) return '';

    // Return just the flow content HTML - no wrapper divs
    // The Angular template handles the canvas structure and floating layer
    return renderFlowLayer(editorJson.flow);
}

/**
 * Migrate legacy TipTap content to EditorJSON format
 */
export function migrateToEditorJSON(content: Record<string, any>): EditorJSON {
    return {
        meta: {
            canvasWidth: 760,
            canvasPadding: 24,
            version: 1
        },
        flow: content as any,
        floating: []
    };
}

export const htmlSnapshotService = {
    generateHtmlSnapshot,
    migrateToEditorJSON
};
