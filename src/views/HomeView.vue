<template>
  <n-space justify="space-between" align="center">
    <n-gradient-text :size="24" type="success">
      Things
    </n-gradient-text>
    <n-space align="center">
      <n-button size="small" strong secondary type="info" style="margin-right: 24px" @click="router.push('/unassigned')">
        <template #icon><n-icon :component="ListSharp"></n-icon></template> List Unassigned
      </n-button>
      <n-text class="user-display">{{ userStore.displayName }}</n-text>
      <div class="user-avatar" v-if="userStore.user?.photoURL">
        <n-avatar :src="userStore.user.photoURL" round size="small" />
      </div>
      <n-button secondary circle @click="handleSignOut">
        <template #icon><n-icon :component="LogOutOutline"></n-icon></template>
      </n-button>
      <n-button secondary circle type="primary">
        <template #icon><n-icon :component="SettingsSharp"></n-icon></template>
      </n-button>
    </n-space>
  </n-space>
  <div class="search-things">
    <n-grid cols="24" item-responsive responsive="screen">
      <n-gi span="11">
        <n-input-group>
          <n-select v-model:value="searchType" class="search-type-select" :options="searchOptions" @update:value="search"/>
          <n-input v-model:value="searchValue" type="text" :placeholder="searchPlaceholder" @keyup.enter="search" clearable />
        </n-input-group>
      </n-gi>
      <n-gi span="4" offset="1">
          <n-button type="primary" secondary @click="search">Search</n-button>
      </n-gi>
      <n-gi span="7" offset="1" class="action-buttons">
        <n-button strong secondary type="info" @click="openCreateStorageModal()" class="create-storage-btn">Create Storage</n-button>
        <n-button strong secondary type="info" @click="openCreateThingModal()">Create Thing</n-button>
      </n-gi>
      <n-gi span="24" class="search-things-tabs">
        <div v-if="searchType === 'things'">
          <ThingsView />
        </div>
        <div v-else><StoragesView /></div>
      </n-gi>
    </n-grid>
  </div>

  <CreateThingModal v-if="showCreateThingModal" v-model:showModal="showCreateThingModal"></CreateThingModal>
  <CreateStorageModal v-if="showCreateStorageModal" v-model:showModal="showCreateStorageModal"></CreateStorageModal>
</template>

<script lang="ts" setup>
import { LogOutOutline, SettingsSharp, ListSharp } from '@vicons/ionicons5';
import { useMessage } from "naive-ui";
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import StoragesView from "../views/StoragesView.vue";
import ThingsView from "../views/ThingsView.vue";

import { useStorageStore } from '../stores/storage';
import { useThingStore } from '../stores/thing';
import { useUserStore } from '../stores/user';

const thingStore = useThingStore();
const storageStore = useStorageStore();
const userStore = useUserStore();

const { thingId } = storeToRefs(thingStore);
const { storageId } = storeToRefs(storageStore);

const message = useMessage();
const route = useRoute();
const router = useRouter();

// State variables
const showCreateThingModal = ref(false);
const showCreateStorageModal = ref(false);

const searchType = ref((route.params.view as string) || 'things');
const searchValue = ref((route.query.q as string) || '');

const searchOptions = ref([
  { label: 'Things',  value: 'things'},
  { label: 'Storages', value: 'storages' }
]);

const searchPlaceholder = computed(() => searchType.value === 'things' ? 'Search Things by Name or Tag...' : 'Search Storages...');

onMounted(() => {
  search();
})

const handleSignOut = async () => {
  try {
    await userStore.signOut();
    message.success('Signed out successfully');
    router.push('/login');
  } catch {
    message.error('Failed to sign out');
    console.error('Sign out error');
  }
};

const search = async () => {
  if (searchValue.value !== route.query.q) {
    if (searchValue.value) {
        // Remove exact flag when user types in search box
        await router.push({ query: { q: searchValue.value } });
    } else {
        await router.push({ query: {} });
    }
  }

  if(searchType.value === 'things') {
    const exactTag = route.query.exact === 'true';
    await thingStore.searchThings(searchValue.value, exactTag);
  }
  else if(searchType.value === 'storages') {
    await storageStore.searchStorages(searchValue.value);
  }
}

const openCreateStorageModal = () => {
  showCreateStorageModal.value = true;
}

const openCreateThingModal = () => {
  showCreateThingModal.value = true;
}

watch(searchType, (newVal) => {
  if (newVal !== route.params.view) {
    router.push({ name: 'home', params: { view: newVal } });
  }
});

watch(
  () => route.params.view,
  (newView) => {
    if (newView && newView !== searchType.value) {
      searchType.value = newView as string;
      thingId.value = 'xixi';
      storageId.value = 'xixi';

      searchValue.value = !route.query.q ? '' : route.query.q as string;
      search();
    }
  }
);

watch(
  () => route.query.q,
  (newQ) => {
    if (newQ !== searchValue.value) {
      searchValue.value = (newQ as string) || '';
      search();
    }
  }
);
</script>


<style scoped lang="sass">

.user-avatar
  display: flex
  align-items: center

.search-things
  margin: 24px 0

.search-things-tabs
  margin-top: 16px

.search-type-select
  width: 150px

.action-buttons
  justify-self: self-end

.create-storage-btn
  margin-right: 4px

.user-display
  display: flex
  align-items: center
  color: var(--n-text-color-disabled)
</style>