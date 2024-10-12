import { defineStore } from 'pinia';
import { useCollection } from 'vuefire';

import tagService from '../services/tag.service';

export const useTagStore = defineStore('tagStore', () => {
    const tagsQuery = tagService.tagsQuery;
  
    const tags = useCollection(tagsQuery);
  
    async function searchTags(value: string) {
      await tagService.searchTags(value);
    }

    return {
      searchTags,
      tags,
    };
});
