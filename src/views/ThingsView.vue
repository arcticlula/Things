<template>
  <n-grid cols="24" :x-gap="24" class="search-things-grid" :class="{ 'is-wide': isWide }" item-responsive responsive="screen">
    <n-gi span="10">
      <n-layout embedded class="search-things-layout">
        <ThingList></ThingList>
      </n-layout>
    </n-gi>
    <n-gi span="14">
      <n-layout embedded class="search-things-layout">
        <n-card class="search-things-card" content-class="search-things-card-content">
          <div class="search-things-card-header">
            <StorageBreadcrumb :id="previewStorage?.id" readonly></StorageBreadcrumb>
            <n-button v-if="thing" text @click="openThingUpdateModal()"><n-icon :component="Edit" /></n-button>
          </div>
          <div v-if="thing" class="search-things-details">
            <div class="search-things-details-description">
              <ThingDescription :is-wide="isWide"></ThingDescription>
            </div>
            <div class="search-things-details-canvas" :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }">
              <CanvasBox v-if="previewStorage?.type === 'box'" :c_width="canvasWidth" :c_height="canvasHeight" :storage="previewStorage" />
              <CanvasCabinet v-else-if="previewStorage?.type === 'cabinet' || previewStorage?.type === 'drawer'" :c_width="canvasWidth" :c_height="canvasHeight" :storage="hydratedCabinet" :selectedId="selectedDrawerId" /> 
              <CanvasOrganizer v-else-if="previewStorage?.type === 'organizer' || previewStorage?.type === 'slot'" :c_width="canvasWidth" :c_height="canvasHeight" :storage="hydratedOrganizer" :selectedId="selectedSlotId" />
              <div class="search-things-details-canvas-empty" :style="{ width: '300px', height: '300px', color: 'rgba(255, 255, 255, 0.3)' }" v-else>   
                <n-empty description="No storage assigned" />
              </div>
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
import { computed, ref } from 'vue';

import CanvasBox from '../components/Canvas/CanvasBox.vue';
import CanvasCabinet from '../components/Canvas/CanvasCabinet.vue';
import CanvasOrganizer from '../components/Canvas/CanvasOrganizer.vue';
import { useStorageStore } from '../stores/storage';
import { useThingStore } from '../stores/thing';
import { hydrateCabinet, getSelectedDrawerId, hydrateOrganizer, getSelectedSlotId } from '../utils/storage.utils';
import { IStorage } from '../models/storage.model';
import { calculateCanvasDimensions } from '../utils/canvas.utils';

const thingStore = useThingStore();
const storageStore = useStorageStore();

const { thing } = storeToRefs(thingStore);
const { storagesAll } = storeToRefs(storageStore);

const showUpdateThingModal = ref(false);

const maxCanvasWidth = 400;
const maxCanvasHeight = 400;

const canvasDimensions = computed(() => calculateCanvasDimensions(previewStorage.value, maxCanvasWidth, maxCanvasHeight));

const canvasWidth = computed(() => canvasDimensions.value.width);
const canvasHeight = computed(() => canvasDimensions.value.height);

const previewStorage = computed(() => {
  let stgId: string | null = null;
  if (thing.value?.storage) {
    if (typeof thing.value.storage === 'string') {
      const parts = thing.value.storage.split('/');
      stgId = parts[parts.length - 1];
    } else if (thing.value.storage?.id) {
      stgId = thing.value.storage.id;
    }
  }
  return (storagesAll.value as IStorage[]).find(s => s.id === stgId) || null;
});

const hydratedCabinet = computed(() => hydrateCabinet(previewStorage.value, storagesAll.value as IStorage[]));
const hydratedOrganizer = computed(() => hydrateOrganizer(previewStorage.value, storagesAll.value as IStorage[]));

const selectedDrawerId = computed(() => getSelectedDrawerId(previewStorage.value));
const selectedSlotId = computed(() => getSelectedSlotId(previewStorage.value));

const isWide = computed(() => canvasWidth.value > canvasHeight.value);

const openThingUpdateModal = async () => {
  showUpdateThingModal.value = true;
}
</script>

<style scoped lang="sass">
  .search-things-grid
    height: 75vh
  
  .search-things-layout
    height: 100%
    padding: 24px 0

  .search-things-card
    display: flex

  .search-things-card-header
    display: flex
    justify-content: space-between
    width: 100%

  :deep(.search-things-card-content)
    display: flex 
    flex-direction: column
    width: 100%
    padding-bottom: 32px

  .search-things-details
    display: grid
    gap: 16px
    grid-template-columns: 1fr 1fr

  .search-things-details-description
    width: 100%
    margin-top: 24px
    margin-left: 20px

  .search-things-details-canvas
    display: flex
    align-items: center
    justify-content: center
    justify-self: center
    margin: 24px 16px 0

  .search-things-details-canvas-empty
    display: flex
    justify-content: center
    align-items: center
    background-color: rgba(255, 255, 255, 0.05)

  .is-wide
    .search-things-card-header
      margin-bottom: 16px
    
    .search-things-details
      grid-template-rows: auto 1fr
      grid-template-columns: unset

    .search-things-details-canvas
      justify-self: center
      align-self: center
      order: -1
      margin: 0
    
</style>