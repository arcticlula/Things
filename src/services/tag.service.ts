import { arrayRemove, arrayUnion, collection, doc, DocumentData, DocumentReference, getDocs, query, Transaction, where } from 'firebase/firestore';
import { ref } from 'vue';

import { db } from '../firebase';
import { IDBTag, ILocalTag } from '../models/tag.model';
import { calculateT9 } from './misc.service';

const getTagsColl = (userId: string) => collection(db, 'users', userId, 'tags');

const tagsQuery = ref();

const searchTags = async (userId: string, value: string) => {
  if (value) {
    const searchStr = value.toLowerCase();
    tagsQuery.value = query(getTagsColl(userId),
      where('name_lower', '>=', searchStr),
      where('name_lower', '<=', searchStr + '\uf8ff')
    );
  }
  else {
    tagsQuery.value = getTagsColl(userId);
  }
};

const getTagsByName = async (userId: string, value: string) => {
  if (!value) return [];
  const searchStr = value.toLowerCase();
  const q = query(getTagsColl(userId),
    where('name_lower', '>=', searchStr),
    where('name_lower', '<=', searchStr + '\uf8ff')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as IDBTag[];
};

const getTagByExactName = async (userId: string, tagName: string) => {
  if (!tagName) return null;
  const searchStr = tagName.toLowerCase();
  const q = query(getTagsColl(userId),
    where('name_lower', '==', searchStr)
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as IDBTag;
};

const createTags = async (transaction: Transaction, userId: string, newthingDocRef: DocumentReference<DocumentData, DocumentData>, tags: ILocalTag[]) => {
  if (tags.length === 0) return [];

  const createdTags: IDBTag[] = [];

  for (const t of tags) {
    // Check if a tag with this name already exists (case-insensitive)
    const existingTagQuery = query(
      getTagsColl(userId),
      where('name_lower', '==', t.label.toLowerCase())
    );

    const existingTagSnapshot = await getDocs(existingTagQuery);

    if (!existingTagSnapshot.empty) {
      console.log('Tag already exists', t.label);
      // Tag already exists, add the thing to it instead of creating a new tag
      const existingTagDoc = existingTagSnapshot.docs[0];
      const existingTagRef = doc(db, 'users', userId, 'tags', existingTagDoc.id);

      transaction.update(existingTagRef, {
        things: arrayUnion(newthingDocRef)
      });

      createdTags.push({
        id: existingTagDoc.id,
        ...existingTagDoc.data() as IDBTag
      });
    } else {
      // Tag doesn't exist, create a new one
      const newTagDocRef = doc(getTagsColl(userId));

      const tag: IDBTag = {
        name: t.label,
        name_lower: t.label.toLowerCase(),
        name_number: calculateT9(t.label),
        things: [newthingDocRef]
      };

      transaction.set(newTagDocRef, tag);
      createdTags.push({ id: newTagDocRef.id, ...tag });
    }
  }

  return createdTags;
};

const addThingToTags = async (transaction: Transaction, userId: string, thingDocRef: DocumentReference<DocumentData, DocumentData>, tags: ILocalTag[]) => {
  if (tags.length === 0) return [];

  const addedTags: IDBTag[] = [];

  for (const t of tags) {
    const tagDocRef = doc(db, 'users', userId, 'tags', t.value);
    transaction.update(tagDocRef, {
      things: arrayUnion(thingDocRef)
    });

    addedTags.push({
      id: t.value,
      name: t.label,
      name_lower: t.label.toLowerCase(),
      name_number: calculateT9(t.label),
    });
  }

  return addedTags;
};

const removeThingFromTags = async (transaction: Transaction, userId: string, thingDocRef: DocumentReference<DocumentData, DocumentData>, tags: ILocalTag[]) => {
  if (tags.length === 0) return [];

  for (const t of tags) {
    const tagDocRef = doc(db, 'users', userId, 'tags', t.value);
    transaction.update(tagDocRef, {
      things: arrayRemove(thingDocRef)
    });
  }
};

export default {
  getTagsColl,
  tagsQuery,
  searchTags,
  getTagsByName,
  getTagByExactName,
  createTags,
  addThingToTags,
  removeThingFromTags
};