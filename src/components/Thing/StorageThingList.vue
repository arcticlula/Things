<template>
  <n-h2 prefix="bar" align-text>
    Storage
  </n-h2>
  <n-descriptions label-placement="top" :column="1">
    <n-descriptions-item>
      <template #label>
        <n-text type="warning">Name</n-text>
      </template>
      {{ storage?.name }}
    </n-descriptions-item>
    <n-descriptions-item v-if="storage?.description"> 
      <template #label>
        <n-text type="warning">Description</n-text>
      </template>
      {{ storage?.description }}
    </n-descriptions-item>
    <n-descriptions-item v-if="storage?.storages?.length > 0">
      <template #label>
        <n-text type="warning">Storages</n-text>
      </template>
      <n-list hoverable clickable>
        <n-list-item class="storages-list-item" v-for="childStorage in storage.storages" :key="childStorage.id" @click="goToStorage(childStorage.id)">
          {{ childStorage.name }}
        </n-list-item>
      </n-list>
    </n-descriptions-item>
    <n-descriptions-item v-if="storage?.things?.length > 0">
      <template #label>
        <n-text type="warning">Things</n-text>
      </template>
      <n-list hoverable clickable>
      <n-list-item class="things-list-item" v-for="thing in storage.things" :key="thing.id" @click="openThingModal(thing.id)">
        {{ thing.name }}
      </n-list-item>
    </n-list>
    </n-descriptions-item>
  </n-descriptions>
  <ThingModal v-if="showThingModal" v-model:showModal="showThingModal"></ThingModal>
</template>

<script setup lang="ts">
// import { useMessage } from 'naive-ui';
import { ref } from 'vue';
import { useDocument } from "vuefire";

import thingService from '../../services/thing.service';
import storageService from '../../services/storage.service';

const emit = defineEmits(['update:storageId']);

const showThingModal = ref(false);

const storageQuery = storageService.storageQuery;
const storage = useDocument(storageQuery);

const openThingModal = async (thingId: string) => {
  await thingService.getThingById(thingId);
  showThingModal.value = true;
}

const goToStorage = (id: string) => {
  emit('update:storageId', id);
}

</script>
<style scoped lang="sass">
 .storages-list-item, .things-list-item
  background-color: rgba(255, 255, 255, 0.01)
</style>
