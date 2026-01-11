import { defineStore, storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useCollection } from 'vuefire';

import tagService from '../services/tag.service';

import { useUserStore } from './user';

export const useTagStore = defineStore('tagStore', () => {
  const { userId } = storeToRefs(useUserStore());
  const tagsQuery = tagService.tagsQuery;

  const tags = useCollection(computed(() => userId.value ? tagsQuery.value : null));

  async function searchTags(value: string) {
    await tagService.searchTags(userId.value, value);
  }

  return {
    searchTags,
    tags,
    $reset: () => {
      tagsQuery.value = null;
    }
  };
});
