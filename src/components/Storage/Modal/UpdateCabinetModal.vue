<template>
  <n-modal :show="show" @update:show="closeModal" preset="card" title="Update Cabinet" :style="{ width: modalWidth }" :mask-closable="false">
    <div class="update-storage">
      <n-form class="update-storage-form" ref="formRef" :model="formValue" :rules="formRules" size="small">
        <n-grid cols="24" item-responsive responsive="screen">
          <n-form-item-gi span="15" label="Name" path="name">
            <n-input v-model:value="formValue.name" type="text" placeholder="Enter name..." clearable/>
          </n-form-item-gi>
          <n-form-item-gi span="8" offset="1" label="Material" path="material" >
            <n-select v-model:value="formValue.material" placeholder="Select material of storage" :options="materialOptions" @update:value="drawStorage" />
          </n-form-item-gi>
          <n-form-item-gi span="24 m:24" label="Description" path="description">
            <n-input v-model:value="formValue.description" type="textarea" placeholder="Enter description..." clearable/>
          </n-form-item-gi>
          <!-- <n-form-item-gi span="24">
            <div style="font-weight: bold;">Drawer</div>
          </n-form-item-gi> -->
          <n-form-item-gi span="24" label="Name">
            <n-input v-model:value="drawerName" :disabled="!isDrawer" @update:value="drawStorage" clearable/>  
          </n-form-item-gi>
          <n-form-item-gi span="24" label="Description">
            <n-input v-model:value="drawerDesc" type="textarea" :disabled="!isDrawer" clearable/>  
          </n-form-item-gi>
        </n-grid>
      </n-form>
      <div class="update-storage-canvas" :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }">
        <CanvasCabinet ref="canvasCabinetRef" :c_width="canvasWidth" :c_height="canvasHeight" v-model:selectedDrawer="selectedDrawerId"/>
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

import { ICabinet, IUpdateCabinetForm, IDrawCabinet, IUpdateCabinet } from "../../../models/storage.model";
import CanvasCabinet from "../../Canvas/CanvasCabinet.vue";

import storageService from "../../../services/storage.service";

const props = defineProps<{
  showModal: boolean;
  storage: ICabinet;
  selectedDrawer: string;
}>();

const emit = defineEmits<{
  (e: "update:showModal", value: boolean): void;
  (e: 'update:selectedDrawer', value: string): void;
}>();

const show = computed({
  get: () => props.showModal,
  set: (value: boolean) => emit("update:showModal", value),
});

const drawerId = ref(props.selectedDrawer);

const selectedDrawerIndex = computed(() => formValue.value.drawers.findIndex(d => d.id === drawerId.value));
const isDrawer = computed(() => selectedDrawerIndex.value != -1);

const selectedDrawerId = computed({
  get: () => isDrawer.value ? drawerId.value : '',
  set: (value: string) => {
    drawerId.value = value;
  }
});

const drawerName = computed({
  get: () =>  isDrawer.value ? formValue.value.drawers[selectedDrawerIndex.value].name : '',
  set(value: string) {
    if (isDrawer.value) {
      formValue.value.drawers[selectedDrawerIndex.value].name = value;
    }
  }
});

const drawerDesc = computed({
  get: () => isDrawer.value ? formValue.value.drawers[selectedDrawerIndex.value].description : '',
  set(value: string) {
    if (isDrawer.value) {
      formValue.value.drawers[selectedDrawerIndex.value].description = value;
    }
  }
});

const canvasCabinetRef = ref<InstanceType<typeof CanvasCabinet> | null>(null);

const message = useMessage();

const modalWidth = ref("90%");

const canvasWidth = 300;
const canvasHeight = 350;

const materialOptions = [
  { label: "Plastic", value: "plastic" },
  { label: "Wood", value: "wood" },
  { label: "Metal", value: "metal" }
];

const formRef = ref<FormInst | null>(null);

const formValue = ref<IUpdateCabinetForm>({
  name: props.storage.name,
  description: props.storage.description,
  material: props.storage.material,
  drawers: props.storage.drawers
});

const formRules = {
  name: {
    required: true,
    message: "Please input the cabinet's name",
    trigger: ["input", "blur"],
  },
};

const updateModalWidth = () => {
  const width = window.innerWidth;
  if (width > 1200) {
    modalWidth.value = "65vw";
  } else if (width > 768) {
    modalWidth.value = "80vw";
  } else {
    modalWidth.value = "90%";
  }
};

const closeModal = (value: boolean = false) => {
  emit("update:selectedDrawer", drawerId.value);
  show.value = value;
};

onMounted(() => {
  updateModalWidth();

  drawStorage();
  window.addEventListener("resize", updateModalWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateModalWidth);
});

// Update existing storage
const updateStorage = async (e: MouseEvent) => {
  e.preventDefault();
  await formRef.value?.validate((errors) => {
    if (errors) {
      message.error("Check the form for required fields.");
      return;
    }
  });

  const cabinet: IUpdateCabinet = {
    id: props.storage.id,
    name: formValue.value.name,
    description: formValue.value.description,
    material: formValue.value.material,
    drawers: formValue.value.drawers
  };

  try {
    await storageService.updateStorageCabinet(cabinet);
    message.success('Cabinet updated successfully.');
    closeModal();

  } catch {
    message.error('There was an error updating the cabinet.');
  }
};

const drawStorage = async () => {
  await nextTick();
  const cabinet: IDrawCabinet = {
    material: formValue.value.material,
    x_units: props.storage.x_units,
    y_units: props.storage.y_units,
    drawers: props.storage.drawers
  };
  canvasCabinetRef.value?.draw(cabinet);
};
</script>

<style scoped lang="sass">
.update-storage
  display: flex
  flex-direction: row
  width: 100%

.update-storage-form
  margin: 0 8px
  width: 100%

.update-storage-canvas
  display: flex
  justify-content: center
  height: fit-content
  align-self: center
  margin: 0 8px
  min-width: 350px
</style>
