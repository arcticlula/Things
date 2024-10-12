<template>
    <n-modal :show="show" @update:show="closeModal" preset="card" title="Create New Storage" :style="{ width: modalWidth }" :mask-closable="false">
      <div class="create-storage">
        <n-form class="create-storage-form" ref="formRef" :model="formValue" :rules="formRules" size="small">
          <n-grid cols="24" item-responsive responsive="screen">
            <n-form-item-gi span="24 m:24" label="Name" path="name">
              <n-input v-model:value="formValue.name" type="text" placeholder="Enter name..." />
            </n-form-item-gi>
            <n-form-item-gi span="24 m:24" label="Description" path="description">
              <n-input v-model:value="formValue.description" type="textarea" placeholder="Enter description..." />
            </n-form-item-gi>
            <n-form-item-gi :span="formLayout.typeSpan" label="Type" path="type">
              <n-cascader v-model:value="typeMaterial" placeholder="Select type/material of storage" check-strategy="child" :options="typeOptions" @update:value="resetDrawersAndRedraw" />
            </n-form-item-gi>
            <n-form-item-gi v-if="type === 'box'" span="12" :offset="1" label="Does it have a papa?" path="parent">
              <n-select v-model:value="formValue.parent" placeholder="Does it have a papa?" filterable :options="storageOptions" />
            </n-form-item-gi>
            <n-form-item-gi :span="formLayout.xSpan" :offset="formLayout.xOffset" :label="formLayout.xLabel">
              <n-input-number v-model:value="formValue.x_units" min="1" @update:value="drawStorage" :validator="validateX"/>
            </n-form-item-gi>
            <n-form-item-gi :span="formLayout.ySpan" offset="1" :label="formLayout.yLabel">
              <n-input-number v-model:value="formValue.y_units" min="1" @update:value="drawStorage" :validator="validateY"/>
            </n-form-item-gi>
            <n-form-item-gi v-if="type === 'box'" span="6" offset="1" label="Depth">
              <n-input-number v-model:value="formValue.depth" min="1" @update:value="drawStorage"/>
            </n-form-item-gi>
            <n-form-item-gi v-if="type === 'box'" span="2" offset="2" label="Lid">
              <n-switch v-model:value="formValue.boxLid" @update:value="drawStorage" />
            </n-form-item-gi>
            <n-form-item-gi v-if="type === 'cabinet'" span="20" label="Drawer Name">
              <n-input v-model:value="formValue.drawer.name">  
                <template v-if="formValue.autoIncrement" #suffix>{{ drawers.length + 1 }}</template>              
              </n-input>
            </n-form-item-gi>
            <n-form-item-gi v-if="type === 'cabinet'" span="2" offset="2" label="Auto">
              <n-switch v-model:value="formValue.autoIncrement" @update:value="drawStorage" />
            </n-form-item-gi>
            <n-form-item-gi v-if="type === 'cabinet'" span="6" label="Drawer Width">
              <n-input-number v-model:value="formValue.drawer.x_units" min="1" :max="formValue.x_units" >
                <template #suffix>u.</template>              
              </n-input-number>
            </n-form-item-gi>
            <n-form-item-gi v-if="type === 'cabinet'" span="6" offset="1" label="Drawer Height">
              <n-input-number v-model:value="formValue.drawer.y_units" min="1" :max="formValue.y_units">
                <template #suffix>u.</template>              
              </n-input-number>
            </n-form-item-gi>
            <n-form-item-gi v-if="type === 'cabinet'" span="6" offset="2" label="Add to">
              <n-button-group>
                <n-button @click="addDrawer('row')">Row</n-button>
                <n-button @click="addDrawer('column')">Column</n-button>
              </n-button-group>
            </n-form-item-gi>
            <n-form-item-gi v-if="type === 'cabinet'" span="2" offset="1">
              <n-button @click="undo" :disabled="drawers.length == 0" type="info" >
                <n-icon :component="Undo" />
              </n-button>
            </n-form-item-gi>
          </n-grid>
        </n-form>
        <div class="create-storage-canvas">
          <CanvasBox v-if="type === 'box'" ref="canvasBoxRef" :c_width="canvasWidth" :c_height="canvasHeight" />
          <CanvasCabinet v-else-if="type === 'cabinet'" ref="canvasCabinetRef" :c_width="canvasWidth" :c_height="canvasHeight" />    
        </div>
      </div>
      <n-space justify="end" :style="{ width: '100%', 'margin-top': '16px' }">
        <n-button type="primary" @click="createStorage">Save</n-button>
        <n-button @click="show = false">Cancel</n-button>
      </n-space>
    </n-modal>
</template>

<script setup lang="ts">
import Undo from '@vicons/carbon/Undo';
import type { CascaderOption, FormInst } from 'naive-ui';
import { useMessage } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { computed, nextTick, onBeforeUnmount, onMounted, Ref, ref } from 'vue';

import { IContainer, ICreateBox, ICreateCabinet, ICreateDrawer, ICreateStorageForm, IDrawBox, IDrawCabinet, IMaterial, ITypeContainer } from '../../../models/storage.model';
import { useStorageStore } from '../../../stores/storage';
import CanvasBox from '../../Canvas/CanvasBox.vue';
import CanvasCabinet from '../../Canvas/CanvasCabinet.vue';

const props = defineProps<{
  showModal: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:showModal', value: boolean): void;
}>();

const show = computed({
  get: () => props.showModal,
  set: (value: boolean) => emit('update:showModal', value)
});

const canvasBoxRef = ref<InstanceType<typeof CanvasBox> | null>(null);
const canvasCabinetRef = ref<InstanceType<typeof CanvasCabinet> | null>(null);

const message = useMessage();

const storageStore = useStorageStore();
const { storagesThings } = storeToRefs(storageStore);

const modalWidth = ref('90%');

const canvasWidth = 350;
const canvasHeight = 380;

const type: Ref<ITypeContainer> = ref('cabinet');
let lastType: ITypeContainer = 'cabinet';
const material: Ref<IMaterial> = ref('plastic');
const drawers = ref<ICreateDrawer[]>([]);
const drawerHistory = ref<ICreateDrawer[][]>([]); // History of drawer arrays

const formRef = ref<FormInst | null>(null)

const formValue = ref<ICreateStorageForm>({
  name: "",
  description: "",
  typeMaterial: 'cabinet-plastic',
  x_units: 3,
  y_units: 7,
  parent: '',
  depth: 2,
  boxLid: false,
  autoIncrement: false,
  drawer: {
    name: '',
    x_units: 1,
    y_units: 1
  }
});

const formRules = {
  name: {
    required: true,
    message: 'Please input the storage\'s name',
    trigger: ['input', 'blur']
  }
}

const formLayoutConfig = {
  cabinet: {
    typeSpan: 10,
    xSpan: 6,
    xOffset: 1,
    xLabel: "Width",
    ySpan: 6,
    yLabel: "Height",
  },
  box: {
    typeSpan: 11,
    xSpan: 6,
    xOffset: 0,
    xLabel: "Width",
    ySpan: 6,
    yLabel: "Height",
  }
}

const formLayout = computed(() => formLayoutConfig[type.value]);

const typeMaterial = computed<string>({
  get: (): string  => `${type.value}-${material.value}`,
  set: (value) => [type.value, material.value] = value.split('-') as [ITypeContainer, IMaterial]
});

const typeOptions: CascaderOption[] = [
  { label:'Cabinet', value: 'cabinet', children: [ 
    { label:'Plastic', value: 'cabinet-plastic' }, 
    { label:'Wood', value: 'cabinet-wood' }, 
    { label:'Metal', value: 'cabinet-metal' }
  ]},
  { label:'Box', value: 'box', children: [
    { label:'Plastic', value: 'box-plastic' }, 
    { label:'Cardboard', value: 'box-cardboard' } 
  ]}
];

const storageOptions = computed(() => {
  return storagesThings.value.map((storage) => {
    return {
      value: storage.id,
      label: buildLabel(storage as IContainer),
    }
  })
  .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }));
});

onMounted(() => {
  updateModalWidth();

  window.addEventListener('resize', updateModalWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateModalWidth)
})

const buildLabel = (storage: IContainer): string => {
  if(storage?.parent) {
    return `${buildLabel(storage.parent as IContainer)} / ${storage.name}`;
  }
  else {
    return storage?.name;
  }
}

const updateModalWidth = () => {
  const width = window.innerWidth;
  if (width > 1200) {
    modalWidth.value = '65vw';
  } else if (width > 768) {
    modalWidth.value = '80vw';
  } else {
    modalWidth.value = '90%';
  }
}

const closeModal = (value: boolean = false) => {
  show.value = value;
}

// Create a new storage
const createStorage = async (e: MouseEvent) => {
  e.preventDefault();
  await formRef.value?.validate((errors) => {
    if (errors) {
      message.error('Check the form for required fields.');
      return;
    }
  })

  if(type.value === 'cabinet') {
    const layout = getLayout();
    const hasEmptySpot = layout.some(row => row.some(col => !col));
  
    if (hasEmptySpot) {
      message.error('Cabinet has to be completly filled with drawers!');
      return;
    }

    await createStorageCabinet();
  }
  else if(type.value === 'box') {
    await createStorageBox();
  }
};

const createStorageBox = async () => {
  const box: ICreateBox = {
    name: formValue.value.name,
    description: formValue.value.description,
    type: type.value,
    material: material.value,
    x_units: formValue.value.x_units,
    y_units: formValue.value.y_units,
    depth: formValue.value.depth,
    lid: formValue.value.boxLid,
    parent: formValue.value.parent
  }

  try {
    await storageStore.createStorageBox(box);
    message.success('Box created successfully.');
    closeModal();

  } catch {
    message.error('There was an error creating the box.');
  }
}

const createStorageCabinet = async () => {
  const cabinet: ICreateCabinet = {
    name: formValue.value.name,
    description: formValue.value.description,
    type: type.value,
    material: material.value,
    x_units: formValue.value.x_units,
    y_units: formValue.value.y_units,
    drawers: drawers.value
  }

  try {
    await storageStore.createStorageCabinet(cabinet);
    message.success('Cabinet created successfully.');
    closeModal();
  } catch {
    message.error('There was an error creating the cabinet.');
  }
}

const addDrawer = (type: 'row' | 'column') => {
  let position;
  const { x_units, y_units } = formValue.value;
  const { name, x_units: x_drawer_units, y_units: y_drawer_units } = formValue.value.drawer;

  if (x_drawer_units > x_units || y_drawer_units > y_units) {
    message.error("Drawer is too large for the cabinet dimensions!");
    return;
  }

  const layout = getLayout();

  position = type === "row" ?
    canFitInRow(x_drawer_units, y_drawer_units, layout) :
    canFitInColumn(x_drawer_units, y_drawer_units, layout);

  if (position) {
    const {x_pos, y_pos} = position;
    saveDrawerHistory();
    const label = formValue.value.autoIncrement ? `${name} ${drawers.value.length + 1}` : name;
    drawers.value.push({
      name : label,
      type: 'drawer',
      description: '',
      x_pos,
      y_pos,
      x_units: x_drawer_units,
      y_units: y_drawer_units,
    });
    drawStorage();
  } 
  else {
    message.warning("No space available to add the drawer!");
  }
};

const canFitInRow = (width: number, height: number, layout: boolean[][]) => {
  const { x_units, y_units } = formValue.value;

  for (let yu = 0; yu < y_units; yu++) {
    for (let xu = 0; xu <= x_units - width; xu++) {
      let fits = true;
      if (yu + height > y_units) continue; // Skip if height exceeds cabinet
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (layout[yu + y] && layout[yu + y][xu + x]) {
            fits = false;
            break;
          }
        }
        if (!fits) break;
      }
      if (fits) return { x_pos: xu, y_pos: yu };
    }
  }
  return null;
};

const canFitInColumn = (width: number, height: number, layout: boolean[][]) => {
  const { x_units, y_units } = formValue.value;

  for (let xu = 0; xu < x_units; xu++) {
    for (let yu = 0; yu <= y_units - height; yu++) {
      let fits = true;
      if (xu + width > x_units) continue; // Skip if width exceeds cabinet
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (layout[xu + y] && layout[yu+ y][xu + x]) {
            fits = false;
            break;
          }
        }
        if (!fits) break;
      }
      if (fits) return { x_pos: xu, y_pos: yu };
    }
  }
  return null;
};

const saveDrawerHistory = () => {
  drawerHistory.value.push([...drawers.value]);
};

const resetDrawersAndRedraw = () => {
  if(lastType == 'box' && type.value == 'cabinet') {
    drawerHistory.value = [];
    drawers.value = [];
  }
  drawStorage();
  lastType = type.value;
};

const undo = () => {
  if (drawerHistory.value.length > 0) {
    // Restore the last state from history
    const lastState = drawerHistory.value.pop(); // Get and remove the last state
    if (lastState) {
      drawers.value = lastState;
    }
  }
  drawStorage();
};

const validateX = (x_input: number) => {
  if(type.value === "box") return true;
  const { x_units, y_units } = formValue.value;

  if(x_input >= x_units) {
    return true;
  }
  else {
    const layout = getLayout();
    return !!canFitInColumn(1, y_units, layout);
  }
}

const validateY = (y_input: number) => {
  if(type.value === "box") return true;
  const { x_units, y_units } = formValue.value;

  if(y_input >= y_units) {
    return true;
  }
  else {
    const layout = getLayout();
    return !!canFitInRow(x_units, 1, layout);
  }
}

const getLayout = (): boolean[][] => {
  const { x_units, y_units } = formValue.value;
  const layout = Array.from({ length: y_units }, () => Array.from({ length: x_units }, () => false));

  drawers.value.forEach(({ x_pos, y_pos, x_units, y_units }) => {
    for (let yu = 0; yu < y_units; yu++) {
      for (let xu = 0; xu < x_units; xu++) {
        layout[y_pos + yu][x_pos + xu] = true;
      }
    }
  });

  return layout;
}

const drawStorage = async () => {
  await nextTick();
  if(type.value === "box") {
    const box: IDrawBox = {
      material: material.value,
      x_units: formValue.value.x_units,
      y_units: formValue.value.y_units,
      depth: formValue.value.depth,
      lid: formValue.value.boxLid,
    }
    canvasBoxRef.value?.draw(box);
  } 
  else {
    const cabinet: IDrawCabinet = {
      material: material.value,
      x_units: formValue.value.x_units,
      y_units: formValue.value.y_units,
      drawers: drawers.value
    }
    canvasCabinetRef.value?.draw(cabinet);
  }
}
</script>

<style scoped lang="sass">
.create-storage
  display: flex
  flex-direction: row
  width: 100%

.create-storage-form
  margin: 0 8px
  width: 100%
    
.create-storage-canvas
  display: flex
  justify-content: center
  align-self: center
  background-color: rgba(255, 255, 255, 0.05)
  margin: 0 8px

</style>