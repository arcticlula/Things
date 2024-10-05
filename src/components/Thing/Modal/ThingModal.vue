<template>
  <n-modal :show="show" @update:show="closeModal" preset="card" title="Thing" :style="{ width: modalWidth }" :mask-closable="false">
    <n-thing content-style="margin-top: 10px;">
      <template #header>
        {{ thing?.name }}
      </template>
      {{ thing?.description }}
      <template #footer>
        <n-space size="small" style="margin-top: 4px">
          <n-tag v-for="tag in thing?.tags" :key="tag.id" :bordered="false" type="info" size="small">
            {{ tag.name }}
          </n-tag>
        </n-space>
      </template>
    </n-thing>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useDocument } from "vuefire";

import thingService from '../../../services/thing.service';

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

const modalWidth = ref('30%');

const thingQuery = thingService.thingQuery;
const thing = useDocument(thingQuery);

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

onMounted(() => {
  updateModalWidth()
  window.addEventListener('resize', updateModalWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateModalWidth)
})

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