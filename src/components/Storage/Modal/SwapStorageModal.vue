<template>
  <n-modal v-model:show="show" preset="card" title="Swap Storage" class="swap-storage-modal" :style="{ width: modalWidth }">
    <div class="swap-content">
      <n-grid cols="2" x-gap="24">
        <!-- Left Side: Current Drawer -->
        <n-gi>
          <div class="column-header">Current Storage</div>
          <div class="current-storage-label">
            <n-input :value="currentStorage?.parent?.name + ' / ' + currentStorage?.name" readonly />
          </div>
          <div class="canvas-container" :style="{ height: maxCanvasHeight + 'px' }">
            <CanvasCabinet :c_width="canvasWidth" :c_height="canvasHeight" :storage="currentCabinet" :selectedId="selectedCurrentId" />
          </div>
        </n-gi>

        <!-- Right Side: Target Drawer -->
        <n-gi>
          <div class="column-header">Swap With</div>
          <div class="target-selection">
            <n-cascader v-model:value="storageId" placeholder="Select a drawer to swap with" check-strategy="all" label-field="name" value-field="id" :options="storageOptions" />
          </div>
          <div class="canvas-container" :style="{ height: maxCanvasHeight + 'px' }">
             <CanvasCabinet v-if="storageId" :c_width="canvasWidth" :c_height="canvasHeight" canSelect :storage="targetCabinet" :selectedId="selectedTargetId" @selected="handleSelected"/>
             <div v-else class="empty-canvas">
                <n-empty description="Select a drawer to preview" />
             </div>
          </div>
        </n-gi>
      </n-grid>

      <n-space justify="end" class="actions">
        <n-button @click="show = false">Cancel</n-button>
        <n-button type="primary" :disabled="!storageId" @click="handleSwap">Swap</n-button>
      </n-space>
    </div>
  </n-modal>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useStorageStore } from '../../../stores/storage';
import { storeToRefs } from 'pinia';
import { CascaderOption, useMessage } from 'naive-ui';
import CanvasCabinet from '../../Canvas/CanvasCabinet.vue';
import { IStorage } from '../../../models/storage.model';
import { hydrateCabinet, validateSwapCompatibility } from '../../../utils/storage.utils';
import { calculateCanvasDimensions } from '../../../utils/canvas.utils';

const props = defineProps<{
  showModal: boolean;
  currentStorageId: string | null;
}>();

const emit = defineEmits(['update:showModal', 'swap-completed']);
const message = useMessage();

const modalWidth = ref("90%");

const maxCanvasWidth = 400;
const maxCanvasHeight = 400;

const storageStore = useStorageStore();
const { storagesAll, storage, storageId } = storeToRefs(storageStore);

// const currentCabinet = ref<IStorage>();

const currentStorage = computed(() => {
  if (!props.currentStorageId) return null;
  return storagesAll.value.find(storage => storage.id === props.currentStorageId) as IStorage | undefined;
});

const currentCabinet = computed(() => hydrateCabinet(currentStorage.value, storagesAll.value as IStorage[]));
const targetCabinet = computed(() => hydrateCabinet(storage.value, storagesAll.value as IStorage[]));

const canvasDimensions = computed(() => calculateCanvasDimensions(currentCabinet.value, maxCanvasWidth, maxCanvasHeight));

const canvasWidth = computed(() => canvasDimensions.value.width);
const canvasHeight = computed(() => canvasDimensions.value.height);

const selectedCurrentId = computed(() => props.currentStorageId);
const selectedTargetId = computed(() => storageId.value);

const storageOptions = computed(() => buildNestedStorage(storagesAll.value as (IStorage)[]));

const buildNestedStorage = (storages: (IStorage)[], parentId: string | undefined = undefined) => {
  const filteredStorages = storages.filter(storage => storage.type === 'cabinet' || storage.type === 'drawer');
  const sortedStorages = [...filteredStorages].sort((a, b) => {
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  });

  const children: CascaderOption[] = sortedStorages
    .filter(storage => {
      // Filter by parent
      if (storage?.parent?.id !== parentId) return false;
      
      // If this is a top-level cabinet (parentId is undefined), only show cabinets with same size as original parent
      if (!parentId && storage.type === 'cabinet' && currentStorage.value?.parent) {
        const originalParent = currentStorage.value.parent;
        return storage.x_units === originalParent.x_units && 
               storage.y_units === originalParent.y_units;
      }
      
      // If this is a drawer, check both drawer size AND parent cabinet size using centralized validation
      if (storage.type === 'drawer' && currentStorage.value?.type === 'drawer') {
        const validation = validateSwapCompatibility(currentStorage.value, storage);
        return validation.isValid;
      }
      
      return true;
    })
    .map(storage => ({
      ...storage,
      id: storage.id,
      children: buildNestedStorage(storages, storage.id)
    }));

  return children.length > 0 ? children : undefined;
};

const show = computed({
  get: () => props.showModal,
  set: (value) => emit('update:showModal', value),
});

onMounted(() => {
  updateModalWidth();

  window.addEventListener("resize", updateModalWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateModalWidth);
});

const handleSelected = (id: string) => {
  // Find the selected storage
  const selectedStorage = storagesAll.value.find(s => s.id === id) as IStorage | undefined;
  
  if (!selectedStorage || !currentStorage.value) {
    return;
  }
  
  // Validate using centralized function
  const validation = validateSwapCompatibility(currentStorage.value, selectedStorage);
  
  if (!validation.isValid) {
    message.warning(validation.error || 'Invalid selection');
    return;
  }
  
  // If all validations pass, set the storageId
  storageId.value = id;
};

const updateModalWidth = () => {
  const width = window.innerWidth;
  if (width > 1200) {
    modalWidth.value = "75vw";
  } else if (width > 768) {
    modalWidth.value = "85vw";
  } else {
    modalWidth.value = "90%";
  }
};

const handleSwap = async () => {
    if (!currentStorage.value || !storageId.value) return;

    // Find the target storage
    const targetStorage = storagesAll.value.find(s => s.id === storageId.value) as IStorage | undefined;
    
    if (!targetStorage) {
      message.error('Target storage not found');
      return;
    }

    // Validate using centralized function
    const validation = validateSwapCompatibility(currentStorage.value, targetStorage);
    
    if (!validation.isValid) {
      message.error(validation.error || 'Invalid swap');
      return;
    }

    try {
        const currentId = currentStorage.value.id;
        await storageStore.swapStorages(currentId, storageId.value);
        
        message.success('Storages swapped successfully');
        emit('swap-completed');
        show.value = false;
    } catch (error) {
        console.error('Swap error:', error);
        message.error('Failed to swap');
    }
};
</script>

<style scoped lang="sass">
.swap-storage-modal
    /* Controlled by style prop in template, but scope classes here */

.swap-content
    padding: 16px 0

.column-header
    font-size: 1.1em
    font-weight: bold
    margin-bottom: 12px
    text-align: center

.canvas-container
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    background-color: rgba(255, 255, 255, 0.05)
    border-radius: 8px
    padding: 16px
    min-height: 400px
    margin-top: 12px

.empty-canvas
    width: 300px
    height: 300px
    display: flex
    align-items: center
    justify-content: center
    background-color: rgba(0,0,0,0.1)
    border-radius: 4px

.target-selection
    width: 100%
    margin-bottom: 12px

.current-storage-label
    width: 100%
    margin-bottom: 12px

.storage-label
    margin-top: 16px
    text-align: center

.storage-meta
    font-size: 0.9em
    opacity: 0.8
    font-family: monospace

.parent-label
    font-size: 0.8em
    opacity: 0.7
    margin-top: 4px

.actions
    margin-top: 24px
</style>
