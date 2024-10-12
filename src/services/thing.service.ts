import { collection, doc, getDoc, query, runTransaction, where } from 'firebase/firestore';
import { ref } from 'vue';

import { db } from '../firebase';
import { ICreateThing, IDBCreateThing, IDBUpdateThing, IUpdateThing } from '../models/thing.model';
import { calculateT9 } from './misc.service';

import storageService from './storage.service';
import tagService from './tag.service';

const thingsColRef = collection(db, 'things');

const thingQuery = ref();
const thingsQuery = ref();

const searchThings = async(value: string) => {
  if (value) {
    const searchStr = value.toLowerCase();
    thingsQuery.value = query(thingsColRef,
      where('name_lower', '>=', searchStr),
      where('name_lower', '<=', searchStr + '\uf8ff')
    );
  } 
  else {
    thingsQuery.value = thingsColRef;
  }
};

const selectThingById = async(id: string) => {
  thingQuery.value = doc(thingsColRef, id); 
};

const getThing = async() => {
  const docSnap = await getDoc(thingQuery.value);

  if (docSnap.exists()) return docSnap.data();
  else return null;
};

const createThing = async (localThing: ICreateThing) => {
  await runTransaction(db, async (transaction) => {
    const newThingDocRef = doc(thingsColRef); // New thing id

    // Create new tags
    const createdTags = await tagService.createTags(transaction, newThingDocRef, localThing.createdTags);
    
    // Update existing tags
    const tags = await tagService.addThingToTags(transaction, newThingDocRef, localThing.tags);

    const storageDocRef = doc(db, 'storages', localThing.storage);

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

    storageService.addThingToStorage(transaction, newThingDocRef, storageDocRef);
  });
}

const updateThing = async (localThing: IUpdateThing) => {
  await runTransaction(db, async (transaction) => {
    const thingDocRef = doc(db, 'things', localThing.id);
    const oldStorageDocRef = doc(db, 'storages', localThing.oldStorage);
    const storageDocRef = doc(db, 'storages', localThing.storage);

    // Create new tags
    const createdTags = await tagService.createTags(transaction, thingDocRef, localThing.createdTags);
    // Update existing tags
    const tags = await tagService.addThingToTags(transaction, thingDocRef, localThing.tags);
    // Remove thing from Tags
    await tagService.removeThingFromTags(transaction, thingDocRef, localThing.removedTags);

    const thing: IDBUpdateThing = {
      name: localThing.name,
      name_lower: localThing.name.toLowerCase(),
      name_number: calculateT9(localThing.name),
      stock: localThing.stock,
      description: localThing.description,
      tags: [...createdTags, ...tags],
      storage: storageDocRef
    };

    transaction.update(thingDocRef, thing);

    if((storageDocRef != oldStorageDocRef)) {
      storageService.removeThingFromStorage(transaction, thingDocRef, oldStorageDocRef);
      storageService.addThingToStorage(transaction, thingDocRef, storageDocRef);
    }
  });
}

export default {
  thingsColRef,
  thingQuery,
  thingsQuery,
  selectThingById,
  getThing,
  searchThings,
  createThing,
  updateThing
};
