<template>
  <n-breadcrumb separator=">" v-if="storageId">
    <n-breadcrumb-item v-for="bc in breadcrumbs" :key="bc.id" :class="{'breadcrumb-selected': (bc.id === storageId)}" @click="goToStorage(bc.id)" :clickable="!readonly">
      {{ bc.name }}
    </n-breadcrumb-item>
  </n-breadcrumb>
  <span class="breadcrumb-no-storage" v-else>No Storage Assigned</span>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';

import { IStorage } from '../../models/storage.model';
import { useStorageStore } from '../../stores/storage';

const props = defineProps<{
    readonly?: boolean;
    id?: string;
}>();

const storageStore = useStorageStore();
const { storageId: stgId, storagesAll } = storeToRefs(storageStore);

const breadcrumbs = ref([] as { id: string; name: string }[]);

const storageId = computed({
  get() {
    return props.id || stgId.value;
  },
  set(newValue) {
    stgId.value = newValue;
  }
})


const buildPathToStorage = (storageId: string | null, storages: IStorage[]) => {
  if (!storageId) return [];
  const storageMap = new Map<string | null, IStorage>();
  storages.forEach(storage => storageMap.set(storage.id, storage));
  const path: { id: string; name: string }[] = [];

  // Function to build the path from the given storage/drawer back to the root
  const buildPath = (currentId: string | null) => {
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
  if (props.readonly) return;
  storageId.value = id;
}

const recreatePath = () => {
    if(!storageId.value) {
        breadcrumbs.value = [];
        return;
    }
    // Optimization to avoid recalc if already correct? Removed for safety when storageId changes
    if (storagesAll.value) breadcrumbs.value = buildPathToStorage(storageId.value, storagesAll.value as IStorage[]);
}

watch(storageId, () => {
  recreatePath();
});

watch(storagesAll, () => {
    recreatePath();
}, { immediate: true });


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

.breadcrumb-no-storage
    display: inline-flex
    align-items: center
    box-sizing: border-box
    padding: 4px
    color: rgba(255, 255, 255, 0.52)
    height: 25.5px
</style>
  