<template>
  <n-modal :show="show" @update:show="closeModal" preset="card" title="Thing" :style="{ width: modalWidth }" :mask-closable="false">
    <n-grid cols="24" :x-gap="24" item-responsive responsive="screen" class="thing-info-grid">
      <!-- Left Column: Name, Qty, Description -->
      <n-gi span="24 m:12">
        <n-grid cols="24" :y-gap="8" class="thing-info-grid-data">
          <n-gi span="20">
            <div class="label"><n-text type="warning">Name</n-text></div>
            <div class="value">{{ thing?.name }}</div>
          </n-gi>
          <n-gi span="4">
            <div class="label"><n-text type="warning">Qty</n-text></div>
            <div class="value">{{ thing?.stock }}</div>
          </n-gi>
          <n-gi span="24">
            <div class="label"><n-text type="warning">Description</n-text></div>
            <div class="value" v-if="thing?.description">{{ thing?.description }}</div>
            <div v-else>None</div>
          </n-gi>
        </n-grid>
      </n-gi>

      <!-- Right Column: Tags -->
      <n-gi span="24 m:12">
        <div class="info-tags">
          <div class="label"><n-text type="warning">Tags</n-text></div>
          <n-space :y-gap="8" v-if="thing?.tags && thing.tags?.length > 0" size="small" style="margin-top: 4px">
            <n-tag 
              v-for="tag in thing.tags" 
              :key="tag.id" 
              :bordered="false" 
              type="info" 
              size="small"
              style="cursor: pointer"
              @click="handleTagClick(tag.name)"
            >
              {{ tag.name }}
            </n-tag>
          </n-space>
          <div v-else>None</div>
        </div>
      </n-gi>
    </n-grid>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useThingStore } from '../../../stores/thing';
import { useRouter } from 'vue-router';

const props = defineProps<{
  showModal: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:showModal', value: boolean): void;
}>();

const thingStore = useThingStore();
const { thing } = storeToRefs(thingStore);

const router = useRouter();

const modalWidth = ref('60%');

const show = computed({
  get: () => props.showModal,
  set: (value: boolean) => emit('update:showModal', value)
});

onMounted(() => {
    updateModalWidth();
  window.addEventListener('resize', updateModalWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateModalWidth)
})

const handleTagClick = (tagName: string) => {
  router.push({ name: 'home', params: { view: 'things' }, query: { q: tagName } });
  closeModal();
};

const updateModalWidth = () => {
  const width = window.innerWidth;
  
  if (width > 1200) {
    modalWidth.value = '50vw';
  } else if (width > 768) {
    modalWidth.value = '70vw';
  } else {
    modalWidth.value = '80vw';
  }
}

const closeModal = (value: boolean = false) => {
  show.value = value;
}
</script>

<style scoped lang="sass">
.thing-info-grid
  margin-top: 16px
  gap: 0 !important

.thing-info-grid-data
  margin-bottom: 8px
  gap: 8px !important

.info-tags
  height: 100%
  border-left: 1px solid rgba(255, 255, 255, 0.1)
  padding-left: 24px

.info-tags-stacked
  border-left: none
  padding-left: 0
  margin-top: 16px
  padding-top: 16px
  border-top: 1px solid rgba(255, 255, 255, 0.1)

.label
  margin-bottom: 4px
  font-size: 14px

.value
  font-size: 14px
  white-space: pre-wrap
</style>