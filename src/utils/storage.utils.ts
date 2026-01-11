import { IStorage, IDrawCabinet, IDrawDrawer, IDrawOrganizer } from '../models/storage.model';

/**
 * Hydrates a cabinet with its drawers from the storages list.
 * 
 * @param storage - The storage item (can be a cabinet or drawer)
 * @param storagesAll - The complete list of all storages
 * @returns A hydrated IDrawCabinet with all drawers populated, or null if not applicable
 */
export function hydrateCabinet(storage: IStorage | null | undefined, storagesAll: IStorage[]): IDrawCabinet | null {
    if (!storage) return null;

    let cabinet: IStorage | undefined;

    if (storage.type === 'drawer') {
        // If it's a drawer, find its parent cabinet
        const parentId = typeof storage.parent === 'object' && storage.parent
            ? storage.parent.id
            : (storage.parent as unknown as string);

        if (parentId) {
            cabinet = storagesAll.find(st => st.id === parentId);
        }
    } else if (storage.type === 'cabinet') {
        cabinet = storage;
    }

    if (!cabinet || cabinet.type !== 'cabinet') return null;

    // Hydrate drawers for rendering
    const drawers = storagesAll.filter(st => {
        if (st.type !== 'drawer') return false;
        const pId = typeof st.parent === 'object' && st.parent
            ? st.parent.id
            : (st.parent as unknown as string);
        return pId === cabinet?.id;
    }) as unknown as IDrawDrawer[];

    return {
        ...cabinet,
        drawers: drawers
    } as unknown as IDrawCabinet;
}

/**
 * Gets the selected drawer ID from a storage item.
 * 
 * @param storage - The storage item
 * @returns The drawer ID if storage is a drawer, null otherwise
 */
export function getSelectedDrawerId(storage: IStorage | null | undefined): string | null {
    if (storage?.type === 'drawer') return storage.id;
    return null;
}

/**
 * Hydrates an organizer with its slots from the storages list.
 * 
 * @param storage - The storage item (can be an organizer or slot)
 * @param storagesAll - The complete list of all storages
 * @returns A hydrated organizer with all slots populated, or null if not applicable
 */
export function hydrateOrganizer(storage: IStorage | null | undefined, storagesAll: IStorage[]): IDrawOrganizer | null {
    if (!storage) return null;

    let organizer: IStorage | undefined;

    if (storage.type === 'slot') {
        // If it's a slot, find its parent organizer
        const parentId = typeof storage.parent === 'object' && storage.parent
            ? storage.parent.id
            : (storage.parent as unknown as string);

        if (parentId) {
            organizer = storagesAll.find(st => st.id === parentId);
        }
    } else if (storage.type === 'organizer') {
        organizer = storage;
    }

    if (!organizer || organizer.type !== 'organizer') return null;

    // Hydrate slots for rendering
    const slots = storagesAll.filter(st => {
        if (st.type !== 'slot') return false;
        const pId = typeof st.parent === 'object' && st.parent
            ? st.parent.id
            : (st.parent as unknown as string);
        return pId === organizer?.id;
    });

    return {
        ...organizer,
        slots: slots
    };
}

/**
 * Gets the selected slot ID from a storage item.
 * 
 * @param storage - The storage item
 * @returns The slot ID if storage is a slot, null otherwise
 */
export function getSelectedSlotId(storage: IStorage | null | undefined): string | null {
    if (storage?.type === 'slot') return storage.id;
    return null;
}

/**
 * Validates if two storages are compatible for swapping
 * @param currentStorage The current storage (drawer)
 * @param targetStorage The target storage to swap with
 * @returns Object with isValid boolean and optional error message
 */
export function validateSwapCompatibility(
    currentStorage: IStorage | null | undefined,
    targetStorage: IStorage | null | undefined
): { isValid: boolean; error?: string } {
    if (!currentStorage || !targetStorage) {
        return { isValid: false, error: 'Both storages must be provided' };
    }

    // Both must be drawers
    if (currentStorage.type !== 'drawer' || targetStorage.type !== 'drawer') {
        return { isValid: false, error: 'Both storages must be drawers' };
    }

    // Check drawer dimensions match
    const drawerSizeMatches = currentStorage.x_units === targetStorage.x_units &&
        currentStorage.y_units === targetStorage.y_units;

    if (!drawerSizeMatches) {
        return {
            isValid: false,
            error: `Drawer sizes must match. Current: ${currentStorage.x_units}x${currentStorage.y_units}, Target: ${targetStorage.x_units}x${targetStorage.y_units}`
        };
    }

    // Check parent cabinet dimensions match
    const currentParent = currentStorage.parent;
    const targetParent = targetStorage.parent;

    if (currentParent && targetParent) {
        const cabinetSizeMatches = currentParent.x_units === targetParent.x_units &&
            currentParent.y_units === targetParent.y_units;

        if (!cabinetSizeMatches) {
            return {
                isValid: false,
                error: `Parent cabinet sizes must match. Current cabinet: ${currentParent.x_units}x${currentParent.y_units}, Target cabinet: ${targetParent.x_units}x${targetParent.y_units}`
            };
        }
    }

    return { isValid: true };
}