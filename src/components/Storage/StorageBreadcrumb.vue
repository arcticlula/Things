<template>
    <n-breadcrumb separator=">">
        <n-breadcrumb-item v-for="bc in breadcrumbs" :key="bc.id" :class="{'breadcrumb-selected': (bc.id === storageId)}" @click="goToStorage(bc.id)" clickable>
        {{ bc.name }}
        </n-breadcrumb-item>
    </n-breadcrumb>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

import { IStorage } from '../../models/storage.model';
import { useStorageStore } from '../../stores/storage';

const storageStore = useStorageStore();
const { storageId, storagesAll } = storeToRefs(storageStore);

const breadcrumbs = ref([] as { id: string; name: string }[]);

const buildPathToStorage = (storageId: string, storages: IStorage[]) => {
  const storageMap = new Map<string, IStorage>();
  storages.forEach(storage => storageMap.set(storage.id, storage));

  const path: { id: string; name: string }[] = [];

  // Function to build the path from the given storage/drawer back to the root
  const buildPath = (currentId: string) => {
    const storage = storageMap.get(currentId);
    if (!storage) return; // Stop if no storage is found (invalid ID or no parent)

    // Add current storage to path
    path.unshift({
      id: storage.id,
      name: storage.name,
    });

    // If it has a parent, continue building the path upwards
    if (storage.parent) {
      buildPath(storage.parent.id); // Recursively traverse up the parent chain
    }
  };

  // Start by checking if the given ID belongs to a storage or a drawer
  const targetStorage = storageMap.get(storageId);

  if (targetStorage) {
    // If it's a storage, we start building the path from it
    buildPath(targetStorage.id);
  } else {
    // If it's a drawer, we need to find which storage contains this drawer
    for (const storage of storages) {
      const drawer = storage.drawers?.find(d => d.id === storageId);
      if (drawer) {
        // If drawer found, add it to the path and build the path for its parent storage
        path.unshift({
          id: drawer.id,
          name: drawer.name,
        });
        buildPath(storage.id); // Build the path for the storage this drawer belongs to
        break;
      }
    }
  }

  return path;
};

const goToStorage = (id: string) => {
  storageId.value = id;
}

const recreatePath = () => {
  if(breadcrumbs.value.find(s => s.id === storageId.value)) return;
  if (storagesAll.value) breadcrumbs.value = buildPathToStorage(storageId.value, storagesAll.value as IStorage[]);
}

watch(storageId, () => {
  recreatePath();
});

defineExpose({
  recreatePath
});
</script>
<style scoped lang="sass">
:deep(.n-breadcrumb-item:last-child .n-breadcrumb-item__link)
    color: var(--n-item-text-color)
    cursor: pointer

.breadcrumb-selected :deep(.n-breadcrumb-item__link)
    color: var(--n-item-text-color-active) !important
</style>
  