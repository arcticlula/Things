<template>
  <div class="unassigned-view">
    <div class="header">
      <n-text tag="h2" class="title">Unassigned Things</n-text>
      <n-button @click="router.push('/')">Back to Home</n-button>
    </div>
    
    <n-grid cols="24" :x-gap="24" item-responsive responsive="screen" class="content-grid">
      <!-- List Column -->
      <n-gi span="12">
        <n-card title="Things" size="small" style="height: 100%">
          <ThingList />
        </n-card>
      </n-gi>

      <!-- Assign Column -->
      <n-gi span="12">
        <n-card title="Assign Storage" size="small" style="height: 100%">
          <n-space vertical size="large">
            <div class="assign-storage">
              <n-cascader
                v-model:value="storageId"
                placeholder="Select Storage"
                :options="storageOptions"
                check-strategy="all"
                label-field="name"
                value-field="id"
              />
              <n-button secondary type="info" class="assign-button" @click="assignStorage">Assign</n-button>
            </div>

            <div class="canvas-container" v-if="previewStorage">
              <CanvasBox v-if="previewStorage.type === 'box'" :c_width="canvasWidth" :c_height="canvasHeight" :storage="storage" />
              <CanvasCabinet 
                v-else-if="previewStorage.type === 'cabinet' || previewStorage.type === 'drawer'" 
                :c_width="canvasWidth" 
                :c_height="canvasHeight" 
                :storage="hydratedCabinet" 
                :selectedId="selectedDrawerId" 
                canSelect 
                @selected="handleSelected"
              />
              <CanvasOrganizer 
                v-else-if="previewStorage.type === 'organizer' || previewStorage.type === 'slot'" 
                :c_width="canvasWidth" 
                :c_height="canvasHeight" 
                :storage="hydratedOrganizer" 
                :selectedId="selectedSlotId" 
                canSelect 
                @selected="handleSelected"
              />
            </div>
            
            <div class="canvas-container-empty" :style="{ height: '300px' }" v-else>   
              <n-empty description="No storage selected" />
            </div>           
          </n-space>
        </n-card>
      </n-gi>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useMessage, CascaderOption } from 'naive-ui';

import ThingList from '../components/Thing/ThingList.vue';
import CanvasBox from '../components/Canvas/CanvasBox.vue';
import CanvasCabinet from '../components/Canvas/CanvasCabinet.vue';
import CanvasOrganizer from '../components/Canvas/CanvasOrganizer.vue';

import { useThingStore } from '../stores/thing';
import { useStorageStore } from '../stores/storage';
import { IStorage } from '../models/storage.model';
import { hydrateCabinet, getSelectedDrawerId, hydrateOrganizer, getSelectedSlotId } from '../utils/storage.utils';
import { calculateCanvasDimensions } from '../utils/canvas.utils';

const router = useRouter();
const message = useMessage();
const thingStore = useThingStore();
const storageStore = useStorageStore();

const { thingId } = storeToRefs(thingStore);
const { storage, storageId, storagesAll } = storeToRefs(storageStore);

const maxCanvasWidth = 500;
const maxCanvasHeight = 400;

onMounted(async () => {
  await storageStore.searchStorages(''); // Ensure storages are loaded
  thingStore.fetchUnassignedThings();
});

const storageOptions = computed(() => buildNestedStorage(storagesAll.value as IStorage[]));

// The storage to render (Cabinet/Organizer/Box). If a sub-unit is selected, render its parent.
const previewStorage = computed(() => {
  return (storagesAll.value as IStorage[]).find(s => s.id === storageId.value) || null;
});

const hydratedCabinet = computed(() => hydrateCabinet(previewStorage.value as IStorage, storagesAll.value as IStorage[]));
const hydratedOrganizer = computed(() => hydrateOrganizer(previewStorage.value as IStorage, storagesAll.value as IStorage[]));

const selectedDrawerId = computed(() => getSelectedDrawerId(previewStorage.value));
const selectedSlotId = computed(() => getSelectedSlotId(previewStorage.value));

const canvasDimensions = computed(() => calculateCanvasDimensions(previewStorage.value as IStorage, maxCanvasWidth, maxCanvasHeight));
const canvasWidth = computed(() => canvasDimensions.value.width);
const canvasHeight = computed(() => canvasDimensions.value.height);

const canAssign = () => {
  if (!thingId.value) return false;
  if (!storageId.value) {
    message.error('Select a storage');
    return false;
  }
  
  const all = storagesAll.value as IStorage[];
  const target = all.find(s => s.id === storageId.value);
  
  if (target?.type === 'cabinet' || target?.type === 'organizer') {
    message.error('Select a drawer or slot');
    return false;
  }
  
  return true;
}

const handleSelected = (id: string) => {
  storageId.value = id;
};

const assignStorage = async () => {
    if (!canAssign()) return;

    try {
        await thingStore.assignThingToStorage(thingId.value, storageId.value);
        message.success('Assigned!');
    } catch (e) {
        message.error('Failed to assign');
        console.error(e);
    }
};

function buildNestedStorage (storages: (IStorage)[], parentId: string | undefined = undefined) {
  const sortedStorages = [...storages].sort((a, b) => {
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  });

  const children: CascaderOption[] = sortedStorages
    .filter(storage => storage?.parent?.id === parentId) // Find storages with matching parentId
    .map(storage => ({
      ...storage,
      id: storage.id,
      children: buildNestedStorage(storages, storage.id)
    }));

  return children.length > 0 ? children : undefined;
};
</script>

<style scoped lang="sass">
.unassigned-view 
  padding: 24px

.header 
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 24px

.title 
  margin: 0

.assign-storage 
  display: flex
  justify-content: space-between

.assign-button 
  margin-left: 16px
  
.canvas-container 
  display: flex
  justify-content: center
  align-self: center
  padding: 16px
  border-radius: 4px

.canvas-container-empty 
  display: flex
  justify-content: center
  align-items: center
  background: rgba(255, 255, 255, 0.05)
  padding: 16px
  border-radius: 4px
</style>
