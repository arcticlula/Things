<template>
  <n-space justify="space-between" align="center">
    <n-gradient-text :size="24" type="success">
      Things
    </n-gradient-text>
    <n-button secondary circle type="primary">
      <template #icon><n-icon :component="SettingsSharp"></n-icon></template>
    </n-button>
  </n-space>
  <div class="search-things">
    <n-grid cols="24" item-responsive responsive="screen">
      <n-gi span="11">
        <n-input-group>
          <n-select v-model:value="searchType" :style="{ width: '150px' }" :options="searchOptions" />
          <n-input v-model:value="searchValue" type="text" :placeholder="searchPlaceholder" />
        </n-input-group>
      </n-gi>
      <n-gi span="4" offset="1">
          <n-button type="primary" secondary @click="search">Search</n-button>
      </n-gi>
      <n-gi span="7" offset="1" style="justify-self: self-end;">
        <n-button strong secondary type="info" @click="showCreateStorageModal = true" style="margin-right: 4px;">Create Storage</n-button>
        <n-button strong secondary type="info" @click="openCreateThingModal()">Create Thing</n-button>
      </n-gi>
      <n-gi span="24" class="search-things-tabs">
        <div v-if="searchType === 'things'">
          <ThingsView />
        </div>
        <div v-else><StoragesView /></div>
      </n-gi>
    </n-grid>
  </div>

  <CreateThingModal v-if="showCreateThingModal" v-model:showModal="showCreateThingModal"></CreateThingModal>
  <CreateStorageModal v-if="showCreateStorageModal" v-model:showModal="showCreateStorageModal"></CreateStorageModal>
</template>

<script lang="ts" setup>
import { SettingsSharp } from '@vicons/ionicons5';
import { useMessage } from "naive-ui";
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';

import StoragesView from "../views/StoragesView.vue";
import ThingsView from "../views/ThingsView.vue";

import { useStorageStore } from '../stores/storage';
import { useThingStore } from '../stores/thing';

const thingStore = useThingStore();
const storageStore = useStorageStore();

const { thingId } = storeToRefs(thingStore);
const { storageId, storagesAll } = storeToRefs(storageStore);

const message = useMessage();

// State variables
const showCreateThingModal = ref(false);
const showCreateStorageModal = ref(false);

const searchType = ref('things');
const searchValue = ref('');

const searchOptions = ref([
  { label: 'Things',  value: 'things'},
  { label: 'Storages', value: 'storages' }
]);

const searchPlaceholder = computed(() => searchType.value === 'things' ? 'Search Things...' : 'Search Storages...');

onMounted(() => {
  search();
})

const search = async () => {
  if(searchType.value === 'things') {
    await thingStore.searchThings(searchValue.value);
  }
  else if(searchType.value === 'storages') {
    await storageStore.searchStorages(searchValue.value);
  }
}

const openCreateThingModal = () => {
  if(storagesAll.value.length === 0) {
    message.warning("You have to create a storage first.");
    return;
  }
  showCreateThingModal.value = true;
}

watch(searchType, () => {
  thingId.value = 'xixi';
  storageId.value = 'xixi';
  searchValue.value = '';
  search();
});
</script>


<style scoped lang="sass">
  .search-things
    margin: 24px 0

  .search-things-tabs
    margin-top: 16px
    
</style>