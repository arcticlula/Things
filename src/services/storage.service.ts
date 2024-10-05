import { arrayRemove, arrayUnion, collection, doc, DocumentData, DocumentReference, getDoc, query, runTransaction, Transaction, where } from 'firebase/firestore';
import { ref } from 'vue';

import { db } from '../firebase';
import { ICreateCabinet, IDBBox, IDBCabinet, IDBDrawer, IDBUpdateBox, IDBUpdateCabinet, IDBUpdateDrawer, ILocalBox, ILocalDrawer, IUpdateBox, IUpdateCabinet, IUpdateDrawer } from '../models/storage.model';
import { calculateT9 } from './misc.service';

// Firestore collections
const storagesColRef = collection(db, 'storages');

const storageQuery = ref();
const storagesQuery = ref();
const storagesMainQuery = ref();

const storagesWithThings = query(storagesColRef,
  where('type', 'in', ['drawer', 'box'])
);

const getStorageById = async(id: string) => {
  const docSnap = await getDoc(doc(storagesColRef, id));
  if (docSnap.exists()) return docSnap.data();
  else return null;
};

const selectStorageById = (id: string) => {
  storageQuery.value = doc(storagesColRef, id); 
};

const searchStorages = async (value: string) => {
  if(value) {
    const searchStr = value.toLowerCase();
    storagesQuery.value = query(storagesColRef,
      where('name_lower', '>=', searchStr),
      where('name_lower', '<=', searchStr + '\uf8ff')
    );
    storagesMainQuery.value = query(storagesColRef,
      where('type', 'in', ['cabinet', 'box']),
      where('name_lower', '>=', searchStr),
      where('name_lower', '<=', searchStr + '\uf8ff')
    );
  } 
  else {
    storagesQuery.value = storagesColRef;
    storagesMainQuery.value = query(storagesColRef, where('type', 'in', ['cabinet', 'box']));
  }
};

const createStorageBox = async (localBox: ILocalBox) => {
  const parentDocRef = localBox.parent ? doc(db, 'storages', localBox.parent) : null;

  await runTransaction(db, async (transaction) => {
    const newBoxDocRef = doc(storagesColRef);

    const storage: IDBBox = {
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
      parent: parentDocRef,
      things: []
    }

    transaction.set(newBoxDocRef, storage);

    if(parentDocRef) {
      addStorageToParent(transaction, newBoxDocRef, parentDocRef);
    }
  });
};

const updateStorageBox = async (box: IUpdateBox) => {
  const boxDocRef = doc(db, 'storages', box.id);
  const oldParentDocRef = box.oldParentId ? doc(db, 'storages', box.oldParentId) : null;
  const parentDocRef = box.parentId ? doc(db, 'storages', box.parentId) : null;

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
      parent: parentDocRef
    }

    transaction.update(boxDocRef, storage);

    if((parentDocRef != oldParentDocRef)) {
      if(oldParentDocRef) {
        removeStorageFromParent(transaction, boxDocRef, oldParentDocRef);
      }
      if(parentDocRef) {
        addStorageToParent(transaction, boxDocRef, parentDocRef);
      }
    }
  });
};

const createDrawers = async (transaction: Transaction, parent: DocumentReference<DocumentData, DocumentData>, drawers: ILocalDrawer[]) => {  
  const drawersId: DocumentReference<DocumentData, DocumentData>[] = [];

  for (const d of drawers) {
    const newDrawerDocRef = doc(storagesColRef);
    const drawer: IDBDrawer = {
      type: 'drawer',
      name: d.name,
      name_lower: d.name.toLowerCase(),
      name_number: calculateT9(d.name),
      description: `Drawer at row ${d.x_pos}, col ${d.y_pos}`,
      x_units: d.x_units,
      y_units: d.y_units,
      x_pos: d.x_pos,
      y_pos: d.y_pos,
      parent,
      things: []
    };

    transaction.set(newDrawerDocRef, drawer);
    drawersId.push(newDrawerDocRef);
  }

  return drawersId;
};

const updateDrawers = (transaction: Transaction, drawers: IUpdateDrawer[]) => {  
  for (const d of drawers) {
    const drawerDocRef = doc(db, 'storages', d.id);
    const drawer: IDBUpdateDrawer = {
      name: d.name,
      name_lower: d.name.toLowerCase(),
      name_number: calculateT9(d.name),
      description: d.description
    };

    transaction.update(drawerDocRef, drawer);
  }
};

const createStorageCabinet = async (cabinet: ICreateCabinet) => {
  await runTransaction(db, async (transaction) => {
    const newCabinetDocRef = doc(storagesColRef);

    const drawers = await createDrawers(transaction, newCabinetDocRef, cabinet.drawers);

    const storage: IDBCabinet = {
      type: 'cabinet',
      name: cabinet.name,
      name_lower: cabinet.name.toLowerCase(),
      name_number: calculateT9(cabinet.name),
      description: cabinet.description,
      material: cabinet.material,
      x_units: cabinet.x_units,
      y_units: cabinet.y_units,
      drawers
    };

    transaction.set(newCabinetDocRef, storage);
  });
};

const updateStorageCabinet = async (cabinet: IUpdateCabinet) => {
  const cabinetDocRef = doc(db, 'storages', cabinet.id);

  await runTransaction(db, async (transaction) => {

    updateDrawers(transaction, cabinet.drawers);

    const storage: IDBUpdateCabinet = {
      name: cabinet.name,
      name_lower: cabinet.name.toLowerCase(),
      name_number: calculateT9(cabinet.name),
      description: cabinet.description,
      material: cabinet.material,
    }

    transaction.update(cabinetDocRef, storage);
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

export default {
  storagesColRef,
  storageQuery,
  storagesQuery,
  storagesMainQuery,
  storagesWithThings,
  getStorageById,
  selectStorageById,
  searchStorages,
  createStorageBox,
  updateStorageBox,
  createStorageCabinet,
  updateStorageCabinet,
  addThingToStorage,
  removeThingFromStorage
};