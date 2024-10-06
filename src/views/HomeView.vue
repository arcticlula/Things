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
        <n-input-group>
          <!-- <n-radio-group v-model:value="searchType">
            <n-radio-button
              v-for="opt in searchOptions"
              :key="opt.value"
              :value="opt.value"
              :label="opt.label"
            />
          </n-radio-group> -->
          <n-select v-model:value="searchType" :style="{ width: '120px' }" :options="searchOptions" />
          <n-input v-model:value="searchValue" type="text" :placeholder="searchPlaceholder" />
        </n-input-group>
      </n-gi>
      <n-gi span="4" offset="1">
          <n-button type="primary" secondary @click="search">Search</n-button>
      </n-gi>
      <n-gi span="7" offset="1" style="justify-self: self-end;">
        <n-button strong secondary type="info" @click="showCreateStorageModal = true" style="margin-right: 4px;">Create Storage</n-button>
        <n-button strong secondary type="info" @click="showCreateThingModal = true">Create Thing</n-button>
      </n-gi>
      <n-gi span="24" class="search-things-tabs">
        <div v-if="searchType === 'things'">
            <ThingsView></ThingsView>
        </div>
        <div v-else>
            <StoragesView></StoragesView>
        </div>
      </n-gi>
    </n-grid>
  </div>

  <CreateThingModal v-if="showCreateThingModal" v-model:showModal="showCreateThingModal"></CreateThingModal>
  <CreateStorageModal v-if="showCreateStorageModal" v-model:showModal="showCreateStorageModal"></CreateStorageModal>
</template>

<script lang="ts" setup>
  import { SettingsSharp } from '@vicons/ionicons5';
  import { computed, ref } from 'vue';
  import ThingsView from "../views/ThingsView.vue";
  import StoragesView from "../views/StoragesView.vue";

  import thingService from '../services/thing.service';
  import storageService from '../services/storage.service';

  // State variables
  const showCreateThingModal = ref(false);
  const showCreateStorageModal = ref(false);
  
  const searchType = ref('things');
  const searchValue = ref('');
  const searchPlaceholder = computed(() => searchType.value === 'things' ? 'Search Things...' : 'Search Storages...');

  const searchOptions = ref([
    { label: 'Things',  value: 'things'},
    { label: 'Storages', value: 'storages' }
  ]);

  const search = async () => {
    if(searchType.value === 'things') {
      await thingService.searchThings(searchValue.value);
    }
    else if(searchType.value === 'storages') {
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