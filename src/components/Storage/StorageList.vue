<template>
  <n-data-table
  v-model:checked-row-keys="checkedRowKeys"
  :row-key="rowKey"
  :columns="columns"
  :data="containers"
  :expanded-row-keys="expandedKeys"
  @update:expanded-row-keys="onExpandedChange"
  max-height="65vh" 
  children-key="drawers"
  :row-class-name="rowClassName"
  :row-props="rowProps"
  @update:checked-row-keys="handleSelection"
  />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { IStorage } from '../../models/storage.model';
import { useStorageStore } from '../../stores/storage';

const storageStore = useStorageStore();
const { storageId, storage, containers } = storeToRefs(storageStore);

const columns = [
  {
    type: 'selection',
    multiple: false
  },
  {
    title: 'Name',
    key: 'name'
  }
]

onMounted(() => {
  if(containers.value.length > 0) selectStorage(containers.value[0].id);
})

const rowKey = (row: IStorage) => row.id; 
const checkedRowKeys = ref([] as string[]);
const expandedKeys = ref([] as string[]);

const rowClassName = (row: IStorage) => {
  return row.id === storageId.value ? 'selected-row' : '';
};

const rowProps = (row: IStorage) => {
  return {
    onClick: () => handleRowClick(row),
    style: { cursor: 'pointer' }
  };
};

const onExpandedChange = (keys: string[]) => {
  expandedKeys.value = keys;
};

const handleRowClick = (row: IStorage) => {
  selectStorage(row.id);
}

const handleSelection = (ids: string[]) => {
  storageId.value = ids[0];
}

const setRowChecked = (id: string) => {
  checkedRowKeys.value = [id] as string[];
}

const selectStorage = (id: string) => {
  setRowChecked(id)
  handleSelection(checkedRowKeys.value);
}

watch(storageId, async () => {
  setRowChecked(storageId.value)
});

watch(storage.pending, async (pending) => {
  if(!pending && storage.value) {
    if(storage.value?.type === 'drawer') {
      const parentKey = storage.value.parent.id;

      if (!expandedKeys.value.includes(parentKey)) {
        expandedKeys.value = [parentKey];
      }
    }
  }
});

watch(containers.pending, async (pending) => {
  if(!pending && containers.value.length > 0) {
    selectStorage(containers.value[0].id);
  }
});
</script>

<style scoped lang="sass">
  :deep(.selected-row td)
    background-color: #243534

  :deep(.selected-row:hover td)
    background-color: #243534 !important
</style>