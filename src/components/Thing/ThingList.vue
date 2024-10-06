<template>
  <n-data-table
    v-model:checked-row-keys="checkedRowKeys"
    :single-line="false"
    :row-key="rowKey"
    :columns="columns"
    :data="things"
    max-height="65vh" 
    :row-class-name="rowClassName"
    :row-props="rowProps"
    @update:checked-row-keys="handleSelection"
  />
</template>

<script setup lang="ts">
import { NTag } from 'naive-ui';
import { h, ref, watch } from 'vue';
import { useCollection } from "vuefire";

import { IThing } from '../../models/thing.model';
import thingService from '../../services/thing.service';

const emit = defineEmits(['update:thingId']);

const rowKey = (row: IThing) => row.id; 
const checkedRowKeys = ref([] as string[]);
const selectedRowKey = ref('');

const rowClassName = (row: IThing) => {
  return row.id === selectedRowKey.value ? 'selected-row' : '';
};

const columns = [
  {
    type: 'selection',
    multiple: false,
  },
  {
    title: 'Name',
    key: 'name'
  },
  {
    title: 'Tags',
    key: 'tags',
    ellipsis: true,
    render(row: IThing) {
      const tags = row.tags?.map((tag) => {
        return h(NTag,
          {
            style: {
              marginRight: '6px'
            },
            type: 'info',
            bordered: false,
            size: 'small'
          },
          {
            default: () => tag.name
          }
        )
      })
      return tags
    }
  }
]

const rowProps = (rowData: IThing) => {
  return {
    onClick: () => handleRowClick(rowData),
    style: { cursor: 'pointer' }
  };
};

// const message = useMessage();

const thingsQuery = thingService.thingsQuery;
const things = useCollection(thingsQuery);

watch(things.pending, async (pending) => {
  if(!pending && things.value.length > 0) {
    checkedRowKeys.value = [things.value[0].id] as string[]
    handleSelection(checkedRowKeys.value);
  }
});

const handleRowClick = (row: IThing) => {
  checkedRowKeys.value = [row.id] as string[]
  handleSelection(checkedRowKeys.value);
}

const handleSelection = (ids: string[]) => {
  selectedRowKey.value = ids[0];
  emit('update:thingId', selectedRowKey.value)
}

</script>

<style scoped lang="sass">
  :deep(.selected-row td)
    background-color: #243534

  :deep(.selected-row:hover td)
    background-color: #243534 !important
</style>