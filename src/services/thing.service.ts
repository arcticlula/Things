import { collection, doc, documentId, getDoc, getDocs, query, runTransaction, where } from 'firebase/firestore';
import { ref } from 'vue';

import { db } from '../firebase';
import { ICreateThing, IDBCreateThing, IDBThing, IDBUpdateThing, IUpdateThing } from '../models/thing.model';
import { calculateT9 } from './misc.service';

import storageService from './storage.service';
import tagService from './tag.service';

const getThingsColl = (userId: string) => collection(db, 'users', userId, 'things');

const thingQuery = ref();
const thingsQuery = ref();

const searchThings = async (userId: string, value: string) => {
  if (value) {
    const searchStr = value.toLowerCase();
    thingsQuery.value = query(getThingsColl(userId),
      where('name_lower', '>=', searchStr),
      where('name_lower', '<=', searchStr + '\uf8ff')
    );
  }
  else {
    thingsQuery.value = getThingsColl(userId);
  }
};

const getUnassignedThings = (userId: string) => {
  thingsQuery.value = query(getThingsColl(userId), where("storage", "==", null));
}

const selectThingById = async (userId: string, id: string) => {
  thingQuery.value = doc(db, 'users', userId, 'things', id);
};

const getThing = async () => {
  const docSnap = await getDoc(thingQuery.value);

  if (docSnap.exists()) return docSnap.data();
  else return null;
};


const getThingsByName = async (userId: string, value: string) => {
  if (!value) return [];
  const searchStr = value.toLowerCase();
  const q = query(getThingsColl(userId),
    where('name_lower', '>=', searchStr),
    where('name_lower', '<=', searchStr + '\uf8ff')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as IDBThing })) as IDBThing[];
};

const getThingsByIds = async (userId: string, ids: string[]) => {
  if (!ids || ids.length === 0) return [];

  const chunks = [];
  for (let i = 0; i < ids.length; i += 10) {
    chunks.push(ids.slice(i, i + 10));
  }

  const results: IDBThing[] = [];
  for (const chunk of chunks) {
    const q = query(getThingsColl(userId), where(documentId(), 'in', chunk));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() as IDBThing });
    });
  }

  return results;
};

const createThing = async (userId: string, localThing: ICreateThing) => {
  await runTransaction(db, async (transaction) => {
    const newThingDocRef = doc(getThingsColl(userId));

    const createdTags = await tagService.createTags(transaction, userId, newThingDocRef, localThing.createdTags);

    const tags = await tagService.addThingToTags(transaction, userId, newThingDocRef, localThing.tags);

    let storageDocRef = null;
    if (localThing.storage) {
      storageDocRef = doc(db, 'users', userId, 'storages', localThing.storage);
    }

    const thing: IDBCreateThing = {
      name: localThing.name,
      name_lower: localThing.name.toLowerCase(),
      name_number: calculateT9(localThing.name),
      stock: localThing.stock,
      description: localThing.description,
      tags: [...createdTags, ...tags],
      storage: storageDocRef
    };

    transaction.set(newThingDocRef, thing);

    if (storageDocRef) {
      storageService.addThingToStorage(transaction, newThingDocRef, storageDocRef);
    }
  });
}

const updateThing = async (userId: string, localThing: IUpdateThing) => {
  await runTransaction(db, async (transaction) => {
    const thingDocRef = doc(db, 'users', userId, 'things', localThing.id);

    const createdTags = await tagService.createTags(transaction, userId, thingDocRef, localThing.createdTags);
    const tags = await tagService.addThingToTags(transaction, userId, thingDocRef, localThing.tags);
    await tagService.removeThingFromTags(transaction, userId, thingDocRef, localThing.removedTags);

    const thing: IDBUpdateThing = {
      name: localThing.name,
      name_lower: localThing.name.toLowerCase(),
      name_number: calculateT9(localThing.name),
      stock: localThing.stock,
      description: localThing.description,
      tags: [...createdTags, ...tags]
    };

    let oldStorageDocRef = null;
    if (localThing.oldStorage) {
      oldStorageDocRef = doc(db, 'users', userId, 'storages', localThing.oldStorage);
    }

    let storageDocRef = null;
    if (localThing.storage) {
      storageDocRef = doc(db, 'users', userId, 'storages', localThing.storage);
      thing.storage = storageDocRef;
    } else {
      thing.storage = null;
    }

    transaction.update(thingDocRef, thing);

    // Handle storage changes
    if (storageDocRef && oldStorageDocRef && storageDocRef.path !== oldStorageDocRef.path) {
      // Moving from one storage to another
      storageService.removeThingFromStorage(transaction, thingDocRef, oldStorageDocRef);
      storageService.addThingToStorage(transaction, thingDocRef, storageDocRef);
    } else if (storageDocRef && !oldStorageDocRef) {
      // Adding to storage (was previously none)
      storageService.addThingToStorage(transaction, thingDocRef, storageDocRef);
    } else if (!storageDocRef && oldStorageDocRef) {
      // Removing from storage
      storageService.removeThingFromStorage(transaction, thingDocRef, oldStorageDocRef);
    }
  });
}

const assignThingToStorage = async (userId: string, thingId: string, storageId: string | null) => {
  await runTransaction(db, async (transaction) => {
    const thingDocRef = doc(db, 'users', userId, 'things', thingId);

    if (storageId) {
      const storageDocRef = doc(db, 'users', userId, 'storages', storageId);
      transaction.update(thingDocRef, { storage: storageDocRef });
      storageService.addThingToStorage(transaction, thingDocRef, storageDocRef);
    }
  });
}

export default {
  getThingsColl,
  thingQuery,
  thingsQuery,
  selectThingById,
  getThing,
  searchThings,
  getThingsByName,
  getThingsByIds,
  createThing,
  updateThing,
  assignThingToStorage,
  getUnassignedThings
};
