<template>
  <n-modal :show="show" @update:show="closeModal" preset="card" title="Update Box" :style="{ width: modalWidth }" :mask-closable="false">
    <div class="update-storage">
      <n-form class="update-storage-form" ref="formRef" :model="formValue" :rules="formRules" size="small">
        <n-grid cols="24" item-responsive responsive="screen">
          <n-form-item-gi span="24 m:24" label="Name" path="name">
            <n-input v-model:value="formValue.name" type="text" placeholder="Enter name..." />
          </n-form-item-gi>
          <n-form-item-gi span="24 m:24" label="Description" path="description">
            <n-input v-model:value="formValue.description" type="textarea" placeholder="Enter description..." />
          </n-form-item-gi>
          <n-form-item-gi span="9" label="Material" path="material" >
            <n-select v-model:value="formValue.material" placeholder="Select material of storage" :options="materialOptions" @update:value="drawStorage" />
          </n-form-item-gi>
          <n-form-item-gi span="14" offset="1" label="Does it have a papa?" path="parent">
            <n-select v-model:value="formValue.parent" placeholder="Does it have a papa?" filterable clearable :options="storageOptions" />
          </n-form-item-gi>
          <n-form-item-gi span="6" label="Width" >
            <n-input-number v-model:value="formValue.x_units" min="1" @update:value="drawStorage" />
          </n-form-item-gi>
          <n-form-item-gi span="6" offset="1" label="Height">
            <n-input-number v-model:value="formValue.y_units" min="1" @update:value="drawStorage" />
          </n-form-item-gi>
          <n-form-item-gi span="6" offset="1" label="Depth">
            <n-input-number v-model:value="formValue.depth" min="1" @update:value="drawStorage" />
          </n-form-item-gi>
          <n-form-item-gi span="2" offset="2" label="Lid">
            <n-switch v-model:value="formValue.boxLid" @update:value="drawStorage" />
          </n-form-item-gi>
        </n-grid>
      </n-form>
      <div class="update-storage-canvas" :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }">
        <CanvasBox ref="canvasBoxRef" :c_width="canvasWidth" :c_height="canvasHeight"/>
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
import { useCollection } from "vuefire";

import { IBox, IDrawer, ILocalBox, IBoxUpdateForm, IUpdateBox } from "../../../models/storage.model";
import CanvasBox from "../../Canvas/CanvasBox.vue";

import storageService from "../../../services/storage.service";

const props = defineProps<{
  showModal: boolean;
  storage: IBox;
}>();

const emit = defineEmits<{
  (e: "update:showModal", value: boolean): void;
}>();

const show = computed({
  get: () => props.showModal,
  set: (value: boolean) => emit("update:showModal", value),
});

const canvasBoxRef = ref<InstanceType<typeof CanvasBox> | null>(null);

const message = useMessage();

const modalWidth = ref("90%");

const canvasWidth = 350;
const canvasHeight = 380;

const storages = useCollection(storageService.storagesWithThings);

const storageOptions = computed(() => {
  const temp = storages.value.reduce((result, storage) => {
    const sameStorage = storage.id === props.storage.id;
    const parentIsStorage = storage?.parent?.id === props.storage.id;
    // Make sure user cannot choose the storage itself and another storage that is the child of the storage itself
    if (!sameStorage && !parentIsStorage) {
      result.push({
        value: storage.id,
        label: buildLabel(storage as IBox)
      });
    }
    return result;
  }, []);
  
  return temp;
});

const buildLabel = (storage: IBox): string => {
  if (storage?.parent) {
    return `${buildLabel(storage.parent as IDrawer & IBox)} / ${storage.name}`;
  } else {
    return storage?.name;
  }
};

const materialOptions = [
  { label: "Plastic", value: "plastic" },
  { label: "Cardboard", value: "cardboard" },
];


const formRef = ref<FormInst | null>(null);

const formValue = ref<IBoxUpdateForm>({
  name: props.storage.name,
  description: props.storage.description,
  material: props.storage.material,
  x_units: props.storage.x_units,
  y_units: props.storage.y_units,
  parent: props.storage.parent?.id || '',
  depth: props.storage.depth,
  boxLid: props.storage.lid,
});

const formRules = {
  name: {
    required: true,
    message: "Please input the storage's name",
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

  const box: IUpdateBox = {
    id: props.storage.id,
    name: formValue.value.name,
    description: formValue.value.description,
    material: formValue.value.material,
    x_units: formValue.value.x_units,
    y_units: formValue.value.y_units,
    depth: formValue.value.depth,
    lid: formValue.value.boxLid,
    parentId: formValue.value.parent,
    oldParentId: props.storage.parent?.id
  };

  try {
    await storageService.updateStorageBox(box);
    message.success('Box updated successfully.');
    closeModal();

  } catch {
    message.error('There was an error updating the box.');
  }
};

const drawStorage = async () => {
  await nextTick();
  const box: ILocalBox = {
    name: formValue.value.name,
    description: formValue.value.description,
    type: props.storage.type,
    material: formValue.value.material,
    x_units: formValue.value.x_units,
    y_units: formValue.value.y_units,
    depth: formValue.value.depth,
    lid: formValue.value.boxLid,
  };
  canvasBoxRef.value?.draw(box);
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
