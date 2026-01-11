<template>
  <n-modal :show="show" @update:show="closeModal" preset="card" title="Update Thing" :style="{ width: modalWidth }" :mask-closable="false">
    <div class="update-thing">
      <n-form class="update-thing-form" ref="formRef" :model="formValue" :rules="formRules">
        <n-grid cols="24" item-responsive responsive="screen">
          <n-form-item-gi span="18" label="Name" path="name">
            <n-input v-model:value="formValue.name" type="text" placeholder="Enter name..." />
          </n-form-item-gi>
          <n-form-item-gi span="5" offset="1" label="Qty" path="stock">
            <n-input-number v-model:value="formValue.stock" type="number" min="0" placeholder="0" />
          </n-form-item-gi>
          <n-form-item-gi span="24 m:24" label="Description" path="description">
            <n-input v-model:value="formValue.description" type="textarea" placeholder="Enter description..." />
          </n-form-item-gi>
          <n-form-item-gi span="24 m:24" label="Tags" path="tags">
            <n-select
              :value="formValue.tags"
              placeholder="Select or add tags"
              multiple
              filterable
              tag
              @search="searchTags"
              @update:value="handleTagUpdate"
              :options="tagOptions"
            />
          </n-form-item-gi>
          <n-form-item-gi span="24 m:24" label="Storage" path="storageId">
            <n-cascader
              v-model:value="formValue.storageId"
              placeholder="Add to storage"
              check-strategy="all"
              label-field="name"
              value-field="id"
              :options="storageOptions"
              clearable
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>
      <div class="update-thing-canvas" :style="{ width: maxCanvasWidth + 'px', height: maxCanvasHeight + 'px' }">
        <CanvasBox v-if="previewStorage?.type === 'box'" :c_width="canvasWidth" :c_height="canvasHeight" :storage="previewStorage" />
        <CanvasCabinet 
          v-else-if="previewStorage?.type === 'cabinet' || previewStorage?.type === 'drawer'" 
          :c_width="canvasWidth" 
          :c_height="canvasHeight" 
          :storage="hydratedCabinet" 
          :selectedId="selectedDrawerId" 
          canSelect 
          @selected="handleSelected"/>    
        <CanvasOrganizer 
          v-else-if="previewStorage?.type === 'organizer' || previewStorage?.type === 'slot'" 
          :c_width="canvasWidth" 
          :c_height="canvasHeight" 
          :storage="hydratedOrganizer" 
          :selectedId="selectedSlotId" 
          canSelect 
          @selected="handleSelected" />
        <div class="update-thing-canvas-empty" :style="{ width: '400px', height: '400px' }" v-else>   
          <n-empty description="No storage selected" />
        </div> 
      </div>
    </div>
    <n-space justify="end" :style="{ width: '100%', 'margin-top': '16px' }">
      <n-button type="primary" @click="updateThing($event)">Save</n-button>
      <n-button @click="show = false">Cancel</n-button>
    </n-space>
  </n-modal>
</template>

<script setup lang="ts">
import type { CascaderOption, FormInst } from 'naive-ui';
import { useMessage } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { IStorage } from '../../../models/storage.model';
import { ILocalTag } from '../../../models/tag.model';
import { IThingForm, IUpdateThing } from '../../../models/thing.model';

import { useStorageStore } from '../../../stores/storage';
import { useThingStore } from '../../../stores/thing';
import { useTagStore } from '../../../stores/tag';

import { hydrateCabinet, getSelectedDrawerId, hydrateOrganizer, getSelectedSlotId } from '../../../utils/storage.utils';
import { calculateCanvasDimensions } from '../../../utils/canvas.utils';

import CanvasBox from '../../Canvas/CanvasBox.vue';
import CanvasCabinet from '../../Canvas/CanvasCabinet.vue';
import CanvasOrganizer from '../../Canvas/CanvasOrganizer.vue';

const props = defineProps<{
  showModal: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:showModal', value: boolean): void;
  (e: 'storage-updated', storageId: string): void;
}>();

const thingStore = useThingStore();
const storageStore = useStorageStore();
const tagStore = useTagStore();

const { storagesAll } = storeToRefs(storageStore);
const { tags } = storeToRefs(tagStore);

const message = useMessage();

const modalWidth = ref('90%');

const maxCanvasWidth = 500;
const maxCanvasHeight = 370;

const canvasDimensions = computed(() => calculateCanvasDimensions(previewStorage.value, maxCanvasWidth, maxCanvasHeight));

const canvasWidth = computed(() => canvasDimensions.value.width);
const canvasHeight = computed(() => canvasDimensions.value.height);

const formRef = ref<FormInst | null>(null)

const formValue = ref<IThingForm>({
  name: thingStore.thing?.name,
  stock: thingStore.thing?.stock,
  description: thingStore.thing?.description,
  tags: thingStore.thing?.tags?.map((t: { id: string; }) => t.id) || [],
  storageId: thingStore.thing?.storage?.id || null
});

const formRules = {
  name: {
    required: true,
    message: 'Please input the thing\'s name',
    trigger: ['input', 'blur']
  },
  stock: {
    required: true,
    type: 'number',
    message: 'No value',
    trigger: ['input', 'blur']
  }
}

const dbTags = ref<ILocalTag[]>([]);
const createdTags = ref<ILocalTag[]>([]);
const selectedTags = ref<ILocalTag[]>([]);
const removedTags = ref<ILocalTag[]>([]);

const show = computed({
  get: () => props.showModal,
  set: (value: boolean) => emit('update:showModal', value)
});

const tagOptions = computed(() => {
  // Filter out the locally created ones since they are already internally added
  const filteredSelectedTags = selectedTags.value.filter(selTag => selTag.value != selTag.label);

  const filteredDbTags = dbTags.value.filter(dbTag =>
    !selectedTags.value.some(selTag => selTag.value === dbTag.value)
  );
  
  return [...new Set([...filteredSelectedTags, ...filteredDbTags])];
});

const storageOptions = computed(() => buildNestedStorage(storagesAll.value as (IStorage)[]));

const previewStorage = computed(() => {
  if (!formValue.value.storageId) return null;
  return (storagesAll.value as IStorage[]).find(s => s.id === formValue.value.storageId) || null;
});

const hydratedCabinet = computed(() => hydrateCabinet(previewStorage.value as IStorage, storagesAll.value as IStorage[]));
const hydratedOrganizer = computed(() => hydrateOrganizer(previewStorage.value as IStorage, storagesAll.value as IStorage[]));

const selectedDrawerId = computed(() => getSelectedDrawerId(previewStorage.value));
const selectedSlotId = computed(() => getSelectedSlotId(previewStorage.value));

onMounted(() => {
  updateModalWidth()
  searchTags();

  selectedTags.value = thingStore.thing?.tags?.map((t: { name: string; id: string; }) => ({label: t.name, value: t.id})) || [];
  window.addEventListener('resize', updateModalWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateModalWidth);
})

const buildNestedStorage = (storages: (IStorage)[], parentId: string | undefined = undefined) => {
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

const updateModalWidth = () => {
  const width = window.innerWidth;
  if (width > 1200) {
    modalWidth.value = '75%';
  } else if (width > 768) {
    modalWidth.value = '85%';
  } else {
    modalWidth.value = '90%';
  }
}

const searchTags = async (value: string = '') => {
  await tagStore.searchTags(value);
};

const handleSelected = (id: string) => {
  formValue.value.storageId = id;
};

const handleTagUpdate = (_tagsValue: string[], tags: ILocalTag[]) => {
  const tag = tags[tags.length - 1];
  const removedTag = selectedTags.value.filter(tag => !tags.includes(tag))[0];
  if(removedTag) {
    formValue.value.tags = formValue.value.tags.filter(tag => tag !== removedTag.value);
    createdTags.value = createdTags.value.filter(lt => lt.label !== removedTag.label); //Remove from local if created and removed after
    if(removedTag.label !== removedTag.value) removedTags.value.push(removedTag);
  }
  else if(tag.label === tag.value) {
    const createdTag = createdTags.value.find(t => t === tag);

    if(createdTag) {
      formValue.value.tags.push(createdTag.value);
    }
    else createTagLocal(tag);
  }
  else {
    const dbTag = dbTags.value.find(t => t === tag);
    if(dbTag) {
      formValue.value.tags.push(dbTag.value);
    } 
  }
  selectedTags.value = [...tags];
};

const createTagLocal = (tag: ILocalTag) => {
  formValue.value.tags.push(tag.value);
  createdTags.value.push(tag);
};

// Create a new thing
const updateThing = async (e: MouseEvent) => {
  e.preventDefault();
  await formRef.value?.validate((errors) => {
    if (errors) {
      message.error('Check the form for required fields.');
      return;
    }
  })

  const storageId = formValue.value.storageId || null;
  const storageType = storagesAll.value.find(s => s.id === storageId)?.type;

  if(storageType === "cabinet") {
    message.error('Please select a drawer.');
    return;
  }
  else if(storageType === "organizer") {
    message.error('Please select a slot.');
    return;
  }
  
  const payload: IUpdateThing = {
    id: thingStore.thing?.id,
    name: formValue.value.name,
    stock: formValue.value.stock,
    description: formValue.value.description,
    createdTags: createdTags.value,
    tags: selectedTags.value.filter(selTag => selTag.value != selTag.label),
    removedTags: removedTags.value,
    storage: storageId,
    oldStorage: thingStore.thing?.storage?.id
  }

  console.log(payload);

  try {
    await thingStore.updateThing(payload);
    message.success('Thing updated successfully.');
    
    // Emit the new storage ID so parent can update immediately
    if (storageId) {
      emit('storage-updated', storageId);
    }
    
    closeModal();
  } catch (err) {
    console.error('Error updating thing:', err);
    message.error('There was an error updating the thing.');
  }
};

const closeModal = (value: boolean = false) => {
  show.value = value;
}

watch(tags, (newTags) => {
  dbTags.value = newTags.map(tag => ({
    label: tag.name,
    value: tag.id
  }));
}, { immediate: true });

</script>

<style scoped lang="sass">
.update-thing
  display: grid
  grid-template-columns: 1fr auto
  gap: 32px
  margin-bottom: 48px

.update-thing-canvas
  display: flex
  justify-content: center
  align-items: center
  align-self: center

.update-thing-canvas-empty
  display: flex
  justify-content: center
  align-items: center
  background-color: rgba(255, 255, 255, 0.05)
</style>