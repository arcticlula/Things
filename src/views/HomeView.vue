<template>
  <n-space justify="space-between" align="center">
    <n-gradient-text :size="24" type="success">
      Things
    </n-gradient-text>
    <n-button secondary circle type="primary">
      <template #icon>
        <n-icon :component="SettingsSharp"></n-icon>
      </template>
    </n-button>
  </n-space>
  <div class="search-things">
    <n-grid cols="24" item-responsive responsive="screen">
      <n-gi span="11">
          <n-input v-model:value="searchValue" type="text" placeholder="Search..." />
      </n-gi>
      <n-gi span="4" offset="1">
          <n-button type="primary" @click="search">Search</n-button>
      </n-gi>
      <n-gi span="7" offset="1" style="justify-self: self-end;">
        <n-button strong secondary type="info" @click="showCreateStorageModal = true" style="margin-right: 4px;">Create Storage</n-button>
        <n-button strong secondary type="info" @click="showCreateThingModal = true">Create Thing</n-button>
      </n-gi>
      <n-gi span="24" class="search-things-tabs">
        <n-tabs v-model:value="tab" type="segment" animated>
          <n-tab-pane key="things" tab="Things" name="things">
            <ThingsView></ThingsView>
          </n-tab-pane>
          <n-tab-pane key="storages" tab="Storages" name="storages">
            <StoragesView></StoragesView>
          </n-tab-pane>
        </n-tabs>
      </n-gi>
    </n-grid>
  </div>

  <CreateThingModal v-if="showCreateThingModal" v-model:showModal="showCreateThingModal"></CreateThingModal>
  <CreateStorageModal v-if="showCreateStorageModal" v-model:showModal="showCreateStorageModal"></CreateStorageModal>
</template>

<script lang="ts" setup>
  import { SettingsSharp } from '@vicons/ionicons5';
  import { ref } from 'vue';
  import ThingsView from "../views/ThingsView.vue";
  import StoragesView from "../views/StoragesView.vue";

  import thingService from '../services/thing.service';
  import storageService from '../services/storage.service';

  const tab = ref('things');

  // State variables
  const showCreateThingModal = ref(false);
  const showCreateStorageModal = ref(false);

  const searchValue = ref("");

  const search = async () => {
    if(tab.value === 'things') {
      await thingService.searchThings(searchValue.value);
    }
    else if(tab.value === 'storages') {
      await storageService.searchStorages(searchValue.value);
    }
  }

</script>


<style scoped lang="sass">
  .search-things
    margin: 24px 0

  .search-things-tabs
    margin-top: 16px
    
</style>