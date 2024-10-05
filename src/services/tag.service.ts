import { arrayRemove, arrayUnion, collection, doc, DocumentData, DocumentReference, query, Transaction, where } from 'firebase/firestore';
import { ref } from 'vue';

import { db } from '../firebase';
import { IDBTag, ILocalTag } from '../models/tag.model';
import { calculateT9 } from './misc.service';

// Firestore collections
const tagsColRef = collection(db, 'tags');

const tagsQuery = ref();

const searchTags = async (value: string) => {
  if(value) {
    const searchStr = value.toLowerCase();
    tagsQuery.value = query(tagsColRef,
      where('name_lower', '>=', searchStr),
      where('name_lower', '<=', searchStr + '\uf8ff')
    );
  } 
  else {
    tagsQuery.value = tagsColRef;
  }
};

const createTags = async (transaction: Transaction, newthingDocRef: DocumentReference<DocumentData, DocumentData>, tags: ILocalTag[]) => {  
  if(tags.length === 0) return [];

  const tagsId: DocumentReference<DocumentData, DocumentData>[] = [];

  for (const t of tags) {
    const newTagDocRef = doc(tagsColRef); // Firestore generates a unique ID

    const tag: IDBTag = { 
      name: t.label, 
      name_lower: t.label.toLowerCase(),
      name_number: calculateT9(t.label),
      things: [newthingDocRef]
    };

    transaction.set(newTagDocRef, tag);
    tagsId.push(newTagDocRef);
  }

  return tagsId;
};

const addThingToTags = async (transaction: Transaction, thingDocRef: DocumentReference<DocumentData, DocumentData>, tags: ILocalTag[]) => {  
  if(tags.length === 0) return [];

  const tagsId: DocumentReference<DocumentData, DocumentData>[] = [];

  for (const t of tags) {
    const tagDocRef = doc(db, 'tags', t.value);
    transaction.update(tagDocRef, {
      things: arrayUnion(thingDocRef)
    });
    tagsId.push(tagDocRef);
  }

  return tagsId;
};

const removeThingFromTags = async (transaction: Transaction, thingDocRef: DocumentReference<DocumentData, DocumentData>, tags: ILocalTag[]) => {  
  if(tags.length === 0) return [];

  for (const t of tags) {
    const tagDocRef = doc(db, 'tags', t.value);
    transaction.update(tagDocRef, {
      things: arrayRemove(thingDocRef)
    });
  }
};

export default {
  tagsColRef,
  tagsQuery,
  searchTags,
  createTags,
  addThingToTags,
  removeThingFromTags
};
