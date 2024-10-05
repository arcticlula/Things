import { DocumentData, DocumentReference } from "firebase/firestore"
import { ILocalTag, ITag } from "./tag.model"
import { IBox, ICabinet } from "./storage.model"

export interface IThingForm {
    name: string,
    description: string,
    tags: string[],
    storageId: string
}

export interface ILocalThing {
    name: string,
    description: string,
    createdTags: ILocalTag[],
    tags: ILocalTag[],
    storageId: string 
}

export interface IDBThing {
    name: string,
    name_lower: string,
    name_number: string,
    description: string,
    storage: DocumentReference<DocumentData, DocumentData>
    tags?: DocumentReference<DocumentData, DocumentData>[]
}

export interface IThing {
    id: string,
    name: string,
    name_lower: string,
    name_number: string,
    description: string,
    storage: IBox & ICabinet,
    tags?: ITag[]
}

export interface IUpdateThing {
    id: string,
    name: string,
    description: string
    createdTags: ILocalTag[]
    tags: ILocalTag[]
    removedTags: ILocalTag[]
    storageId: string
    oldStorageId: string 
}

export interface IDBUpdateThing {
    [key: string]: any;
    name: string,
    name_lower: string
    name_number: string
    description: string
    tags?: DocumentReference<DocumentData, DocumentData>[]
    storage: DocumentReference<DocumentData, DocumentData>
}