<template>
  <n-modal :show="show" @update:show="closeModal" preset="card" title="Update Organizer" :style="{ width: modalWidth }" :mask-closable="false">
    <div class="update-storage">
      <n-form class="update-storage-form" ref="formRef" :model="formValue" :rules="formRules" size="small">
        <n-grid cols="24" item-responsive responsive="screen">
          <n-form-item-gi span="24 m:24" label="Name" path="name">
            <n-input v-model:value="formValue.name" type="text" placeholder="Enter name..." clearable/>
          </n-form-item-gi>
          <n-form-item-gi span="24 m:24" label="Description" path="description">
            <n-input v-model:value="formValue.description" type="textarea" placeholder="Enter description..." clearable/>
          </n-form-item-gi>
          <n-form-item-gi span="15" label="Material" path="material" >
            <n-select v-model:value="formValue.material" placeholder="Select material of storage" :options="materialOptions" @update:value="drawStorage" />
          </n-form-item-gi>
          <n-form-item-gi span="8" offset="1" label="Slot Ratio">
            <n-input-number v-model:value="formValue.ratio" min="0.1" max="5" step="0.1" @update:value="drawStorage">
              <template #suffix>w/h</template>
            </n-input-number>
          </n-form-item-gi>
          <n-form-item-gi span="24" label="Does it have a papa?" path="parent">
            <n-select v-model:value="formValue.parent" placeholder="Does it have a papa?" filterable clearable :options="storageOptions" />
          </n-form-item-gi>
        </n-grid>
        <h4 style="font-weight: bold;">Update Compartment</h4>
        <n-grid cols="24" item-responsive responsive="screen">
          <n-form-item-gi span="24" label="Name" path="drawerName">
            <n-input v-model:value="slotName" :disabled="!isSlot" @update:value="drawStorage" clearable :status="slotNameValidation"/>  
          </n-form-item-gi>
          <n-form-item-gi span="24" label="Description">
            <n-input v-model:value="slotDesc" type="textarea" :disabled="!isSlot" clearable/>  
          </n-form-item-gi>
        </n-grid>
      </n-form>
      <div class="update-storage-canvas" :style="{ width: maxCanvasWidth + 'px', height: maxCanvasHeight + 'px' }">
        <CanvasOrganizer ref="canvasOrganizerRef" :c_width="canvasWidth" :c_height="canvasHeight" canSelect :selectedId="selectedSlotId" @selected="handleSelected"/>
      </div>
    </div>
    <n-space justify="end" :style="{ width: '100%', 'margin-top': '16px' }">
      <n-button type="primary" @click="updateStorage">Save</n-button>
      <n-button @click="show = false">Cancel</n-button>
    </n-space>
  </n-modal>
</template>

<script setup lang="ts">
import type { FormInst } from "naive-ui";
import { useMessage } from "naive-ui";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { storeToRefs } from 'pinia';

import { useStorageStore } from '../../../stores/storage';
import { IUpdateOrganizerForm, IDrawOrganizer, IUpdateOrganizer, IOrganizerMaterial, IOrganizer, IDrawSlot, IUpdateSlot, IContainer } from "../../../models/storage.model";
import CanvasOrganizer from "../../Canvas/CanvasOrganizer.vue";
import { calculateCanvasDimensions } from "../../../utils/canvas.utils";

const props = defineProps<{
  showModal: boolean;
}>();

const emit = defineEmits<{
  (e: "update:showModal", value: boolean): void;
}>();

const canvasOrganizerRef = ref<InstanceType<typeof CanvasOrganizer> | null>(null);

const message = useMessage();

const storageStore = useStorageStore();
const { storage } = storeToRefs(storageStore);

const organizer = ref<IOrganizer>();
const storageId = ref<string | null>(null);

const modalWidth = ref("90%");

const maxCanvasWidth = 400;
const maxCanvasHeight = 500;

const previewStorage = computed(() => {
  if (!organizer.value) return null;
  return {
    ...organizer.value,
    ratio: formValue.value.ratio,
    material: formValue.value.material,
    slots: formValue.value.slots,
  };
});

const canvasDimensions = computed(() => calculateCanvasDimensions(previewStorage.value, maxCanvasWidth, maxCanvasHeight));

const canvasWidth = computed(() => canvasDimensions.value.width);
const canvasHeight = computed(() => canvasDimensions.value.height);

const materialOptions = [
  { label: "Plastic", value: "plastic" }
];

const selectedSlotId = computed(() => {
  if (formValue.value.slots?.some(s => s.id === storageId.value)) {
    return storageId.value;
  }
  return null;
});

const formRef = ref<FormInst | null>(null);

const formValue = ref<IUpdateOrganizerForm>({
  name: '',
  description: '',
  material: '' as IOrganizerMaterial,
  ratio: 1.0,
  slots: [],
  parent: ''
});

const formRules = {
  name: {
    required: true,
    message: "Please input the organizer's name",
    trigger: ["input", "blur"],
  }
};

const show = computed({
  get: () => props.showModal,
  set: (value: boolean) => emit("update:showModal", value),
});

const storageOptions = computed(() => {
  const temp = storageStore.storagesThings.reduce((result, item) => {
    const sameStorage = item.id === storage.value?.id;
    const parentIsStorage = item?.parent?.id === storage.value?.id
    // Make sure user cannot choose the storage itself and another storage that is the child of the storage itself
    if (!sameStorage && !parentIsStorage) {
      result.push({
        value: item.id,
        label: buildLabel(item as IContainer)
      });
    }
    return result;
  }, []);
  
  return temp.sort((a: { label: string; }, b: { label: string; }) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }));;
});

const buildLabel = (storage: IOrganizer): string => {
  if (storage?.parent) {
    return `${buildLabel(storage.parent as IContainer)} / ${storage.name}`;
  } else {
    return storage?.name;
  }
};

const isSlot = computed(() => previewStorage.value?.slots?.some(s => s.id === storageId.value));
const selectedSlotIndex = computed(() => formValue.value.slots?.findIndex(d => d.id === storageId.value));
const slotNameValidation = computed(() => slotName.value ? '' : 'error');

const slotName = computed({
  get: () =>  {
    if(!formValue.value?.slots || isNaN(selectedSlotIndex.value)) return '';
    else return formValue.value.slots[selectedSlotIndex.value]?.name || '';
  },
  set(value: string) {
    if (isSlot.value) {
      formValue.value.slots[selectedSlotIndex.value].name = value;
    }
  }
});

const slotDesc = computed({
  get: () =>  {
    if(!formValue.value?.slots || isNaN(selectedSlotIndex.value)) return '';
    else return formValue.value.slots[selectedSlotIndex.value]?.description || '';
  },  
  set(value: string) {
    if (isSlot.value) {
      formValue.value.slots[selectedSlotIndex.value].description = value;
    }
  }
});

onMounted(() => {
  updateModalWidth();

  storageId.value = storage.value?.id;
  organizer.value = storage.value?.type === 'slot' ? storage.value?.parent : storage.value;
  formValue.value.name = organizer.value?.name || '';
  formValue.value.description = organizer.value?.description || '';
  formValue.value.material = organizer.value?.material || 'plastic';
  formValue.value.ratio = organizer.value?.ratio || 1.0;
  formValue.value.slots = organizer.value?.slots || [];
  formValue.value.parent = organizer.value?.parent?.id || '';

  drawStorage();
  window.addEventListener("resize", updateModalWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateModalWidth);
});

const handleSelected = (id: string) => {
  storageId.value = id;
  drawStorage();
};

const updateModalWidth = () => {
  const width = window.innerWidth;
  if (width > 1200) {
    modalWidth.value = "85vw";
  } else if (width > 768) {
    modalWidth.value = "90vw";
  } else {
    modalWidth.value = "95%";
  }
};

const closeModal = (value: boolean = false) => {
  show.value = value;
};

// Update existing storage
const updateStorage = async (e: MouseEvent) => {
  e.preventDefault();
  await formRef.value?.validate((errors) => {
    if (errors) {
      message.error("Check the form for required fields.");
      return;
    }
  });

  for(const slot of formValue.value.slots as IUpdateSlot[]) {
    if(!slot.name) {
      message.error("All slots must have at least a name.");
      storageId.value = slot.id;
      return;
    }
  }

  const org: IUpdateOrganizer = {
    id: organizer.value?.id as string,
    name: formValue.value.name,
    description: formValue.value.description,
    material: formValue.value.material,
    ratio: formValue.value.ratio,
    slots: formValue.value.slots,
    parentId: formValue.value.parent,
    oldParentId: organizer.value?.parent?.id || '',
  };

  try {
    await storageStore.updateStorageOrganizer(org);
    message.success('Organizer updated successfully.');
    closeModal();

  } catch {
    message.error('There was an error updating the organizer.');
  }
};

const drawStorage = async () => {
  await nextTick();

  const org: IDrawOrganizer = {
    material: formValue.value.material,
    ratio: formValue.value.ratio,
    x_units: organizer.value?.x_units as number,
    y_units: organizer.value?.y_units as number,
    slots: organizer.value?.slots as IDrawSlot[]
  };

  canvasOrganizerRef.value?.draw(org);
};
</script>

<style scoped lang="sass">
.update-storage
  display: grid
  grid-template-columns: 1fr auto
  gap: 32px
  margin-bottom: 48px

.update-storage-canvas
  display: flex
  justify-content: center
  align-self: center
  align-items: center
  margin-left: 16px
  flex-shrink: 0
</style>
