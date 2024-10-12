import { doc } from 'firebase/firestore';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useCollection, useDocument } from 'vuefire';
import storageService from '../services/storage.service';
import { ICreateBox, ICreateCabinet, IUpdateBox, IUpdateCabinet } from '../models/storage.model';


export const useStorageStore = defineStore('storageStore', () => {
  const storageId = ref('xixi');

  const storageDoc = computed(() =>
    doc(storageService.storagesColRef, storageId.value)
  );

  const storagesQuery = storageService.storagesQuery;
  const containersQuery = storageService.containersQuery;
  const storagesThingsQuery = storageService.storagesThingsQuery;

  const storage = useDocument(storageDoc);
  const storages = useCollection(storagesQuery);
  const storagesAll = useCollection(storageService.storagesColRef);
  const containers = useCollection(containersQuery);
  const storagesThings = useCollection(storagesThingsQuery);

  function setStorageId(id: string) {
    storageId.value = id;
  }

  async function searchStorages(value: string) {
    await storageService.searchStorages(value);
  }

  async function createStorageBox(box: ICreateBox) {
    await storageService.createStorageBox(box);
  }

  async function createStorageCabinet(cabinet: ICreateCabinet) {
    await storageService.createStorageCabinet(cabinet);
  }

  async function updateStorageBox(box: IUpdateBox) {
    await storageService.updateStorageBox(box);
  }

  async function updateStorageCabinet(cabinet: IUpdateCabinet) {
    await storageService.updateStorageCabinet(cabinet);
  }

  return {
    storageId,
    storage,        
    storagesAll,
    storages,
    containers,
    storagesThings,
    setStorageId,
    searchStorages,
    createStorageBox,
    createStorageCabinet,
    updateStorageBox,
    updateStorageCabinet
  };
});
