<template>
  <n-grid cols="24" :x-gap="24" class="search-storages-grid" :class="{ 'is-wide': isWide, 'is-box': storage?.type === 'box' }" item-responsive responsive="screen">
    <n-gi span="8">
      <n-layout embedded class="search-storages-layout">
        <StorageList></StorageList>
      </n-layout>
    </n-gi>
    <n-gi span="16">
      <n-layout embedded class="search-storages-layout">
        <n-card class="search-storages-card" content-class="search-storages-card-content">
          <div class="search-storages-card-header">
            <StorageBreadcrumb />
            <div>
              <n-button v-if="storage?.type === 'drawer'" text @click="openSwapStorageModal" style="margin-right: 8px"><n-icon :component="ArrowsHorizontal" /></n-button>
              <n-button v-if="storage" text @click="openStorageUpdateModal(storage?.type)"><n-icon :component="Edit" /></n-button>
            </div>
          </div>
          <div class="search-storages-details">
            <div class="search-storages-details-canvas" :style="{ 'min-width': canvasMinWidth + 'px' }">
              <CanvasBox v-if="storage?.type === 'box'" :c_width="canvasWidth" :c_height="canvasHeight" :storage="storage"/>
              <CanvasCabinet v-else-if="storage?.type === 'cabinet' || storage?.type === 'drawer'" :c_width="canvasWidth" :c_height="canvasHeight" :storage="hydratedCabinet" :selectedId="selectedDrawerId" canSelect @selected="handleSelected"/>
              <CanvasOrganizer v-else-if="storage?.type === 'organizer' || storage?.type === 'slot'" :c_width="canvasWidth" :c_height="canvasHeight" :storage="hydratedOrganizer" :selectedId="selectedSlotId" canSelect @selected="handleSelected"/>
            </div>
            <div class="search-storages-details-description">
              <StorageDescription></StorageDescription>
            </div>
          </div>
        </n-card>
      </n-layout>
    </n-gi>
  </n-grid>
  <UpdateBoxModal v-if="showUpdateBoxModal" v-model:showModal="showUpdateBoxModal" />
  <UpdateCabinetModal v-if="showUpdateCabinetModal" v-model:showModal="showUpdateCabinetModal" />
  <UpdateOrganizerModal v-if="showUpdateOrganizerModal" v-model:showModal="showUpdateOrganizerModal" />
  <SwapStorageModal :currentStorageId="currentStorageId" v-if="showSwapStorageModal" v-model:showModal="showSwapStorageModal" />
</template>

<script lang="ts" setup>
import Edit from '@vicons/carbon/Edit';
import ArrowsHorizontal from '@vicons/carbon/ArrowsHorizontal';
import { storeToRefs } from 'pinia';
import { ref, watch, onBeforeUnmount, computed } from 'vue';

import CanvasCabinet from '../components/Canvas/CanvasCabinet.vue';
import CanvasOrganizer from '../components/Canvas/CanvasOrganizer.vue';

import StorageBreadcrumb from '../components/Storage/StorageBreadcrumb.vue';

import { IType, IStorage } from '../models/storage.model';
import { useStorageStore } from '../stores/storage';
import { hydrateCabinet, getSelectedDrawerId, hydrateOrganizer, getSelectedSlotId } from '../utils/storage.utils';
import { calculateCanvasDimensions } from '../utils/canvas.utils';

const storageStore = useStorageStore();
const { storage, storageId, storagePending, storagesAll } = storeToRefs(storageStore);
const currentStorageId = ref<string | null>(null);

const showUpdateBoxModal = ref(false);
const showUpdateCabinetModal = ref(false);
const showUpdateOrganizerModal = ref(false);
const showSwapStorageModal = ref(false);

const maxCanvasWidth = 500;
const maxCanvasHeight = 450;

const canvasDimensions = computed(() => {
  return calculateCanvasDimensions(storage.value, maxCanvasWidth, maxCanvasHeight);
});

const canvasWidth = computed(() => canvasDimensions.value.width);
const canvasHeight = computed(() => canvasDimensions.value.height);
const canvasMinWidth = computed(() => canvasWidth.value < 300 ? 300 : canvasWidth.value);

const isWide = computed(() => canvasWidth.value > canvasHeight.value);

const storageBreadcrumbRef = ref<InstanceType<typeof StorageBreadcrumb> | null>(null);

const hydratedCabinet = computed(() => {
  return hydrateCabinet(storage.value, storagesAll.value as IStorage[]);
});

const hydratedOrganizer = computed(() => {
  return hydrateOrganizer(storage.value, storagesAll.value as IStorage[]);
});

const selectedDrawerId = computed(() => {
  return getSelectedDrawerId(storage.value);
});

const selectedSlotId = computed(() => {
  return getSelectedSlotId(storage.value);
});

const openStorageUpdateModal = async (type: IType) => {
  switch(type) {
    case 'box': 
      showUpdateBoxModal.value = true; 
      break;
    case 'cabinet':
    case 'drawer':
      showUpdateCabinetModal.value = true; 
      break;
    case 'organizer': 
    case 'slot': 
      showUpdateOrganizerModal.value = true; 
      break;
  }
}

const openSwapStorageModal = () => {
  currentStorageId.value = storageId.value;
  showSwapStorageModal.value = true;
}

const handleSelected = (id: string) => {
  storageId.value = id;
}

watch(storagePending, async (pending) => {
  if (!pending && storage.value) {
    storageBreadcrumbRef.value?.recreatePath();
  }
});

onBeforeUnmount(() => {
  storageId.value = '';
});

</script>

<style scoped lang="sass">
  .search-storages-grid
    height: 75vh
  
  .search-storages-layout
    height: 100%
    padding: 24px 0

  .search-storages-card
    display: flex
    height: 100%

  .search-storages-card-header
    display: flex
    justify-content: space-between
    width: 100%

  :deep(.search-storages-card-content)
    display: flex 
    flex-direction: column
    width: 100%

  .search-storages-details
    display: flex
    align-items: flex-start
    width: 100%
    height: 100%

  .search-storages-details-canvas
    display: flex
    justify-content: center
    margin: 24px 8px 0 2px

  .search-storages-details-description
    width: 100%
    margin: 24px 0 0 32px

  .is-wide
    .search-storages-details
      flex-direction: column
      align-items: center

    .search-storages-details-canvas
      margin: 24px 0 0 0

    .search-storages-details-description
      margin: 0 0 0 32px

  .is-wide.is-box
    .search-storages-details-description
      margin: -24px 0 0 32px
    
</style>