<template>
  <n-h2 prefix="bar" align-text> Storage </n-h2>
    <n-descriptions label-placement="top" :column="1">
      <n-descriptions-item>
        <template #label><n-text type="warning">Name</n-text></template>
        <div class="storage-background">
          {{ storage?.name }}
        </div>
      </n-descriptions-item>
      <n-descriptions-item v-if="storage?.description"> 
        <template #label><n-text type="warning">Description</n-text></template>
        <div class="storage-background">
          {{ storage?.description }}
        </div>
      </n-descriptions-item>
      <n-descriptions-item v-if="storage?.storages?.length > 0">
        <template #label><n-text type="warning">Storages</n-text></template>
        <div class="storage-background">
          <n-button class="storages-list-button" v-for="childStorage in storage?.storages" :key="childStorage.id" strong secondary size="tiny" @click="goToStorage(childStorage.id)">
            {{ childStorage.name }}
          </n-button>
        </div>
      </n-descriptions-item>
        <n-descriptions-item v-if="storage?.things?.length > 0">
          <template #label><n-text type="warning">Things</n-text></template>
          <div class="storage-background">
            <n-button class="things-list-button" v-for="thing in storage?.things" :key="thing.id" strong secondary type="info" size="tiny" @click="openThingModal(thing.id)">
              {{ thing.name }}
            </n-button>
          </div>
        </n-descriptions-item>
    </n-descriptions>
  <ThingModal v-if="showThingModal" v-model:showModal="showThingModal"></ThingModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useStorageStore } from '../../stores/storage';
import { useThingStore } from '../../stores/thing';

const showThingModal = ref(false);

const storageStore = useStorageStore();
const thingStore = useThingStore();

const { storageId, storage } = storeToRefs(storageStore);
const { thingId } = storeToRefs(thingStore);

const openThingModal = async (id: string) => {
  thingId.value = id;
  showThingModal.value = true;
}

const goToStorage = (id: string) => {
  storageId.value = id;
}
</script>

<style scoped lang="sass">
 .storage-background
  background-color: rgba(255, 255, 255, 0.01)

 .storages-list-button, .things-list-button
  margin: 4px
</style>
