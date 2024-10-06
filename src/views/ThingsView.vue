<template>
  <n-grid cols="24" class="search-things-grid" item-responsive responsive="screen">
    <n-gi span="8">
      <n-layout embedded class="search-things-layout">
        <ThingList @update:thingId="handleThingIdUpdate"></ThingList>
      </n-layout>
    </n-gi>
    <n-gi span="16">
      <n-layout embedded class="search-things-layout">
        <n-card class="search-things-card" content-class="search-things-card-content">
          <div class="search-things-card-header">
            <n-breadcrumb separator=">">
              <n-breadcrumb-item v-for="bc in breadcrumbs" :key="bc.id" @click="goToStorage(bc)" clickable>
              {{ bc.name }}
              </n-breadcrumb-item>
            </n-breadcrumb>
            <n-button v-if="storage" text @click="openThingUpdateModal()"><n-icon :component="Edit" /></n-button>
          </div>
          <div v-if="storage" class="search-things-details">
            <div class="search-things-details-description">
              <ThingDescription :thing="thingDB"></ThingDescription>
            </div>
            <div class="search-things-details-canvas">
              <CanvasBox v-if="storage.type === 'box'" ref="canvasBoxRef" :c_width="canvasWidth" :c_height="canvasHeight" />
              <CanvasCabinet v-else-if="storage.type === 'drawer'" ref="canvasCabinetRef" :c_width="canvasWidth" :c_height="canvasHeight" :selectedDrawer="storageId" />    
              <div class="search-storages-details-canvas-empty" :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }" v-else>   
                <n-empty description="No storage selected" />
              </div> 
            </div>
          </div>
        </n-card>
      </n-layout>
    </n-gi>
  </n-grid>
  <UpdateThingModal v-if="showUpdateThingModal" v-model:showModal="showUpdateThingModal" @update:storageId="handleStorageIdUpdate" :thing="thingDB"></UpdateThingModal>
</template>

<script lang="ts" setup>
  import Edit from '@vicons/carbon/Edit';
  import { doc } from 'firebase/firestore';
  import { nextTick, ref, watch, computed, Ref } from 'vue';
  import { useDocument } from "vuefire";

  import CanvasBox from '../components/Canvas/CanvasBox.vue';
  import CanvasCabinet from '../components/Canvas/CanvasCabinet.vue';
  import thingService from '../services/thing.service';
  import storageService from '../services/storage.service';
  import { IBox, IContainer, IStorage } from '../models/storage.model';

  const showUpdateThingModal = ref(false);

  const canvasWidth = 300;
  const canvasHeight = 350;

  const canvasBoxRef = ref<InstanceType<typeof CanvasBox> | null>(null);
  const canvasCabinetRef = ref<InstanceType<typeof CanvasCabinet> | null>(null);

  const thingId = ref('xixi');

  const thingDoc = computed(() =>
    doc(thingService.thingsColRef, thingId.value)
  )

  const thingDB = useDocument(thingDoc);

  const storageId = ref('xixi');
  
  const storageDoc = computed(() =>
    doc(storageService.storagesColRef, storageId.value)
  )

  const storage = useDocument(storageDoc);

  const breadcrumbs: Ref<{id: string, name: string, type: string}[]> = ref([]);

  const handleThingIdUpdate = (id: string) => {
    thingId.value = id;
  };

  const getAncestorNames = ({ id, name, type, parent }:  IStorage): {id: string, name: string, type: string}[] => {
    const names: {id: string, name: string, type: string}[] = [{id, name, type}];

    if (parent) {
      names.unshift(...getAncestorNames(parent as IStorage));
    }

    return names;
  };

  const goToStorage = (storage: { id: string; type: string }) => {
    if(storage.type == 'cabinet') return;
    storageId.value = storage.id;
  };

  const openThingUpdateModal = async () => {
    showUpdateThingModal.value = true;
  }

  const handleStorageIdUpdate = (newStorageId: string) => {
    storageId.value = newStorageId;
  };

  watch(thingDB.pending, async (pending) => {
    if (!pending && thingDB.value) {
      await nextTick();
      storageId.value = thingDB.value?.storage?.id;
    }
  });

  watch(storage.pending, async (pending) => {
    if (!pending && storage.value) {
      await nextTick();
      breadcrumbs.value = getAncestorNames(storage.value as IStorage);    

      if(storage.value?.type === 'drawer') canvasCabinetRef.value?.draw(storage.value.parent as IContainer);
      else canvasBoxRef.value?.draw(storage.value as IBox);
    }
  });

  watch(showUpdateThingModal, async (value: boolean) => {
    //ToDo: redo logic
    if (!value) {
      const id = thingId.value
      thingId.value = 'xixi'
      thingId.value = id
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