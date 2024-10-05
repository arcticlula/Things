import { DocumentData, DocumentReference } from "firebase/firestore"
import { IThing } from "./thing.model"

export interface ILocalTag {
    value: string,
    label: string
}

export interface IDBTag {
    name: string,
    name_lower: string,
    name_number: string,
    things?: DocumentReference<DocumentData, DocumentData>[]
}

export interface ITag {
    id: string,
    name: string,
    name_lower: string,
    name_number: string,
    things: IThing[]
}