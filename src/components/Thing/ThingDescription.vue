<template>
  <n-h2 prefix="bar" align-text>Thing</n-h2>
  <n-grid cols="24" :x-gap="24" item-responsive responsive="screen" class="thing-info-grid">
    <!-- Left Column: Name, Qty, Description -->
    <n-gi :span="isWide ? '24 m:12' : '24'">
      <n-grid cols="24" :y-gap="8" class="thing-info-grid-data">
        <n-gi :span="isWide ? '20' : '24'">
          <div class="label"><n-text type="warning">Name</n-text></div>
          <div class="value">{{ thing?.name }}</div>
        </n-gi>
        <n-gi :span="isWide ? '4' : '24'">
          <div class="label"><n-text type="warning">Qty</n-text></div>
          <div class="value">{{ thing?.stock }}</div>
        </n-gi>
        <n-gi span="24">
          <div class="label"><n-text type="warning">Description</n-text></div>
          <div class="value" v-if="thing?.description">{{ thing?.description }}</div>
          <div class="value" v-else>None</div>
        </n-gi>
      </n-grid>
    </n-gi>

    <!-- Right Column: Tags -->
    <n-gi :span="isWide ? '24 m:12' : '24'">
      <div class="info-tags" :class="{ 'info-tags-stacked': !isWide }">
        <div class="label"><n-text type="warning">Tags</n-text></div>
        <n-space :y-gap="8" v-if="thing?.tags && thing.tags?.length > 0" size="small" style="margin-top: 4px">
          <n-tag 
            v-for="tag in thing.tags" 
            :key="tag.id" 
            :bordered="false" 
            type="info" 
            size="small"
            class="tags"
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
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';

import { useThingStore } from '../../stores/thing';

interface Props {
  isWide?: boolean;
}

withDefaults(defineProps<Props>(), {
  isWide: false,
});

const thingStore = useThingStore();
const { thing } = storeToRefs(thingStore);

const router = useRouter();
const route = useRoute();

const handleTagClick = (tagName: string) => {
  router.push({ query: { ...route.query, q: tagName, exact: 'true' } });
};

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

.label
  margin-bottom: 4px
  font-size: 14px

.value
  font-size: 14px
  white-space: pre-wrap

@media (max-width: 1024px)
  .info-tags
    border-left: none
    padding-left: 0
</style>