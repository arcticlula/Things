<template>
  <n-grid cols="24" class="search-storages-grid" item-responsive responsive="screen">
    <n-gi span="8">
      <n-layout embedded class="search-storages-layout">
        <StorageList v-model:storageId="storageId"></StorageList>
      </n-layout>
    </n-gi>
    <n-gi span="16">
      <n-layout embedded class="search-storages-layout">
        <n-card class="search-storages-card" content-class="search-storages-card-content">
          <div class="search-storages-card-header">
            <n-breadcrumb separator=">">
              <n-breadcrumb-item v-for="bc in breadcrumbs" :key="bc.id" @click="goToStorage(bc)" clickable>
              {{ bc.name }}
              </n-breadcrumb-item>
            </n-breadcrumb>
            <n-button v-if="storage" text @click="openStorageUpdateModal(storage?.type)"><n-icon :component="Edit" /></n-button>
          </div>
          <div v-if="storage" class="search-storages-details">
            <n-card class="search-storages-details-canvas" :style="{ width: canvasWidth + 50 + 'px', height: canvasHeight + 42 + 'px' }">
              <CanvasBox v-if="storage?.type === 'box'" ref="canvasBoxRef" :c_width="canvasWidth" :c_height="canvasHeight" />
              <CanvasCabinet v-else-if="storage?.type !== 'box'" ref="canvasCabinetRef" :c_width="canvasWidth" :c_height="canvasHeight" v-model:selectedDrawer="selectedDrawer"/>    
              <div class="search-storages-details-canvas-empty" :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }" v-else>   
                <n-empty description="No storage selected" />
              </div> 
            </n-card>
            <div class="search-storages-details-things">
              <StorageThingList @update:storageId="handleStorageIdUpdate"></StorageThingList>
            </div>
          </div>
        </n-card>
      </n-layout>
    </n-gi>
  </n-grid>
  <UpdateBoxModal v-if="showUpdateBoxModal" v-model:showModal="showUpdateBoxModal" :storage="storage"></UpdateBoxModal>
  <UpdateCabinetModal v-if="showUpdateCabinetModal" v-model:showModal="showUpdateCabinetModal" :storage="storage?.type === 'cabinet' ? storage : storage?.parent" v-model:selectedDrawer="selectedDrawer"></UpdateCabinetModal>
</template>

<script lang="ts" setup>
  import Edit from '@vicons/carbon/Edit';
  import { doc } from 'firebase/firestore';
  import { nextTick, ref, watch, computed, Ref } from 'vue';
  import { useDocument } from "vuefire";

  import CanvasBox from '../components/Canvas/CanvasBox.vue';
  import CanvasCabinet from '../components/Canvas/CanvasCabinet.vue';
  import storageService from '../services/storage.service';
  import { IBox, ICabinet, IDrawer, IStorage, IType } from '../models/storage.model';

  const showUpdateBoxModal = ref(false);
  const showUpdateCabinetModal = ref(false);

  const canvasWidth = 300;
  const canvasHeight = 350

  const canvasBoxRef = ref<InstanceType<typeof CanvasBox> | null>(null);
  const canvasCabinetRef = ref<InstanceType<typeof CanvasCabinet> | null>(null);

  const storageId = ref('xixi');

  const storageDoc = computed(() =>
    doc(storageService.storagesColRef, storageId.value)
  )

  const storage = useDocument(storageDoc);

  const isDrawer = ref(false);

  const selectedDrawer = computed({
    get: () => isDrawer.value ? storageId.value : '',
    set: (value: string) => {
      isDrawer.value = true;
      storageId.value = value;
    }
  });

  const breadcrumbs: Ref<{id: string, name: string, type: string}[]> = ref([]);

  const getAncestorNames = ({ id, name, type, parent }: IStorage): {id: string, name: string, type: string}[] => {
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

  const handleStorageIdUpdate = (newStorageId: string) => {
    storageId.value = newStorageId;
  };

  const openStorageUpdateModal = async (type: IType) => {
    switch(type) {
      case 'box': showUpdateBoxModal.value = true; break;
      default: showUpdateCabinetModal.value = true; break;
    }
  }
  
  watch(storage.pending, async (pending) => {
    if (!pending) {
      let parent;
      await nextTick();
      storageService.selectStorageById(storageId.value);

      isDrawer.value = storage.value?.type === 'drawer';

      switch (storage.value?.type) {
        case 'drawer':
          await nextTick();
          parent = (storage.value as IDrawer)?.parent;
          if(parent) {
            canvasCabinetRef.value?.draw(parent);
          }
          break;
        case 'cabinet':
          await nextTick();
          canvasCabinetRef.value?.draw(storage.value as ICabinet);
          break;
        case 'box':
          await nextTick();
          canvasBoxRef.value?.draw(storage.value as IBox);
          break;
      }
      breadcrumbs.value = getAncestorNames(storage.value as IStorage);
    }
  });

  watch(showUpdateBoxModal, async (value: boolean) => {
    //ToDo: redo logic
    if (!value) {
      const id = storageId.value
      storageId.value = 'xixi'
      storageId.value = id
    }
  });

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
    justify-content: center
    align-items: flex-start
    width: 100%
    height: 100%

  .search-storages-details-canvas
    display: flex
    justify-content: center
    align-self: center
    background-color: rgba(255, 255, 255, 0.1)
    margin: 8px

  .search-storages-details-canvas-empty
    display: flex
    justify-content: center
    align-items: center

  .search-storages-details-things
    width: 40%
    padding: 16px 32px
    
</style>