import { arrayRemove, arrayUnion, collection, doc, DocumentData, DocumentReference, getDoc, query, runTransaction, Transaction, where } from 'firebase/firestore';
import { ref } from 'vue';

import { db } from '../firebase';
import { ICreateBox, ICreateCabinet, ICreateDrawer, ICreateOrganizer, ICreateSlot, IDBCreateBox, IDBCreateCabinet, IDBCreateDrawer, IDBCreateOrganizer, IDBCreateSlot, IDBUpdateBox, IDBUpdateCabinet, IDBUpdateDrawer, IDBUpdateOrganizer, IDBUpdateSlot, IUpdateBox, IUpdateCabinet, IUpdateDrawer, IUpdateOrganizer, IUpdateSlot } from '../models/storage.model';
import { calculateT9 } from './misc.service';

const getStoragesColl = (userId: string) => collection(db, 'users', userId, 'storages');

const storageQuery = ref();
const storagesQuery = ref();
const containersQuery = ref();

const storagesThingsQuery = (userId: string) => query(getStoragesColl(userId),
  where('type', 'in', ['box', 'drawer', 'slot'])
);

const getStorageById = async (userId: string, id: string) => {
  const docSnap = await getDoc(doc(db, 'users', userId, 'storages', id));
  if (docSnap.exists()) return docSnap.data();
  else return null;
};

const selectStorageById = (userId: string, id: string) => {
  storageQuery.value = doc(db, 'users', userId, 'storages', id);
};

const searchStorages = async (userId: string, value: string) => {
  if (value) {
    const searchStr = value.toLowerCase();
    storagesQuery.value = query(getStoragesColl(userId),
      where('name_lower', '>=', searchStr),
      where('name_lower', '<=', searchStr + '\uf8ff')
    );
    containersQuery.value = query(getStoragesColl(userId),
      where('type', 'in', ['cabinet', 'box', 'organizer']),
      where('name_lower', '>=', searchStr),
      where('name_lower', '<=', searchStr + '\uf8ff')
    );
  }
  else {
    storagesQuery.value = getStoragesColl(userId);
    containersQuery.value = query(getStoragesColl(userId), where('type', 'in', ['box', 'cabinet', 'organizer']));
  }
};

const createStorageBox = async (userId: string, localBox: ICreateBox) => {
  const parentDocRef = localBox.parent ? doc(db, 'users', userId, 'storages', localBox.parent) : null;

  await runTransaction(db, async (transaction) => {
    const newBoxDocRef = doc(getStoragesColl(userId));

    const storage: IDBCreateBox = {
      type: 'box',
      name: localBox.name,
      name_lower: localBox.name.toLowerCase(),
      name_number: calculateT9(localBox.name),
      description: localBox.description,
      material: localBox.material,
      x_units: localBox.x_units,
      y_units: localBox.y_units,
      depth: localBox.depth,
      lid: localBox.lid,
      color: localBox.color,
      parent: parentDocRef,
      things: []
    }

    transaction.set(newBoxDocRef, storage);

    if (parentDocRef) {
      addStorageToParent(transaction, newBoxDocRef, parentDocRef);
    }
  });
};

const updateStorageBox = async (userId: string, box: IUpdateBox) => {
  const boxDocRef = doc(db, 'users', userId, 'storages', box.id);
  const oldParentDocRef = box.oldParentId ? doc(db, 'users', userId, 'storages', box.oldParentId) : null;
  const parentDocRef = box.parentId ? doc(db, 'users', userId, 'storages', box.parentId) : null;

  await runTransaction(db, async (transaction) => {

    const storage: IDBUpdateBox = {
      name: box.name,
      name_lower: box.name.toLowerCase(),
      name_number: calculateT9(box.name),
      description: box.description,
      material: box.material,
      x_units: box.x_units,
      y_units: box.y_units,
      depth: box.depth,
      lid: box.lid,
      color: box.color,
      parent: parentDocRef
    }

    transaction.update(boxDocRef, storage);

    if ((parentDocRef != oldParentDocRef)) {
      if (oldParentDocRef) {
        removeStorageFromParent(transaction, boxDocRef, oldParentDocRef);
      }
      if (parentDocRef) {
        addStorageToParent(transaction, boxDocRef, parentDocRef);
      }
    }
  });
};

const createDrawers = async (userId: string, transaction: Transaction, parent: DocumentReference<DocumentData, DocumentData>, drawers: ICreateDrawer[]) => {
  const drawersId: DocumentReference<DocumentData, DocumentData>[] = [];

  for (const d of drawers) {
    const newDrawerDocRef = doc(getStoragesColl(userId));
    const drawer: IDBCreateDrawer = {
      type: 'drawer',
      name: d.name,
      name_lower: d.name.toLowerCase(),
      name_number: calculateT9(d.name),
      x_units: d.x_units,
      y_units: d.y_units,
      x_pos: d.x_pos,
      y_pos: d.y_pos,
      parent
    };

    transaction.set(newDrawerDocRef, drawer);
    drawersId.push(newDrawerDocRef);
  }

  return drawersId;
};

const updateDrawers = (userId: string, transaction: Transaction, drawers: IUpdateDrawer[]) => {
  for (const d of drawers) {
    const drawerDocRef = doc(db, 'users', userId, 'storages', d.id);
    const drawer: IDBUpdateDrawer = {
      name: d.name,
      name_lower: d.name.toLowerCase(),
      name_number: calculateT9(d.name),
      description: d.description || '',
    };

    transaction.update(drawerDocRef, drawer);
  }
};

const createStorageCabinet = async (userId: string, cabinet: ICreateCabinet) => {
  await runTransaction(db, async (transaction) => {
    const newCabinetDocRef = doc(getStoragesColl(userId));

    const drawers = await createDrawers(userId, transaction, newCabinetDocRef, cabinet.drawers);

    const storage: IDBCreateCabinet = {
      type: 'cabinet',
      name: cabinet.name,
      name_lower: cabinet.name.toLowerCase(),
      name_number: calculateT9(cabinet.name),
      description: cabinet.description,
      material: cabinet.material,
      ratio: cabinet.ratio || 1.0,
      x_units: cabinet.x_units,
      y_units: cabinet.y_units,
      drawers
    };

    transaction.set(newCabinetDocRef, storage);
  });
};

const updateStorageCabinet = async (userId: string, cabinet: IUpdateCabinet) => {
  const cabinetDocRef = doc(db, 'users', userId, 'storages', cabinet.id);

  await runTransaction(db, async (transaction) => {

    updateDrawers(userId, transaction, cabinet.drawers);

    const storage: IDBUpdateCabinet = {
      name: cabinet.name,
      name_lower: cabinet.name.toLowerCase(),
      name_number: calculateT9(cabinet.name),
      description: cabinet.description,
      material: cabinet.material,
      ratio: cabinet.ratio,
    }

    transaction.update(cabinetDocRef, storage);
  });
};

const createSlots = async (userId: string, transaction: Transaction, parent: DocumentReference<DocumentData, DocumentData>, slots: ICreateSlot[]) => {
  const slotsId: DocumentReference<DocumentData, DocumentData>[] = [];

  for (const s of slots) {
    const newSlotDocRef = doc(getStoragesColl(userId));
    const slot: IDBCreateSlot = {
      type: 'slot',
      name: s.name,
      name_lower: s.name.toLowerCase(),
      name_number: calculateT9(s.name),
      x_units: s.x_units,
      y_units: s.y_units,
      x_pos: s.x_pos,
      y_pos: s.y_pos,
      parent
    };

    transaction.set(newSlotDocRef, slot);
    slotsId.push(newSlotDocRef);
  }

  return slotsId;
};

const updateSlots = (userId: string, transaction: Transaction, slots: IUpdateSlot[]) => {
  for (const s of slots) {
    const slotDocRef = doc(db, 'users', userId, 'storages', s.id);
    const slot: IDBUpdateSlot = {
      name: s.name,
      name_lower: s.name.toLowerCase(),
      name_number: calculateT9(s.name),
      description: s.description || '',
    };

    transaction.update(slotDocRef, slot);
  }
};

const createStorageOrganizer = async (userId: string, organizer: ICreateOrganizer) => {
  const parentDocRef = organizer.parent ? doc(db, 'users', userId, 'storages', organizer.parent) : null;

  await runTransaction(db, async (transaction) => {
    const newOrganizerDocRef = doc(getStoragesColl(userId));

    const slots = await createSlots(userId, transaction, newOrganizerDocRef, organizer.slots);

    const storage: IDBCreateOrganizer = {
      type: 'organizer',
      name: organizer.name,
      name_lower: organizer.name.toLowerCase(),
      name_number: calculateT9(organizer.name),
      description: organizer.description,
      material: organizer.material,
      ratio: organizer.ratio || 1.0,
      x_units: organizer.x_units,
      y_units: organizer.y_units,
      parent: parentDocRef,
      slots
    };

    transaction.set(newOrganizerDocRef, storage);

    if (parentDocRef) {
      addStorageToParent(transaction, newOrganizerDocRef, parentDocRef);
    }
  });
};

const updateStorageOrganizer = async (userId: string, organizer: IUpdateOrganizer) => {
  const organizerDocRef = doc(db, 'users', userId, 'storages', organizer.id);
  const oldParentDocRef = organizer.oldParentId ? doc(db, 'users', userId, 'storages', organizer.oldParentId) : null;
  const parentDocRef = organizer.parentId ? doc(db, 'users', userId, 'storages', organizer.parentId) : null;

  await runTransaction(db, async (transaction) => {
    updateSlots(userId, transaction, organizer.slots);

    const storage: IDBUpdateOrganizer = {
      name: organizer.name,
      name_lower: organizer.name.toLowerCase(),
      name_number: calculateT9(organizer.name),
      description: organizer.description,
      material: organizer.material,
      ratio: organizer.ratio,
      parent: parentDocRef
    }

    transaction.update(organizerDocRef, storage);

    if ((parentDocRef != oldParentDocRef)) {
      if (oldParentDocRef) {
        removeStorageFromParent(transaction, organizerDocRef, oldParentDocRef);
      }
      if (parentDocRef) {
        addStorageToParent(transaction, organizerDocRef, parentDocRef);
      }
    }
  });
};

const addThingToStorage = async (transaction: Transaction, thingDocRef: DocumentReference<DocumentData, DocumentData>, storageDocRef: DocumentReference<DocumentData, DocumentData>) => {
  transaction.update(storageDocRef, {
    things: arrayUnion(thingDocRef)
  });
};

const removeThingFromStorage = async (transaction: Transaction, thingDocRef: DocumentReference<DocumentData, DocumentData>, storageDocRef: DocumentReference<DocumentData, DocumentData>) => {
  transaction.update(storageDocRef, {
    things: arrayRemove(thingDocRef)
  });
};

const addStorageToParent = async (transaction: Transaction, storageDocRef: DocumentReference<DocumentData, DocumentData>, parentDocRef: DocumentReference<DocumentData, DocumentData>) => {
  transaction.update(parentDocRef, {
    storages: arrayUnion(storageDocRef)
  });
};

const removeStorageFromParent = async (transaction: Transaction, storageDocRef: DocumentReference<DocumentData, DocumentData>, parentDocRef: DocumentReference<DocumentData, DocumentData>) => {
  transaction.update(parentDocRef, {
    storages: arrayRemove(storageDocRef)
  });
};

const swapStorages = async (userId: string, id1: string, id2: string) => {
  const docRef1 = doc(getStoragesColl(userId), id1);
  const docRef2 = doc(getStoragesColl(userId), id2);

  await runTransaction(db, async (transaction) => {
    const docSnap1 = await transaction.get(docRef1);
    const docSnap2 = await transaction.get(docRef2);

    if (!docSnap1.exists() || !docSnap2.exists()) {
      throw new Error("One or both storages do not exist.");
    }

    const data1 = docSnap1.data() as IDBCreateDrawer;
    const data2 = docSnap2.data() as IDBCreateDrawer;

    if (data1.type !== 'drawer' || data2.type !== 'drawer') {
      throw new Error(`Swap is only supported for Drawers. Got types: ${data1.type} and ${data2.type}`);
    }

    if (data1.x_units !== data2.x_units || data1.y_units !== data2.y_units) {
      throw new Error("Drawers must be of the same size to swap.");
    }

    // Swap Parent and Position
    const update1: Pick<IDBCreateDrawer, 'parent' | 'x_pos' | 'y_pos'> = {
      parent: data2.parent,
      x_pos: data2.x_pos,
      y_pos: data2.y_pos
    };

    const update2: Pick<IDBCreateDrawer, 'parent' | 'x_pos' | 'y_pos'> = {
      parent: data1.parent,
      x_pos: data1.x_pos,
      y_pos: data1.y_pos
    };

    transaction.update(docRef1, update1);
    transaction.update(docRef2, update2);

    const handleParentSwap = (childRef: DocumentReference, oldParentRef: DocumentReference | null, newParentRef: DocumentReference | null, collectionField: string) => {
      if (oldParentRef && newParentRef && oldParentRef.id === newParentRef.id) return; // Same parent, nothing to do array-wise

      if (oldParentRef) {
        transaction.update(oldParentRef, { [collectionField]: arrayRemove(childRef) });
      }
      if (newParentRef) {
        transaction.update(newParentRef, { [collectionField]: arrayUnion(childRef) });
      }
    };

    handleParentSwap(docRef1, data1.parent, data2.parent, 'drawers');
    handleParentSwap(docRef2, data2.parent, data1.parent, 'drawers');
  });
};

export default {
  getStoragesColl,
  storageQuery,
  storagesQuery,
  containersQuery,
  storagesThingsQuery,
  getStorageById,
  selectStorageById,
  searchStorages,
  createStorageBox,
  updateStorageBox,
  createStorageCabinet,
  updateStorageCabinet,
  createStorageOrganizer,
  updateStorageOrganizer,
  addThingToStorage,
  removeThingFromStorage,
  swapStorages
};