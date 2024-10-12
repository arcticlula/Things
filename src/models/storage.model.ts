import { DocumentData, DocumentReference } from "firebase/firestore"
import { IThing } from "./thing.model";

export type ITypeContainer = 'cabinet' | 'box';
export type ITypeStorage = 'drawer' | 'box';
export type IType = 'cabinet' | 'box' | 'drawer';
export type IBoxMaterial = 'plastic' | 'cardboard';
export type ICabinetMaterial = 'plastic' | 'wood' | 'metal';
export type IMaterial = IBoxMaterial & ICabinetMaterial;
export type ITypeMaterial = 'cabinet-plastic' | 'cabinet-wood' | 'cabinet-metal' | 'box-plastic' | 'box-cardboard';

// Forms
export interface ICreateStorageForm {
    name: string;
    description: string;
    typeMaterial: string;
    x_units: number; 
    y_units: number; 
    parent: string;
    depth: number; 
    boxLid: boolean;
    autoIncrement: boolean;
    drawer: {     
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
}

export interface IUpdateCabinetForm {
    name: string
    description: string
    material: ICabinetMaterial  
    drawers: IUpdateDrawer[]
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
    parent?: IBox | ICabinet | null,
    things?: IThing[],
    storages?: IBox[] | null,
}

export interface ICabinet extends ILocalStorage {
    material: ICabinetMaterial,
    drawers: IDrawer[]
}

export interface IDrawer extends ILocalStorage {
    x_pos: number; 
    y_pos: number;
    parent: ICabinet,
    things?: IThing[],
    storages?: IBox[] | null
}

export type IContainer = IBox & ICabinet;
export type IStorageThings = IBox & IDrawer;
export type IStorage = IBox & ICabinet & IDrawer;


// Create Local Storage

interface ICreateStorage  {
    name: string,
    type: IType,
    description: string,
    x_units: number,
    y_units: number 
}

export interface ICreateCabinet extends ICreateStorage {
    material: ICabinetMaterial,
    drawers: ICreateDrawer[]
}

export interface ICreateBox extends ICreateStorage {
    material: IBoxMaterial
    depth: number
    lid: boolean
    parent?: string
}

export interface ICreateDrawer extends ICreateStorage {
    x_pos: number
    y_pos: number
}

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
    parent?: DocumentReference<DocumentData, DocumentData> | null,
    things?: DocumentReference<DocumentData, DocumentData>[],
    storages?: DocumentReference<DocumentData, DocumentData>[]
}

export interface IDBCreateCabinet extends IDBCreateStorage {
    description: string,
    material: ICabinetMaterial,
    drawers?: DocumentReference<DocumentData, DocumentData>[]
}

export interface IDBCreateDrawer extends IDBCreateStorage {
    x_pos: number; 
    y_pos: number;
    parent: DocumentReference<DocumentData, DocumentData>,
}

// Update Local Storage

interface IUpdateStorage  {
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
    parentId?: string
    oldParentId?: string
}

export interface IUpdateCabinet extends IUpdateStorage {
    material: ICabinetMaterial
    drawers: IUpdateDrawer[]
}

export interface IUpdateDrawer extends IUpdateStorage {}

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
    parent?: DocumentReference<DocumentData, DocumentData> | null,
}

export interface IDBUpdateCabinet extends IDBUpdateStorage {
    material: ICabinetMaterial
}

export interface IDBUpdateDrawer extends IDBUpdateStorage {}

// Drawing Interfaces
export interface IDrawBox {
    material: IBoxMaterial
    x_units: number
    y_units: number 
    depth: number
    lid: boolean
}

export interface IDrawCabinet {
    id?: string
    material: ICabinetMaterial
    x_units: number
    y_units: number 
    drawers: IDrawDrawer[]
}

export interface IDrawDrawer {
    id?: string,
    name: string,
    x_units: number; 
    y_units: number; 
    x_pos: number; 
    y_pos: number;
}