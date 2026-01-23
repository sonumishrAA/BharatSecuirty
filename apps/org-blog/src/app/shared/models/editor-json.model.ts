/**
 * Editor JSON Model - Canvas Editor Data Structure
 * Single source of truth for the hybrid canvas document
 */

// ===== Canvas Meta =====
export interface CanvasMeta {
    canvasWidth: number;  // Default: 760
    canvasPadding: number; // Default: 24
    version: number;  // Schema version, currently 1
}

// ===== Flow Layer (Text Content) =====
// Re-uses TipTap/ngx-editor JSON format
export interface FlowDocument {
    type: 'doc';
    content: FlowNode[];
}

export interface FlowNode {
    type: string;  // 'paragraph' | 'heading' | 'bullet_list' | etc.
    attrs?: Record<string, any>;
    content?: FlowNode[];
    text?: string;
    marks?: FlowMark[];
}

export interface FlowMark {
    type: string;  // 'strong' | 'em' | 'underline' | 'link' | etc.
    attrs?: Record<string, any>;
}

// ===== Floating Layer (Images) =====
export interface FloatingItem {
    id: string;
    type: 'image';
    src: string;
    alt?: string;
    x: number;  // Position from canvas inner left (after padding)
    y: number;  // Position from canvas inner top (after padding)
    width: number;
    height: number;
    zIndex: number;
    rotation?: number;  // Degrees, optional
    caption?: string;
}

// ===== Main Editor JSON Structure =====
export interface EditorJSON {
    meta: CanvasMeta;
    flow: FlowDocument;
    floating: FloatingItem[];
}

// ===== Factory Functions =====
export function createEmptyEditorJSON(): EditorJSON {
    return {
        meta: {
            canvasWidth: 760,
            canvasPadding: 24,
            version: 1
        },
        flow: {
            type: 'doc',
            content: []
        },
        floating: []
    };
}

export function createFloatingImage(
    src: string,
    width: number,
    height: number,
    x: number = 0,
    y: number = 0
): FloatingItem {
    return {
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'image',
        src,
        x,
        y,
        width,
        height,
        zIndex: 10,
        rotation: 0
    };
}

// ===== Constants =====
export const CANVAS_WIDTH = 1216;
export const CANVAS_PADDING = 0;
export const CANVAS_INNER_WIDTH = CANVAS_WIDTH - (CANVAS_PADDING * 2); // 1216px
export const MIN_IMAGE_WIDTH = 80;
export const MAX_IMAGE_WIDTH = CANVAS_INNER_WIDTH;
export const GRID_SNAP_SIZE = 1;
