<template>
  <n-modal :show="show" @update:show="closeModal" preset="card" title="Update Thing" :style="{ width: modalWidth }" :mask-closable="false">
    <div class="update-thing">
      <n-form class="update-thing-form" ref="formRef" :model="formValue" :rules="formRules">
        <n-grid cols="24" item-responsive responsive="screen">
          <n-form-item-gi span="24 m:24" label="Name" path="name">
            <n-input ref="inputNameRef" v-model:value="formValue.name" type="text" placeholder="Enter name..." />
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
              @update:value="handleStorageUpdate"
              :options="storageOptions"
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>
      <n-card class="update-thing-canvas" :style="{ width: canvasWidth + 50 + 'px', height: canvasHeight + 42 + 'px' }">
        <CanvasBox v-if="storage?.type === 'box'" ref="canvasBoxRef" :c_width="canvasWidth" :c_height="canvasHeight" />
        <CanvasCabinet v-else-if="storage?.type === 'cabinet'" ref="canvasCabinetRef" :c_width="canvasWidth" :c_height="canvasHeight" v-model:selectedDrawer="formValue.storageId"/>    
        <div class="update-thing-canvas-empty" :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }" v-else>   
          <n-empty description="No storage selected" />
        </div> 
      </n-card>
    </div>
    <n-space justify="end" :style="{ width: '100%', 'margin-top': '16px' }">
      <n-button type="primary" @click="updateThing($event)">Save</n-button>
      <n-button @click="show = false">Cancel</n-button>
    </n-space>
  </n-modal>
</template>

<script setup lang="ts">
import { doc } from 'firebase/firestore';
import type { CascaderOption, FormInst, InputInst } from 'naive-ui';
import { useMessage } from 'naive-ui';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useCollection, useDocument } from "vuefire";

import { IBox, ICabinet, IDrawer } from '../../../models/storage.model';
import { ILocalTag } from '../../../models/tag.model';
import { IThing, IThingForm, IUpdateThing } from '../../../models/thing.model';

import storageService from '../../../services/storage.service';
import tagService from '../../../services/tag.service';
import thingService from '../../../services/thing.service';

import CanvasBox from '../../Canvas/CanvasBox.vue';
import CanvasCabinet from '../../Canvas/CanvasCabinet.vue';

const props = defineProps<{
  showModal: boolean;
  storageId: string;
  thing: IThing;
}>();

const emit = defineEmits<{
  (e: 'update:showModal', value: boolean): void;
  (e: 'update:storageId', value: string): void;
}>();

const show = computed({
  get: () => props.showModal,
  set: (value: boolean) => emit('update:showModal', value)
});

const message = useMessage();

const modalWidth = ref('90%');

const formRef = ref<FormInst | null>(null)

const formValue = ref<IThingForm>({
  name: props.thing.name,
  description: props.thing.description,
  tags: props.thing.tags?.map(t => t.id) || [],
  storageId: props.thing.storage.id
});

const formRules = {
  name: {
    required: true,
    message: 'Please input the thing\'s name',
    trigger: ['input', 'blur']
  },
  storageId: {
    required: true,
    message: 'Please add the thing to a storage',
    trigger: ['input', 'blur']
  }
}

const tagInput = ref('');

const dbTags = ref<ILocalTag[]>([]);
const createdTags = ref<ILocalTag[]>([]);
const selectedTags = ref<ILocalTag[]>([]);
const removedTags = ref<ILocalTag[]>([]);

const tags = useCollection(tagService.tagsQuery);
const storages = useCollection(storageService.storagesColRef);

const tagOptions = computed(() => {
  // Filter out the locally created ones since they are already internally added
  const filteredSelectedTags = selectedTags.value.filter(selTag => selTag.value != selTag.label);

  const filteredDbTags = dbTags.value.filter(dbTag =>
    !selectedTags.value.some(selTag => selTag.value === dbTag.value)
  );
  
  return [...new Set([...filteredSelectedTags, ...filteredDbTags])];
});

const drawStorageId = ref('xixi');
  
const storageDoc = computed(() =>
  doc(storageService.storagesColRef, drawStorageId.value)
)

const storage = useDocument(storageDoc);

const inputNameRef = ref<InputInst | null>(null)

const canvasBoxRef = ref<InstanceType<typeof CanvasBox> | null>(null);
const canvasCabinetRef = ref<InstanceType<typeof CanvasCabinet> | null>(null);

const canvasWidth = 250;
const canvasHeight = 300;

const storageOptions = computed(() => buildNestedStorage(storages.value as (ICabinet & IBox)[]));

const buildNestedStorage = (storages: (ICabinet & IBox)[], parentId: string | undefined = undefined) => {
  const sortedStorages = [...storages].sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
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

watch(tags, (newTags) => {
  dbTags.value = newTags.map(tag => ({
    label: tag.name,
    value: tag.id
  }));
}, { immediate: true });

watch(storage.pending, async (pending) => {
  if (!pending && storage.value) {
    await nextTick();
    drawStorage();
  }
});

const updateModalWidth = () => {
  const width = window.innerWidth;
  if (width > 1200) {
    modalWidth.value = '60%';
  } else if (width > 768) {
    modalWidth.value = '70%';
  } else {
    modalWidth.value = '90%';
  }
}

onMounted(() => {
  updateModalWidth()
  searchTags();

  selectedTags.value = props.thing.tags?.map(t => ({label: t.name, value: t.id})) || [];
  handleStorageUpdate();
  window.addEventListener('resize', updateModalWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateModalWidth)
})

const searchTags = async (value: string = '') => {
  tagInput.value = value;
  await tagService.searchTags(value);
};

const handleTagUpdate = (_tagsValue: string[], tags: ILocalTag[]) => {
  const tag = tags[tags.length - 1];
  const removedTag = selectedTags.value.filter(tag => !tags.includes(tag))[0];
  if(removedTag) {
    formValue.value.tags = formValue.value.tags.filter(tag => tag !== removedTag.value);
    createdTags.value = createdTags.value.filter(lt => lt.label !== removedTag.label); //Remove from local if created and removed after
    removedTags.value.push(removedTag);
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

const handleStorageUpdate = async() => {
  await nextTick();
  let storage = storages.value.find(s => s.id === formValue.value.storageId) as ICabinet & IBox & IDrawer;
  // ToDo: redo logic
  drawStorageId.value = 'xixi';
  drawStorageId.value = storage?.type === 'drawer' ? storage.parent.id : storage.id;
}

const drawStorage = async () => {
  switch (storage.value?.type) {
    case 'cabinet':
      canvasCabinetRef.value?.draw(storage.value as ICabinet);
      break;
    case 'box':
      canvasBoxRef.value?.draw(storage.value as IBox);
      break;
  }
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

  const storageId = formValue.value.storageId;
  const storageType = storages.value.find(s => s.id === storageId)?.type;

  if(!storageId) return;

  if(storageType === "cabinet") {
    message.error('Please select a drawer.');
    return;
  }
  
  const thing: IUpdateThing = {
    id: props.thing.id,
    name: formValue.value.name,
    description: formValue.value.description,
    createdTags: createdTags.value,
    tags: selectedTags.value.filter(selTag => selTag.value != selTag.label),
    removedTags: removedTags.value,
    storageId,
    oldStorageId: props.thing.storage.id
  }

  try {
    await thingService.updateThing(thing);
    emit('update:storageId', storageId);
    message.success('Thing updated successfully.');
    closeModal();
  } catch {
    message.error('There was an error updating the thing.');
  }
};

const closeModal = (value: boolean = false) => {
  show.value = value;
}

</script>

<style scoped lang="sass">
.update-thing
  display: flex
  flex-direction: row
  width: 100%

.update-thing-form
  margin: 0 8px
  width: 100%

.update-thing-canvas
  display: flex
  justify-content: center
  align-self: center
  background-color: rgba(255, 255, 255, 0.1)
  margin: 8px

.update-thing-canvas-empty
  display: flex
  justify-content: center
  align-items: center

</style>