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
              <n-cascader v-model:value="typeMaterial" placeholder="Select type/material of storage" check-strategy="child" :options="typeOptions" @update:value="resetDivisionsAndRedraw" />
            </n-form-item-gi>
            <n-form-item-gi :span="formLayout.xSpan" :offset="formLayout.xOffset" :label="formLayout.xLabel">
              <n-input-number v-model:value="formValue.x_units" min="1" @update:value="drawStorage" :validator="validateX"/>
            </n-form-item-gi>
            <n-form-item-gi :span="formLayout.ySpan" offset="1" :label="formLayout.yLabel">
              <n-input-number v-model:value="formValue.y_units" min="1" @update:value="drawStorage" :validator="validateY"/>
            </n-form-item-gi>
            <n-form-item-gi v-if="type === 'box' || type === 'organizer'" span="24" label="Does it have a papa?" path="parent">
              <n-select v-model:value="formValue.parent" placeholder="Does it have a papa?" filterable :options="storageOptions" />
            </n-form-item-gi>
            <n-form-item-gi v-if="type === 'box'" span="5" label="Depth">
              <n-input-number v-model:value="formValue.depth" min="1" @update:value="drawStorage"/>
            </n-form-item-gi>
            <n-form-item-gi v-if="type === 'box'" span="15" offset="1" label="Color">
              <n-color-picker v-model:value="formValue.color" :show-alpha="false" @update:value="drawStorage" :modes="['hex']" />
            </n-form-item-gi>
            <n-form-item-gi v-if="type === 'box'" span="2" offset="1" label="Lid">
              <n-switch v-model:value="formValue.boxLid" @update:value="drawStorage" />
            </n-form-item-gi>
            <n-form-item-gi v-if="type === 'cabinet' || type === 'organizer'" span="20" :label="type === 'organizer' ? 'Slot Name' : 'Drawer Name'">
              <n-input v-model:value="formValue.division.name">  
                <template v-if="formValue.autoIncrement" #suffix>{{ divisions.length + 1 }}</template>              
              </n-input>
            </n-form-item-gi>
            <n-form-item-gi v-if="type === 'cabinet' || type === 'organizer'" span="3" offset="1" label="Auto">
              <n-switch v-model:value="formValue.autoIncrement" @update:value="drawStorage" />
            </n-form-item-gi>
            <n-form-item-gi v-if="type === 'cabinet' || type === 'organizer'" span="5" :label="type === 'organizer' ? 'Slot Width' : 'Drawer Width'">
              <n-input-number v-model:value="formValue.division.x_units" min="1" :max="formValue.x_units" >
                <template #suffix>u.</template>              
              </n-input-number>
            </n-form-item-gi>
            <n-form-item-gi v-if="type === 'cabinet' || type === 'organizer'" span="5" offset="1" :label="type === 'organizer' ? 'Slot Height' : 'Drawer Height'">
              <n-input-number v-model:value="formValue.division.y_units" min="1" :max="formValue.y_units">
                <template #suffix>u.</template>              
              </n-input-number>
            </n-form-item-gi>
            <n-form-item-gi v-if="type === 'cabinet' || type === 'organizer'" span="5" offset="1" :label="type === 'organizer' ? 'Slot Ratio' : 'Drawer Ratio'">
              <n-input-number v-model:value="formValue.ratio" min="0.1" max="5" step="0.1" @update:value="drawStorage">
                <template #suffix>w/h</template>
              </n-input-number>
            </n-form-item-gi>
            <n-form-item-gi v-if="type === 'cabinet' || type === 'organizer'" span="4" offset="1">
              <n-button-group vertical style="width: 100%; margin-top: -28px">
                <n-button @click="addDivision('row')">
                  Add
                  <template #icon>
                    <n-icon><ArrowForward /></n-icon>
                  </template>
                </n-button>
                <n-button @click="addDivision('column')">
                  <template #icon>
                    <n-icon><ArrowDown /></n-icon>
                  </template>
                  Add
                </n-button>
              </n-button-group>
            </n-form-item-gi>
            <n-form-item-gi v-if="type === 'cabinet' || type === 'organizer'" span="1" offset="1">
              <n-button @click="undo" :disabled="divisions.length == 0" type="info" >
                <n-icon :component="Undo" />
              </n-button>
            </n-form-item-gi>
          </n-grid>
        </n-form>
        <div class="create-storage-canvas" :style="{ width: maxCanvasWidth + 'px', height: maxCanvasHeight + 'px' }">
          <CanvasBox v-if="type === 'box'" ref="canvasBoxRef" :c_width="canvasWidth" :c_height="canvasHeight" />
          <CanvasCabinet v-else-if="type === 'cabinet'" ref="canvasCabinetRef" :c_width="canvasWidth" :c_height="canvasHeight" />    
          <CanvasOrganizer v-else-if="type === 'organizer'" ref="canvasOrganizerRef" :c_width="canvasWidth" :c_height="canvasHeight" />    
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
import { ArrowForward, ArrowDown } from '@vicons/ionicons5';
import type { CascaderOption, FormInst } from 'naive-ui';
import { useMessage } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { computed, nextTick, onBeforeUnmount, onMounted, Ref, ref } from 'vue';

import { IContainer, ICreateBox, ICreateCabinet, ICreateDivision, ICreateOrganizer, ICreateStorageForm, IDrawBox, IDrawCabinet, IDrawOrganizer, IMaterial, ITypeContainer } from '../../../models/storage.model';
import { useStorageStore } from '../../../stores/storage';
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

const show = computed({
  get: () => props.showModal,
  set: (value: boolean) => emit('update:showModal', value)
});

const canvasBoxRef = ref<InstanceType<typeof CanvasBox> | null>(null);
const canvasCabinetRef = ref<InstanceType<typeof CanvasCabinet> | null>(null);
const canvasOrganizerRef = ref<InstanceType<typeof CanvasOrganizer> | null>(null);

const message = useMessage();

const storageStore = useStorageStore();
const { storagesThings } = storeToRefs(storageStore);

const modalWidth = ref('90%');

const maxCanvasWidth = 400;
const maxCanvasHeight = 400;

const previewStorage = computed(() => {
  const common = {
    type: type.value,
    material: material.value,
    x_units: formValue.value.x_units,
    y_units: formValue.value.y_units,
  };

  if (type.value === 'cabinet') {
    return { ...common, ratio: formValue.value.ratio, drawers: divisions.value };
  } else if (type.value === 'organizer') {
    return { ...common, ratio: formValue.value.ratio, slots: divisions.value };
  } else {
    return { ...common, depth: formValue.value.depth, lid: formValue.value.boxLid };
  }
});

const canvasDimensions = computed(() => {
  return calculateCanvasDimensions(previewStorage.value, maxCanvasWidth, maxCanvasHeight);
});

const canvasWidth = computed(() => canvasDimensions.value.width);
const canvasHeight = computed(() => canvasDimensions.value.height);

const type: Ref<ITypeContainer> = ref('cabinet');
let lastType: ITypeContainer = 'cabinet';
const material: Ref<IMaterial> = ref('plastic');
const divisions = ref<ICreateDivision[]>([]);
const divisionHistory = ref<ICreateDivision[][]>([]); // History of division arrays

const formRef = ref<FormInst | null>(null)

const formValue = ref<ICreateStorageForm>({
  name: "",
  description: "",
  typeMaterial: 'cabinet-plastic',
  x_units: 3,
  y_units: 7,
  ratio: 1.0,
  parent: '',
  depth: 2,
  boxLid: false,
  color: '#755C43',
  autoIncrement: false,
  division: {
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
    typeSpan: 12,
    xSpan: 5,
    xOffset: 1,
    xLabel: "Width",
    ySpan: 5,
    yLabel: "Height",
  },
  organizer: {
    typeSpan: 12,
    xSpan: 5,
    xOffset: 1,
    xLabel: "Width",
    ySpan: 5,
    yLabel: "Height",
  },
  box: {
    typeSpan: 12,
    xSpan: 5,
    xOffset: 1,
    xLabel: "Width",
    ySpan: 5,
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
  { label:'Organizer', value: 'organizer', children: [ 
    { label:'Plastic', value: 'organizer-plastic' }
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
    modalWidth.value = '85vw';
  } else if (width > 768) {
    modalWidth.value = '90vw';
  } else {
    modalWidth.value = '95%';
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
  else if(type.value === 'organizer') {
    const layout = getLayout();
    const hasEmptySpot = layout.some(row => row.some(col => !col));
  
    if (hasEmptySpot) {
      message.error('Organizer has to be completly filled!');
      return;
    }

    await createStorageOrganizer();
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
    color: formValue.value.color,
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
    ratio: formValue.value.ratio,
    x_units: formValue.value.x_units,
    y_units: formValue.value.y_units,
    drawers: divisions.value
  }

  try {
    await storageStore.createStorageCabinet(cabinet);
    message.success('Cabinet created successfully.');
    closeModal();
  } catch {
    message.error('There was an error creating the cabinet.');
  }
}

const createStorageOrganizer = async () => {
  const organizer: ICreateOrganizer = {
    name: formValue.value.name,
    description: formValue.value.description,
    type: type.value,
    material: material.value,
    ratio: formValue.value.ratio,
    x_units: formValue.value.x_units,
    y_units: formValue.value.y_units,
    slots: divisions.value,
    parent: formValue.value.parent
  }

  try {
    await storageStore.createStorageOrganizer(organizer);
    message.success('Organizer created successfully.');
    closeModal();
  } catch {
    message.error('There was an error creating the organizer.');
  }
}

const addDivision = (orientation: 'row' | 'column') => {
  let position;
  const { x_units, y_units } = formValue.value;
  const { name, x_units: x_division_units, y_units: y_division_units } = formValue.value.division;

  if (x_division_units > x_units || y_division_units > y_units) {
    message.error("Division is too large for the cabinet dimensions!");
    return;
  }

  const layout = getLayout();

  position = orientation === "row" ?
    canFitInRow(x_division_units, y_division_units, layout) :
    canFitInColumn(x_division_units, y_division_units, layout);

  if (position) {
    const {x_pos, y_pos} = position;
    saveDivisionHistory();
    const label = formValue.value.autoIncrement ? `${name} ${divisions.value.length + 1}` : name;
    divisions.value.push({
      name : label,
      type: type.value === 'cabinet' ? 'drawer' : 'slot',
      description: '',
      x_pos,
      y_pos,
      x_units: x_division_units,
      y_units: y_division_units,
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

const saveDivisionHistory = () => {
  divisionHistory.value.push([...divisions.value]);
};

const resetDivisionsAndRedraw = () => {
  if(lastType !== type.value) {
    divisionHistory.value = [];
    divisions.value = [];
  }
  
  if(type.value === 'box') {
    formValue.value.color = (material.value as string) === 'cardboard' ? '#755C43' : '#A0D0FF';
  }
  
  drawStorage();
  lastType = type.value;
};

const undo = () => {
  if (divisionHistory.value.length > 0) {
    // Restore the last state from history
    const lastState = divisionHistory.value.pop(); // Get and remove the last state
    if (lastState) {
      divisions.value = lastState;  
    }
  }
  drawStorage();
};

const validateX = (x_input: number) => {
  if(type.value === "box") return true;
  
  // Check if any existing divisions would be cut off by the new width
  const wouldCutOff = divisions.value.some(div => 
    div.x_pos + div.x_units > x_input
  );
  
  return !wouldCutOff;
}

const validateY = (y_input: number) => {
  if(type.value === "box") return true;
  
  // Check if any existing divisions would be cut off by the new height
  const wouldCutOff = divisions.value.some(div => 
    div.y_pos + div.y_units > y_input
  );
  
  return !wouldCutOff;
}

const getLayout = (): boolean[][] => {
  const { x_units, y_units } = formValue.value;
  const layout = Array.from({ length: y_units }, () => Array.from({ length: x_units }, () => false));

  divisions.value.forEach(({ x_pos, y_pos, x_units, y_units }) => {
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
      color: formValue.value.color,
    }
    canvasBoxRef.value?.draw(box);
  } 
  else if(type.value === "cabinet") {
    const cabinet: IDrawCabinet = {
      material: material.value,
      ratio: formValue.value.ratio,
      x_units: formValue.value.x_units,
      y_units: formValue.value.y_units,
      drawers: divisions.value
    }
    canvasCabinetRef.value?.draw(cabinet);
  }
  else if(type.value === "organizer") {
    const organizer: IDrawOrganizer = {
      material: material.value,
      ratio: formValue.value.ratio,
      x_units: formValue.value.x_units,
      y_units: formValue.value.y_units,
      slots: divisions.value
    }
    canvasOrganizerRef.value?.draw(organizer);
  }
}
</script>

<style scoped lang="sass">
.create-storage
  display: flex
  flex-direction: row
  width: 100%
    
.create-storage-canvas
  display: flex
  justify-content: center
  align-self: center
  align-items: center
  margin-left: 16px
  flex-shrink: 0

</style>