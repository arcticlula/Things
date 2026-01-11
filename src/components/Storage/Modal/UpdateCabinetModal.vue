<template>
  <n-modal :show="show" @update:show="closeModal" preset="card" title="Update Cabinet" :style="{ width: modalWidth }" :mask-closable="false">
    <div class="update-storage">
      <n-form class="update-storage-form" ref="formRef" :model="formValue" :rules="formRules" size="small">
        <n-grid cols="24" item-responsive responsive="screen">
          <n-form-item-gi span="24" label="Name" path="name">
            <n-input v-model:value="formValue.name" type="text" placeholder="Enter name..." clearable/>
          </n-form-item-gi>
          <n-form-item-gi span="15" label="Material" path="material" >
            <n-select v-model:value="formValue.material" placeholder="Select material of storage" :options="materialOptions" @update:value="drawStorage" />
          </n-form-item-gi>
          <n-form-item-gi span="8" offset="1" label="Drawer Ratio">
            <n-input-number v-model:value="formValue.ratio" min="0.1" max="5" step="0.1" @update:value="drawStorage">
              <template #suffix>w/h</template>
            </n-input-number>
          </n-form-item-gi>
          <n-form-item-gi span="24 m:24" label="Description" path="description">
            <n-input v-model:value="formValue.description" type="textarea" placeholder="Enter description..." clearable/>
          </n-form-item-gi>
        </n-grid>
        <h4 style="font-weight: bold;">Update Drawer</h4>
        <n-grid cols="24" item-responsive responsive="screen">
          <n-form-item-gi span="24" label="Name" path="drawerName">
            <n-input v-model:value="drawerName" :disabled="!isDrawer" @update:value="drawStorage" clearable :status="drawerNameValidation"/>  
          </n-form-item-gi>
          <n-form-item-gi span="24" label="Description">
            <n-input v-model:value="drawerDesc" type="textarea" :disabled="!isDrawer" clearable/>  
          </n-form-item-gi>
        </n-grid>
      </n-form>
      <div class="update-storage-canvas" :style="{ width: maxCanvasWidth + 'px', height: maxCanvasHeight + 'px' }">
        <CanvasCabinet ref="canvasCabinetRef" :c_width="canvasWidth" :c_height="canvasHeight" canSelect :selectedId="selectedDrawerId" @selected="handleSelected"/>
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { storeToRefs } from 'pinia';

import { useStorageStore } from '../../../stores/storage';
import { IUpdateCabinetForm, IDrawCabinet, IUpdateCabinet, ICabinetMaterial, ICabinet, IDrawDrawer, IUpdateDrawer } from "../../../models/storage.model";
import CanvasCabinet from "../../Canvas/CanvasCabinet.vue";
import { calculateCanvasDimensions } from "../../../utils/canvas.utils";

const props = defineProps<{
  showModal: boolean;
}>();

const emit = defineEmits<{
  (e: "update:showModal", value: boolean): void;
}>();

const canvasCabinetRef = ref<InstanceType<typeof CanvasCabinet> | null>(null);

const message = useMessage();

const storageStore = useStorageStore();
const { storage, storagePending } = storeToRefs(storageStore);

const cabinet = ref<ICabinet>();
const storageId = ref<string | null>(null);

const modalWidth = ref("90%");

const maxCanvasWidth = 400;
const maxCanvasHeight = 500;

const previewStorage = computed(() => {
  if (!cabinet.value) return null;
  return {
    ...cabinet.value,
    ratio: formValue.value.ratio,
    material: formValue.value.material,
    drawers: formValue.value.drawers,
  };
});

const canvasDimensions = computed(() => calculateCanvasDimensions(previewStorage.value, maxCanvasWidth, maxCanvasHeight));

const canvasWidth = computed(() => canvasDimensions.value.width);
const canvasHeight = computed(() => canvasDimensions.value.height);

const materialOptions = [
  { label: "Plastic", value: "plastic" },
  { label: "Wood", value: "wood" },
  { label: "Metal", value: "metal" }
];

const selectedDrawerId = computed(() => {
  if (formValue.value.drawers?.some(d => d.id === storageId.value)) {
    return storageId.value;
  }
  return null;
});

const formRef = ref<FormInst | null>(null);

const formValue = ref<IUpdateCabinetForm>({
  name: '',
  description: '',
  material: '' as ICabinetMaterial,
  ratio: 1.0,
  drawers: []
});

const formRules = {
  name: {
    required: true,
    message: "Please input the cabinet's name",
    trigger: ["input", "blur"],
  }
};

const show = computed({
  get: () => props.showModal,
  set: (value: boolean) => emit("update:showModal", value),
});

const isDrawer = computed(() => previewStorage.value?.drawers?.some(d => d.id === storageId.value));
const selectedDrawerIndex = computed(() => formValue.value.drawers?.findIndex(d => d.id === storageId.value));
const drawerNameValidation = computed(() => drawerName.value ? '' : 'error');

const drawerName = computed({
  get: () =>  {
    if(!formValue.value?.drawers || isNaN(selectedDrawerIndex.value)) return '';
    else return formValue.value.drawers[selectedDrawerIndex.value]?.name || '';
  },
  set(value: string) {
    if (isDrawer.value) {
      formValue.value.drawers[selectedDrawerIndex.value].name = value;
    }
  }
});

const drawerDesc = computed({
  get: () =>  {
    if(!formValue.value?.drawers || isNaN(selectedDrawerIndex.value)) return '';
    else return formValue.value.drawers[selectedDrawerIndex.value]?.description || '';
  },  
  set(value: string) {
    if (isDrawer.value) {
      formValue.value.drawers[selectedDrawerIndex.value].description = value;
    }
  }
});

watch(storagePending, async (pending) => {
  if (!pending && storage.value) {
    drawStorage();
  }
});

onMounted(() => {
  updateModalWidth();

  storageId.value = storage.value?.id;
  cabinet.value = storage.value?.type === 'drawer' ? storage.value?.parent : storage.value;
  formValue.value.name = cabinet.value?.name || '';
  formValue.value.description = cabinet.value?.description || '';
  formValue.value.material = cabinet.value?.material || 'plastic';
  formValue.value.ratio = cabinet.value?.ratio || 1.0;
  formValue.value.drawers = cabinet.value?.drawers || [];

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

  for(const drawer of formValue.value.drawers as IUpdateDrawer[]) {
    if(!drawer.name) {
      message.error("All drawers must have at least a name.");
      storageId.value = drawer.id;
      return;
    }
  }

  const cab: IUpdateCabinet = {
    id: cabinet.value?.id as string,
    name: formValue.value.name,
    description: formValue.value.description,
    material: formValue.value.material,
    ratio: formValue.value.ratio,
    drawers: formValue.value.drawers
  };

  try {
    await storageStore.updateStorageCabinet(cab);
    message.success('Cabinet updated successfully.');
    closeModal();

  } catch {
    message.error('There was an error updating the cabinet.');
  }
};

const drawStorage = async () => {
  await nextTick();

  const cab: IDrawCabinet = {
    material: formValue.value.material,
    ratio: formValue.value.ratio,
    x_units: cabinet.value?.x_units as number,
    y_units: cabinet.value?.y_units as number,
    drawers: cabinet.value?.drawers as IDrawDrawer[]
  };

  canvasCabinetRef.value?.draw(cab);
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
