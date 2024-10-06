<template>
  <n-h2 prefix="bar" align-text>
      Thing
  </n-h2>
  <n-descriptions label-placement="top" :column="2">
    <n-descriptions-item>
      <template #label>
        <n-text type="warning">Name</n-text>
      </template>
      {{ thing?.name }}
    </n-descriptions-item>
    <n-descriptions-item>
      <template #label>
        <n-text type="warning">Qty</n-text>
      </template>
      {{ thing?.stock }}
    </n-descriptions-item>
    <n-descriptions-item :span="2">
      <template #label>
        <n-text type="warning">Tags</n-text>
      </template>
      <n-space v-if="thing?.tags && thing.tags?.length > 0" size="small" style="margin-top: 4px">
        <n-tag v-for="tag in thing.tags" :key="tag.id" :bordered="false" type="info" size="small">
          {{ tag.name }}
        </n-tag>
      </n-space>
      <div v-else>None</div>
    </n-descriptions-item>
    <n-descriptions-item :span="2">
      <template #label>
        <n-text type="warning">Description</n-text>
      </template>
      {{ thing?.description }}
    </n-descriptions-item>
  </n-descriptions>
</template>

<script setup lang="ts">

import { IThing } from '../../models/thing.model';

const { thing } = defineProps<{ thing: IThing }>();

</script>
<style scoped lang="sass">


</style>
