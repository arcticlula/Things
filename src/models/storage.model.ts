import { DocumentData, DocumentReference } from "firebase/firestore"
import { IThing } from "./thing.model";

export type ITypeContainer = 'cabinet' | 'box' | 'organizer';
export type ITypeStorage = 'box' | 'drawer' | 'slot';
export type IType = 'box' | 'cabinet' | 'drawer' | 'organizer' | 'slot';
export type IBoxMaterial = 'plastic' | 'cardboard';
export type ICabinetMaterial = 'plastic' | 'wood' | 'metal';
export type IOrganizerMaterial = 'plastic';
export type IMaterial = IBoxMaterial & ICabinetMaterial;
export type ITypeMaterial = 'cabinet-plastic' | 'cabinet-wood' | 'cabinet-metal' | 'box-plastic' | 'box-cardboard' | 'organizer-plastic';

// Forms
export interface ICreateStorageForm {
    name: string;
    description: string;
    typeMaterial: string;
    x_units: number;
    y_units: number;
    ratio: number;
    parent: string;
    depth: number;
    boxLid: boolean;
    color: string;
    autoIncrement: boolean;
    division: {
        name: string;
        x_units: number;
        y_units: number;
    }
}

export interface IUpdateBoxForm {
    name: string;
    description: string;
    material: IBoxMaterial;
    x_units: number;
    y_units: number;
    parent: string;
    depth: number;
    boxLid: boolean;
    color: string;
}

export interface IUpdateCabinetForm {
    name: string
    description: string
    material: ICabinetMaterial
    ratio: number,
    drawers: IUpdateDrawer[]
}

export interface IUpdateOrganizerForm {
    name: string
    description: string
    material: IOrganizerMaterial,
    ratio: number,
    slots: IUpdateSlot[]
    parent: string
}

// Storage Interfaces
interface ILocalStorage extends IDBStorage {
    id: string;
}

interface IDBStorage {
    name: string,
    name_lower: string,
    name_number: string,
    description: string,
    type: IType;
    x_units: number;
    y_units: number;
}

export interface IBox extends ILocalStorage {
    depth: number;
    lid: boolean;
    material: IBoxMaterial,
    color?: string,
    parent?: IBox | ICabinet | null,
    things?: IThing[],
    storages?: IBox[] | null,
}

export interface ICabinet extends ILocalStorage {
    material: ICabinetMaterial,
    ratio: number,
    drawers: IDrawer[]
}

export interface IOrganizer extends ILocalStorage {
    material: IOrganizerMaterial,
    ratio: number,
    slots: ISlot[]
    parent?: IBox | ICabinet | null,
}

export interface IDrawer extends ILocalStorage {
    x_pos: number;
    y_pos: number;
    parent: ICabinet,
    things?: IThing[],
    storages?: IBox[] | IOrganizer[] | null
}

export interface ISlot extends ILocalStorage {
    x_pos: number;
    y_pos: number;
    parent: IOrganizer,
    things?: IThing[]
}

export type IContainer = IBox & ICabinet & IOrganizer;
export type IStorageThings = IBox & IDrawer & ISlot;
export type IStorage = IBox & ICabinet & IOrganizer & IDrawer & ISlot;


// Create Local Storage

interface ICreateStorage {
    name: string,
    type: IType,
    description: string,
    x_units: number,
    y_units: number
}

export interface ICreateBox extends ICreateStorage {
    material: IBoxMaterial
    depth: number
    lid: boolean
    color: string
    parent?: string
}

export interface ICreateCabinet extends ICreateStorage {
    material: ICabinetMaterial,
    ratio: number,
    drawers: ICreateDrawer[]
}

export interface ICreateOrganizer extends ICreateStorage {
    material: IOrganizerMaterial,
    ratio: number,
    slots: ICreateSlot[]
    parent?: string
}

export interface ICreateDrawer extends ICreateStorage {
    x_pos: number
    y_pos: number
}

export interface ICreateSlot extends ICreateStorage {
    x_pos: number
    y_pos: number
}

export interface ICreateDivision extends ICreateDrawer { }

// Create DB Storage

interface IDBCreateStorage {
    name: string,
    name_lower: string,
    name_number: string,
    type: IType;
    x_units: number;
    y_units: number;
}

export interface IDBCreateBox extends IDBCreateStorage {
    description: string,
    material: IBoxMaterial,
    depth: number;
    lid: boolean;
    color?: string,
    parent?: DocumentReference<DocumentData, DocumentData> | null,
    things?: DocumentReference<DocumentData, DocumentData>[],
    storages?: DocumentReference<DocumentData, DocumentData>[]
}

export interface IDBCreateCabinet extends IDBCreateStorage {
    description: string,
    material: ICabinetMaterial,
    ratio: number,
    drawers?: DocumentReference<DocumentData, DocumentData>[]
}

export interface IDBCreateOrganizer extends IDBCreateStorage {
    description: string,
    material: IOrganizerMaterial,
    ratio: number,
    parent?: DocumentReference<DocumentData, DocumentData> | null,
    slots?: DocumentReference<DocumentData, DocumentData>[]
}

export interface IDBCreateDrawer extends IDBCreateStorage {
    x_pos: number;
    y_pos: number;
    parent: DocumentReference<DocumentData, DocumentData>,
}

export interface IDBCreateSlot extends IDBCreateStorage {
    x_pos: number;
    y_pos: number;
    parent: DocumentReference<DocumentData, DocumentData>,
}

// Update Local Storage

interface IUpdateStorage {
    id: string
    name: string
    description: string
}

export interface IUpdateBox extends IUpdateStorage {
    material: IBoxMaterial
    x_units: number
    y_units: number
    depth: number
    lid: boolean
    color: string
    parentId?: string
    oldParentId?: string
}

export interface IUpdateCabinet extends IUpdateStorage {
    material: ICabinetMaterial
    ratio: number,
    drawers: IUpdateDrawer[]
}

export interface IUpdateOrganizer extends IUpdateStorage {
    material: IOrganizerMaterial,
    ratio: number,
    parentId?: string,
    oldParentId?: string,
    slots: IUpdateSlot[]
}

export interface IUpdateDrawer extends IUpdateStorage { }
export interface IUpdateSlot extends IUpdateStorage { }

// Update DB Storage

export interface IDBUpdateStorage {
    [key: string]: any;
    name: string
    name_lower: string
    name_number: string
    description: string
}

export interface IDBUpdateBox extends IDBUpdateStorage {
    material: IBoxMaterial
    x_units: number
    y_units: number
    depth: number
    lid: boolean
    color?: string
    parent?: DocumentReference<DocumentData, DocumentData> | null,
}

export interface IDBUpdateCabinet extends IDBUpdateStorage {
    material: ICabinetMaterial
    ratio: number,
}

export interface IDBUpdateOrganizer extends IDBUpdateStorage {
    material: IOrganizerMaterial
    ratio: number,
    parent?: DocumentReference<DocumentData, DocumentData> | null,
}

export interface IDBUpdateDrawer extends IDBUpdateStorage { }
export interface IDBUpdateSlot extends IDBUpdateStorage { }

// Drawing Interfaces
export interface IDrawBox {
    material: IBoxMaterial
    x_units: number
    y_units: number
    depth: number
    lid: boolean
    color?: string
}

export interface IDrawCabinet {
    id?: string
    material: ICabinetMaterial
    ratio: number,
    x_units: number
    y_units: number
    drawers: IDrawDrawer[]
}

export interface IDrawOrganizer {
    id?: string,
    material: IOrganizerMaterial,
    ratio: number,
    x_units: number;
    y_units: number;
    slots: IDrawSlot[]
}

export interface IDrawDrawer {
    id?: string,
    name: string,
    x_units: number;
    y_units: number;
    x_pos: number;
    y_pos: number;
}

export interface IDrawSlot extends IDrawDrawer { }