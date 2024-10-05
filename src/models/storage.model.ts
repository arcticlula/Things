import { DocumentData, DocumentReference } from "firebase/firestore"
import { IThing } from "./thing.model";

export type ITypeStorage = 'cabinet' | 'box';
export type IType = ITypeStorage | 'drawer';
export type IMaterial = 'plastic' | 'wood' | 'metal' | 'cardboard';
export type ITypeMaterial = 'cabinet-plastic' | 'cabinet-wood' | 'cabinet-metal' | 'box-plastic' | 'box-cardboard';

export interface IStorageForm {
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

export interface IBoxUpdateForm {
    name: string;
    description: string;
    material: IMaterial;
    x_units: number; 
    y_units: number; 
    parent: string;
    depth: number; 
    boxLid: boolean;
}

export interface ICabinetUpdateForm {
    name: string
    description: string
    material: IMaterial  
    drawers: IDrawer[]
}

interface ILocal  {
    name: string,
    type: IType,
    description: string,
    material: IMaterial,
    x_units: number,
    y_units: number 
}

export interface ICreateCabinet extends ILocal {
    drawers: ILocalDrawer[]
}

export interface ILocalBox extends ILocal {
    parent?: string,
    depth: number;
    lid: boolean;
}

export interface ILocalDrawer {
    name: string,
    x_units: number,
    y_units: number 
    x_pos: number; 
    y_pos: number;
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

interface IStorage extends IDBStorage {
    id: string;
}

export interface IDBBox extends IDBStorage {
    depth: number; 
    lid: boolean;
    material: IMaterial,
    parent: DocumentReference<DocumentData, DocumentData> | null,
    things?: DocumentReference<DocumentData, DocumentData>[],
    storages?: DocumentReference<DocumentData, DocumentData>[]
}

export interface IDBCabinet extends IDBStorage {
    material: IMaterial,
    drawers?: DocumentReference<DocumentData, DocumentData>[]
}

export interface IDBDrawer extends IDBStorage {
    x_pos: number; 
    y_pos: number;
    parent?: DocumentReference<DocumentData, DocumentData> | null,
    things?: DocumentReference<DocumentData, DocumentData>[],
    storages?: DocumentReference<DocumentData, DocumentData>[],
}

export interface IBox extends IStorage {
    depth: number; 
    lid: boolean;
    material: IMaterial,
    parent?: IBox | ICabinet | null,
    things?: IThing[],
    storages?: IBox | null,
}

export interface ICabinet extends IStorage {
    material: IMaterial,
    drawers: IDrawer[]
}

export interface IDrawer extends IStorage {
    x_pos: number; 
    y_pos: number;
    parent: ICabinet,
    things?: IThing[],
    storages?: IBox | null
}

export interface IUpdateBox {
    id: string
    name: string
    description: string
    material: IMaterial
    x_units: number
    y_units: number 
    depth: number
    lid: boolean
    parentId?: string
    oldParentId?: string
}

export interface IUpdateCabinet {
    id: string
    name: string
    description: string
    material: IMaterial
    drawers: IDrawer[]
}

export interface IUpdateDrawer {
    id: string
    name: string
    description: string
}

export interface IDBUpdateBox {
    [key: string]: any;
    name: string
    name_lower: string
    name_number: string
    description: string
    material: IMaterial
    x_units: number
    y_units: number
    depth: number
    lid: boolean
    parent?: DocumentReference<DocumentData, DocumentData> | null,
}

export interface IDBUpdateCabinet {
    [key: string]: any;
    name: string
    name_lower: string
    name_number: string
    description: string
    material: IMaterial
}

export interface IDBUpdateDrawer {
    [key: string]: any;
    name: string
    name_lower: string
    name_number: string
    description: string
}

export interface IDrawBox {
    material: IMaterial
    x_units: number
    y_units: number 
    depth: number
    lid: boolean
}

export interface IDrawCabinet {
    material: IMaterial
    x_units: number
    y_units: number 
    drawers: IDrawDrawer[]
}

export interface IDrawDrawer {
    id?: string
    name: string
    x_units: number
    y_units: number 
    x_pos: number
    y_pos: number
}