import { DocumentData, DocumentReference } from "firebase/firestore"
import { IContainer } from "./storage.model"
import { IDBTag, ILocalTag, ITag } from "./tag.model"

// Form
export interface IThingForm {
    name: string
    stock: number
    description: string
    tags: string[]
    storageId?: string | null
}

// Thing Interface
export interface IThing {
    id: string
    stock: number
    name: string
    name_lower: string
    name_number: string
    description: string
    storage?: IContainer | null
    tags?: ITag[]
}

interface ILocalThing {
    name: string
    stock: number
    description: string
    storage?: string | null
    tags: ILocalTag[]
    createdTags: ILocalTag[]
}

// Create Local Thing
export interface ICreateThing extends ILocalThing { }

// Update Local Thing
export interface IUpdateThing extends ILocalThing {
    id: string
    removedTags: ILocalTag[]
    oldStorage?: string | null
}

export interface IDBThing {
    id?: string,
    name: string
    name_lower: string
    name_number: string
    description: string
    stock: number
    storage?: DocumentReference<DocumentData, DocumentData> | null
    tags?: IDBTag[]
}

// Create DB Thing
export interface IDBCreateThing extends IDBThing { }

// Update DB Thing
export interface IDBUpdateThing extends IDBThing {
    [key: string]: any
}