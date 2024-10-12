<template>
  <n-modal :show="show" @update:show="closeModal" preset="card" title="Thing" :style="{ width: modalWidth }" :mask-closable="false">
    <n-descriptions label-placement="top" :column="2">
      <n-descriptions-item>
        <template #label><n-text type="warning">Name</n-text></template>
        {{ thing?.name }}
      </n-descriptions-item>
      <n-descriptions-item>
        <template #label><n-text type="warning">Qty</n-text></template>
        {{ thing?.stock }}
      </n-descriptions-item>
      <n-descriptions-item><template #label><n-text type="warning">Tags</n-text></template>
        <n-space v-if="thing?.tags?.length > 0" size="small" style="margin-top: 4px">
          <n-tag v-for="tag in thing?.tags" :key="tag.id" :bordered="false" type="info" size="small">
            {{ tag.name }}
          </n-tag>
        </n-space>
        <div v-else>None</div>
      </n-descriptions-item>
      <n-descriptions-item>
        <template #label><n-text type="warning">Description</n-text></template>
        {{ thing?.description }}
      </n-descriptions-item>
    </n-descriptions>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useThingStore } from '../../../stores/thing';

const props = defineProps<{
  showModal: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:showModal', value: boolean): void;
}>();

const thingStore = useThingStore();
const { thing } = storeToRefs(thingStore);

const modalWidth = ref('30%');

const show = computed({
  get: () => props.showModal,
  set: (value: boolean) => emit('update:showModal', value)
});

onMounted(() => {
  updateModalWidth()
  window.addEventListener('resize', updateModalWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateModalWidth)
})

const updateModalWidth = () => {
  const width = window.innerWidth;
  if (width > 1200) {
    modalWidth.value = '30%';
  } else if (width > 768) {
    modalWidth.value = '50%';
  } else {
    modalWidth.value = '70%';
  }
}

const closeModal = (value: boolean = false) => {
  show.value = value;
}
</script>

<style scoped lang="sass">
.create-thing
  display: flex
  flex-direction: row
  width: 100%

.create-thing-form
  margin: 0 8px
  width: 100%

.create-thing-canvas
  display: flex
  justify-content: center
  align-self: center
  background-color: rgba(255, 255, 255, 0.1)
  margin: 8px

.create-thing-canvas-empty
  display: flex
  justify-content: center
  align-items: center

</style>