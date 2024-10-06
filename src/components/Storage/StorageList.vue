<template>
  <n-data-table
  v-model:checked-row-keys="checkedRowKeys"
  :single-line="false"
  :row-key="rowKey"
  :columns="columns"
  :data="storages"
  max-height="65vh" 
  children-key="drawers"
  :row-class-name="rowClassName"
  :row-props="rowProps"
  @update:checked-row-keys="handleSelection"
  />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useCollection } from "vuefire";

import { IStorage } from '../../models/storage.model';
import storageService from '../../services/storage.service';

const props = defineProps<{
  storageId: string;
}>();

const emit = defineEmits(['update:storageId']);

const storageId = computed({
  get: () => props.storageId,
  set: (value: string) => emit('update:storageId', value)
});

const storagesMainQuery = storageService.storagesMainQuery;
const storages = useCollection(storagesMainQuery);

const rowKey = (row: IStorage) => row.id; 
const checkedRowKeys = ref([] as string[]);

const rowClassName = (row: IStorage) => {
  return row.id === storageId.value ? 'selected-row' : '';
};

const columns = [
  {
    type: 'selection',
    multiple: false,
  },
  {
    title: 'Name',
    key: 'name'
  }
]

const rowProps = (row: IStorage) => {
  return {
    onClick: () => handleRowClick(row),
    style: { cursor: 'pointer' }
  };
};

const handleRowClick = (row: IStorage) => {
  checkedRowKeys.value = [row.id] as string[]
  handleSelection(checkedRowKeys.value);
}

watch(storages.pending, async (pending) => {
  if(!pending && storages.value.length > 0) {
    checkedRowKeys.value = [storages.value[0].id] as string[]
    handleSelection(checkedRowKeys.value);
  }
});

const handleSelection = (ids: string[]) => {
  storageId.value = ids[0];
}

watch(props, async () => {
  checkedRowKeys.value = [props.storageId] as string[]
});

</script>

<style scoped lang="sass">
  :deep(.selected-row td)
    background-color: #243534

  :deep(.selected-row:hover td)
    background-color: #243534 !important
</style>