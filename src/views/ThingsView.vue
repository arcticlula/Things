<template>
  <n-grid cols="24" class="search-things-grid" item-responsive responsive="screen">
    <n-gi span="8">
      <n-layout embedded class="search-things-layout">
        <ThingList></ThingList>
      </n-layout>
    </n-gi>
    <n-gi span="16">
      <n-layout embedded class="search-things-layout">
        <n-card class="search-things-card" content-class="search-things-card-content">
          <div class="search-things-card-header">
            <StorageBreadcrumb></StorageBreadcrumb>
            <n-button v-if="storage" text @click="openThingUpdateModal()"><n-icon :component="Edit" /></n-button>
          </div>
          <div v-if="storage" class="search-things-details">
            <div class="search-things-details-description">
              <ThingDescription></ThingDescription>
            </div>
            <div class="search-things-details-canvas">
              <CanvasBox v-if="storage.type === 'box'" ref="canvasBoxRef" :c_width="canvasWidth" :c_height="canvasHeight" />
              <CanvasCabinet v-else-if="storage.type !== 'box'" ref="canvasCabinetRef" :c_width="canvasWidth" :c_height="canvasHeight" />    
            </div>
          </div>
        </n-card>
      </n-layout>
    </n-gi>
  </n-grid>
  <UpdateThingModal v-if="showUpdateThingModal" v-model:showModal="showUpdateThingModal"></UpdateThingModal>
</template>

<script lang="ts" setup>
import Edit from '@vicons/carbon/Edit';
import { storeToRefs } from 'pinia';
import { nextTick, ref, watch } from 'vue';

import CanvasBox from '../components/Canvas/CanvasBox.vue';
import CanvasCabinet from '../components/Canvas/CanvasCabinet.vue';
import { useStorageStore } from '../stores/storage';
import { useThingStore } from '../stores/thing';

const canvasBoxRef = ref<InstanceType<typeof CanvasBox> | null>(null);
const canvasCabinetRef = ref<InstanceType<typeof CanvasCabinet> | null>(null);

const thingStore = useThingStore();
const storageStore = useStorageStore();

const { thing } = storeToRefs(thingStore);
const { storageId, storage } = storeToRefs(storageStore);

const showUpdateThingModal = ref(false);

const canvasWidth = 300;
const canvasHeight = 350;

const openThingUpdateModal = async () => {
  showUpdateThingModal.value = true;
}

const drawStorage = async () => {
  canvasCabinetRef.value?.draw();
  canvasBoxRef.value?.draw();
};

watch(thing?.pending, async (pending) => {
  if (!pending && thing?.value) {
    await nextTick();
    storageId.value = thing.value.storage?.id;
  }
});

watch(storage.pending, async (pending) => {
  if (!pending && storage.value) {
    drawStorage();
  }
});
</script>

<style scoped lang="sass">
  .search-things-grid
    height: 75vh
  
  .search-things-layout
    height: 100%
    padding: 24px

  .search-things-card
    display: flex
    height: 100%

  .search-things-card-header
    display: flex
    justify-content: space-between
    width: 100%

  :deep(.search-things-card-content)
    display: flex 
    flex-direction: column
    width: 100%

  .search-things-details
    display: flex
    align-items: flex-start
    width: 100%
    height: 100%

  .search-things-details-description
    width: 100%
    margin: 24px 0 0 32px 

  .search-things-details-canvas
    display: flex
    background-color: rgba(255, 255, 255, 0.05)
    margin: 24px 16px 0 8px

  .search-things-details-canvas-empty
    display: flex
    justify-content: center
    align-items: center
    
</style>