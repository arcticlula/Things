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
import { NTag, type DataTableColumns } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { h, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { IThing } from '../../models/thing.model';
import { useThingStore } from '../../stores/thing';

const thingStore = useThingStore();
const { thingId, things } = storeToRefs(thingStore);
const router = useRouter();
const route = useRoute();

const checkedRowKeys = ref([] as string[]);

const columns: DataTableColumns<IThing> = [
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
              marginRight: '6px',
              cursor: 'pointer'
            },
            type: 'info',
            bordered: false,
            size: 'small',
            onClick: (e: MouseEvent) => {
              e.stopPropagation();
              router.push({ query: { ...route.query, q: tag.name, exact: 'true' } });
            }
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

onMounted(() => {
  if(things.value.length > 0) selectThing(things.value[0].id);
})

const rowKey = (row: IThing) => row.id; 

const rowClassName = (row: IThing) => {
  return row.id === thingId.value ? 'selected-row' : '';
};

const rowProps = (rowData: IThing) => {
  return {
    onClick: () => handleRowClick(rowData),
    style: { cursor: 'pointer' }
  };
};

const handleRowClick = (row: IThing) => {
  selectThing(row.id);
}

const handleSelection = (ids: string[]) => {
  thingId.value = ids[0];
}

const setRowChecked = (id: string) => {
  checkedRowKeys.value = [id] as string[];
}

const selectThing = (id: string) => {
  setRowChecked(id);
  handleSelection(checkedRowKeys.value);
}

watch(things, async () => {
  if(things.value.length > 0) {
    const currentSelectionExists = things.value.some((thing: IThing) => thing.id === thingId.value);
    if (!thingId.value || thingId.value === 'xixi' || !currentSelectionExists) {
      selectThing(things.value[0].id);
    }
  }
})

</script>

<style scoped lang="sass">
  :deep(.selected-row td)
    background-color: #243534

  :deep(.selected-row:hover td)
    background-color: #243534 !important
</style>