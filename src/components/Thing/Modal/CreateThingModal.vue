<template>
  <n-modal :show="show" @update:show="closeModal" preset="card" title="Create New Thing" :style="{ width: modalWidth }" :mask-closable="false">
    <div class="create-thing">
      <n-form class="create-thing-form" ref="formRef" :model="formValue" :rules="formRules">
        <n-grid cols="24" item-responsive responsive="screen">
          <n-form-item-gi span="18" label="Name" path="name">
            <n-input ref="inputNameRef" v-model:value="formValue.name" type="text" placeholder="Enter name..." />
          </n-form-item-gi>
          <n-form-item-gi span="5" offset="1" label="Qty" path="stock">
            <n-input-number v-model:value="formValue.stock" type="number" min="0" placeholder="0" />
          </n-form-item-gi>
          <n-form-item-gi span="24 m:24" label="Description" path="description">
            <n-input v-model:value="formValue.description" type="textarea" placeholder="Enter description..." />
          </n-form-item-gi>
          <n-form-item-gi span="24 m:24" label="Tags" path="tags">
            <n-select :value="formValue.tags" placeholder="Select or add tags" multiple filterable tag @search="searchTags" @update:value="handleTagUpdate" :options="tagOptions" />
          </n-form-item-gi>
          <n-form-item-gi span="24 m:24" label="Storage" path="storageId">
            <n-cascader v-model:value="formValue.storageId" placeholder="Add to storage" check-strategy="all" label-field="name" value-field="id" :options="storageOptions" clearable/>
          </n-form-item-gi>
        </n-grid>
      </n-form>
      <div class="create-thing-canvas" :style="{ width: maxCanvasWidth + 'px', height: maxCanvasHeight + 'px' }">
        <div class="create-thing-canvas-empty" :style="{ width: '400px', height: '400px' }" v-if="!formValue.storageId">   
          <n-empty description="No storage selected" />
        </div> 
        <CanvasBox v-else-if="previewStorage?.type === 'box'" :c_width="canvasWidth" :c_height="canvasHeight" :storage="previewStorage" />
        <CanvasCabinet v-else-if="previewStorage?.type === 'cabinet' || previewStorage?.type === 'drawer'" :c_width="canvasWidth" :c_height="canvasHeight" :storage="hydratedCabinet" :selectedId="selectedDrawerId" canSelect @selected="handleSelected" />    
        <CanvasOrganizer v-else-if="previewStorage?.type === 'organizer' || previewStorage?.type === 'slot'" :c_width="canvasWidth" :c_height="canvasHeight" :storage="hydratedOrganizer" :selectedId="selectedSlotId" canSelect @selected="handleSelected" />    
      </div>
    </div>
    <n-space justify="end" :style="{ width: '100%', 'margin-top': '16px' }">
      <n-button type="primary" @click="createThing($event, true)">Save</n-button>
      <n-button type="primary" @click="createThing($event)">Save and Close</n-button>
      <n-button @click="show = false">Cancel</n-button>
    </n-space>
  </n-modal>
</template>

<script setup lang="ts">
import type { CascaderOption, FormInst, InputInst } from 'naive-ui';
import { useMessage } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { IStorage } from '../../../models/storage.model';
import { ILocalTag } from '../../../models/tag.model';
import { ICreateThing, IThingForm } from '../../../models/thing.model';

import { useStorageStore } from '../../../stores/storage';
import { useTagStore } from '../../../stores/tag';
import { useThingStore } from '../../../stores/thing';

import { hydrateCabinet, getSelectedDrawerId, hydrateOrganizer, getSelectedSlotId } from '../../../utils/storage.utils';

import CanvasBox from '../../Canvas/CanvasBox.vue';
import CanvasCabinet from '../../Canvas/CanvasCabinet.vue';
import CanvasOrganizer from '../../Canvas/CanvasOrganizer.vue';
import { calculateCanvasDimensions } from '../../../utils/canvas.utils';

const props = defineProps<{
  showModal: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:showModal', value: boolean): void;
}>();

const thingStore = useThingStore();
const storageStore = useStorageStore();
const tagStore = useTagStore();

const { storagesAll } = storeToRefs(storageStore);
const { tags } = storeToRefs(tagStore);

const message = useMessage();

const modalWidth = ref('90%');

const inputNameRef = ref<InputInst | null>(null)

const maxCanvasWidth = 500;
const maxCanvasHeight = 400;

const canvasDimensions = computed(() => calculateCanvasDimensions(previewStorage.value, maxCanvasWidth, maxCanvasHeight));

const canvasWidth = computed(() => canvasDimensions.value.width);
const canvasHeight = computed(() => canvasDimensions.value.height);;

const formRef = ref<FormInst | null>(null)

const formValue = ref<IThingForm>({
  name: '',
  stock: 1,
  description: '',
  tags: [],
  storageId: ''
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

const hydratedCabinet = computed(() => hydrateCabinet(previewStorage.value, storagesAll.value as IStorage[]));
const hydratedOrganizer = computed(() => hydrateOrganizer(previewStorage.value, storagesAll.value as IStorage[]));

const selectedDrawerId = computed(() => getSelectedDrawerId(previewStorage.value));
const selectedSlotId = computed(() => getSelectedSlotId(previewStorage.value));

onMounted(() => {
  updateModalWidth()
  searchTags();
  window.addEventListener('resize', updateModalWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateModalWidth)
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

const handleTagUpdate = (_tagsValue: string[], tags: ILocalTag[]) => {
  const tag = tags[tags.length - 1];
  const removedTag = selectedTags.value.filter(tag => !tags.includes(tag))[0];

  if(removedTag) {
    formValue.value.tags = formValue.value.tags.filter(tag => tag !== removedTag.value);
    createdTags.value = createdTags.value.filter(lt => lt.label !== removedTag.label); //Remove from local if created and removed after
  }
  else if(tag.label === tag.value) {
    const createdTag = createdTags.value.find(t => t === tag);

    if(createdTag) {
      formValue.value.tags.push(createdTag.value);
    }
    else {
      createTagLocal(tag);
    }
  }
  else {
    const dbTag = dbTags.value.find(t => t === tag);
    if(dbTag) {
      formValue.value.tags.push(dbTag.value);
    } 
  }
  selectedTags.value = [...tags];
};

const handleSelected = (id: string) => {
  formValue.value.storageId = id;
};

const createTagLocal = (tag: ILocalTag) => {
  formValue.value.tags.push(tag.value);
  createdTags.value.push(tag);
};

// Create a new thing
const createThing = async (e: MouseEvent, stayOpen = false) => {
  e.preventDefault();
  await formRef.value?.validate((errors) => {
    if (errors) {
      message.error('Check the form for required fields.');
      return;
    }
  })

  const storageId = formValue.value.storageId;
  const storageType = storagesAll.value.find(s => s.id === storageId)?.type;

  if(storageId) {
    if(storageType === "cabinet") {
      message.error('Please select a drawer.');
      return;
    }
    else if(storageType === "organizer") {
      message.error('Please select a slot.');
      return;
    }
  }

  const thing: ICreateThing = {
    name: formValue.value.name,
    stock: formValue.value.stock,
    description: formValue.value.description,
    createdTags: createdTags.value,
    tags: selectedTags.value.filter(selTag => selTag.value != selTag.label),
    storage: storageId
  }

  try {
    await thingStore.createThing(thing);
    message.success('Thing created successfully.');
    if (!stayOpen) {
      closeModal();
    } else {
      clearModal();
    }
  } catch {
    message.error('There was an error creating the thing.');
  }
};

const closeModal = (value: boolean = false) => {
  show.value = value;
}

const clearModal = () => {
  formValue.value.name = ''
  formValue.value.stock = 1
  formValue.value.description = ''
  formValue.value.tags = []

  dbTags.value = [];
  createdTags.value = [];
  selectedTags.value = [];
  inputNameRef.value?.focus()
}

watch(tags, (newTags) => {
  dbTags.value = newTags.map(tag => ({
    label: tag.name,
    value: tag.id
  }));
}, { immediate: true });

</script>

<style scoped lang="sass">
.create-thing
  display: grid
  grid-template-columns: 1fr auto
  gap: 32px
  margin-bottom: 48px

.create-thing-canvas
  display: flex
  justify-content: center
  align-items: center
  align-self: center

.create-thing-canvas-empty
  display: flex
  justify-content: center
  align-items: center
  background-color: rgba(255, 255, 255, 0.05)
</style>