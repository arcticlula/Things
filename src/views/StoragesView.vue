<template>
  <n-grid cols="24" class="search-storages-grid" item-responsive responsive="screen">
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
            <n-button v-if="storage" text @click="openStorageUpdateModal(storage?.type)"><n-icon :component="Edit" /></n-button>
          </div>
          <div class="search-storages-details">
            <div class="search-storages-details-canvas">
              <CanvasBox v-if="storage?.type === 'box'" ref="canvasBoxRef" :c_width="canvasWidth" :c_height="canvasHeight" />
              <CanvasCabinet v-else-if="storage?.type !== 'box'" ref="canvasCabinetRef" :c_width="canvasWidth" :c_height="canvasHeight" canSelect/>
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
</template>

<script lang="ts" setup>
import Edit from '@vicons/carbon/Edit';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

import CanvasBox from '../components/Canvas/CanvasBox.vue';
import CanvasCabinet from '../components/Canvas/CanvasCabinet.vue';
import { IType } from '../models/storage.model';
import { useStorageStore } from '../stores/storage';

const storageStore = useStorageStore();
const { storage } = storeToRefs(storageStore);

const showUpdateBoxModal = ref(false);
const showUpdateCabinetModal = ref(false);

const canvasWidth = 300;
const canvasHeight = 350;

const canvasBoxRef = ref<InstanceType<typeof CanvasBox> | null>(null);
const canvasCabinetRef = ref<InstanceType<typeof CanvasCabinet> | null>(null);

const openStorageUpdateModal = async (type: IType) => {
  switch(type) {
    case 'box': showUpdateBoxModal.value = true; break;
    default: showUpdateCabinetModal.value = true; break;
  }
}

const drawStorage = async () => {
  canvasCabinetRef.value?.draw();
  canvasBoxRef.value?.draw();
};

watch(storage.pending, async (pending) => {
  if (!pending && storage.value) {
    drawStorage();
  }
});

watch(storage, async () => {
  drawStorage();
})

</script>

<style scoped lang="sass">
  .search-storages-grid
    height: 75vh
  
  .search-storages-layout
    height: 100%
    padding: 24px

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
    background-color: rgba(255, 255, 255, 0.05)
    margin: 24px 8px 0 8px

  .search-storages-details-canvas-empty
    display: flex
    justify-content: center
    align-items: center

  .search-storages-details-description
    width: 100%
    margin: 24px 0 0 32px
    
</style>