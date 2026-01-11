// Canvas utility functions

type StorageLike = {
    type?: string;
    x_units: number;
    y_units: number;
    ratio?: number;
    parent?: StorageLike | null;
};

/**
 * Calculate optimal canvas dimensions based on storage aspect ratio.
 * 
 * @param storage - The storage object
 * @param maxWidth - Maximum canvas width
 * @param maxHeight - Maximum canvas height
 * @returns Object with width and height properties
 */
export function calculateCanvasDimensions(
    storage: StorageLike | null,
    maxWidth: number,
    maxHeight: number
): { width: number; height: number } {
    if (!storage) {
        return { width: maxWidth, height: maxHeight };
    }

    // For drawers and slots, use the parent container dimensions
    let stg = storage;
    if (storage.type === 'drawer' || storage.type === 'slot') {
        if (storage.parent && typeof storage.parent === 'object') {
            stg = storage.parent;
        } else {
            // Fallback to storage itself if no parent or parent is just an ID string
            return { width: maxWidth, height: maxHeight };
        }
    }

    const storageWidth = stg.x_units;
    const storageHeight = stg.y_units;

    // Apply ratio for organizers and cabinets
    const ratio = (stg.type === 'organizer' || stg.type === 'cabinet') ? (stg.ratio || 1.0) : 1.0;

    // Calculate aspect ratio with ratio applied to width
    const aspectRatio = (storageWidth * ratio) / storageHeight;

    // Determine which dimension is limiting
    if (aspectRatio >= maxWidth / maxHeight) {
        // Width is limiting
        return {
            width: maxWidth,
            height: Math.floor(maxWidth / aspectRatio)
        };
    } else {
        // Height is limiting
        return {
            width: Math.floor(maxHeight * aspectRatio),
            height: maxHeight
        };
    }
}
