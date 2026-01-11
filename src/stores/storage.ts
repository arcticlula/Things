import { doc } from 'firebase/firestore';
import { defineStore, storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useCollection, useDocument } from 'vuefire';
import storageService from '../services/storage.service';
import { ICreateBox, ICreateCabinet, ICreateOrganizer, IUpdateBox, IUpdateCabinet, IUpdateOrganizer } from '../models/storage.model';
import { useUserStore } from './user';

export const useStorageStore = defineStore('storageStore', () => {
  const { userId } = storeToRefs(useUserStore());
  const storageId = ref<string | null>(null);

  const storageDoc = computed(() => {
    return storageId.value ? doc(storageService.getStoragesColl(userId.value), storageId.value) : null;
  });

  const storagesQuery = storageService.storagesQuery;
  const containersQuery = storageService.containersQuery;
  const storagesThingsQuery = computed(() => storageService.storagesThingsQuery(userId.value));

  const _storage = useDocument(storageDoc);
  const storage = computed(() => storageId.value ? _storage.value : null);
  const storagePending = _storage.pending;
  const storages = useCollection(computed(() => userId.value ? storagesQuery.value : null));
  const storagesAll = useCollection(computed(() => userId.value ? storageService.getStoragesColl(userId.value) : null));
  const containers = useCollection(computed(() => userId.value ? containersQuery.value : null));
  const storagesThings = useCollection(storagesThingsQuery);

  function setStorageId(id: string) {
    storageId.value = id;
  }

  async function searchStorages(value: string) {
    await storageService.searchStorages(userId.value, value);
  }

  async function createStorageBox(box: ICreateBox) {
    await storageService.createStorageBox(userId.value, box);
  }

  async function createStorageCabinet(cabinet: ICreateCabinet) {
    await storageService.createStorageCabinet(userId.value, cabinet);
  }

  async function createStorageOrganizer(organizer: ICreateOrganizer) {
    await storageService.createStorageOrganizer(userId.value, organizer);
  }

  async function updateStorageBox(box: IUpdateBox) {
    await storageService.updateStorageBox(userId.value, box);
  }

  async function updateStorageCabinet(cabinet: IUpdateCabinet) {
    await storageService.updateStorageCabinet(userId.value, cabinet);
  }

  async function updateStorageOrganizer(organizer: IUpdateOrganizer) {
    await storageService.updateStorageOrganizer(userId.value, organizer);
  }

  async function swapStorages(id1: string, id2: string) {
    await storageService.swapStorages(userId.value, id1, id2);
  }

  return {
    storageId,
    storage,
    storagePending,
    storagesAll,
    storages,
    containers,
    storagesThings,
    setStorageId,
    searchStorages,
    createStorageBox,
    createStorageCabinet,
    createStorageOrganizer,
    updateStorageBox,
    updateStorageCabinet,
    updateStorageOrganizer,
    swapStorages,
    $reset: () => {
      storageId.value = null;
    }
  };
});
