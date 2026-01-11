import { doc } from 'firebase/firestore';
import { defineStore, storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useCollection, useDocument } from 'vuefire';

import thingService from '../services/thing.service';
import { IDBTag } from '../models/tag.model';
import { ICreateThing, IThing, IUpdateThing } from '../models/thing.model';
import tagService from '../services/tag.service';
import { useUserStore } from './user';

export const useThingStore = defineStore('thingStore', () => {
  const { userId } = storeToRefs(useUserStore());
  const thingId = ref('xixi');

  const thingDoc = computed(() =>
    userId.value ? doc(thingService.getThingsColl(userId.value), thingId.value) : null
  );

  const thingsQuery = thingService.thingsQuery;

  const thing = useDocument(thingDoc);
  const thingsCollection = useCollection(computed(() => userId.value ? thingsQuery.value : null));

  const isSearching = ref(false);
  const manualSearchResults = ref<IThing[]>([]);

  const things = computed(() => isSearching.value ? manualSearchResults.value : thingsCollection.value);

  function setThingId(id: string) {
    thingId.value = id;
  }

  async function searchThings(value: string, exactTag = false) {
    if (!value) {
      isSearching.value = false;
      thingService.searchThings(userId.value, '');
      return;
    }

    isSearching.value = true;

    if (exactTag) {
      // Exact tag search - only search by exact tag name
      const tag = await tagService.getTagByExactName(userId.value, value);

      if (tag && tag.things) {
        const thingIds = tag.things.map((ref) => ref.id);
        const thingsByTag = await thingService.getThingsByIds(userId.value, thingIds);
        manualSearchResults.value = thingsByTag as IThing[];
      } else {
        manualSearchResults.value = [];
      }
    } else {
      // Normal search - prefix matching for both name and tags
      const thingsByName = await thingService.getThingsByName(userId.value, value);
      const tags = await tagService.getTagsByName(userId.value, value);

      const thingIdsFromTags = new Set<string>();
      tags.forEach((tag: IDBTag) => {
        if (tag.things) {
          tag.things.forEach((ref) => thingIdsFromTags.add(ref.id));
        }
      });

      const thingsByTag = await thingService.getThingsByIds(userId.value, Array.from(thingIdsFromTags));

      const mergedMap = new Map();
      thingsByName.forEach((t) => mergedMap.set(t.id, t));
      thingsByTag.forEach((t) => mergedMap.set(t.id, t));

      manualSearchResults.value = Array.from(mergedMap.values()) as IThing[];
    }
  }

  function fetchUnassignedThings() {
    isSearching.value = false;
    thingService.getUnassignedThings(userId.value);
  }

  async function createThing(thing: ICreateThing) {
    await thingService.createThing(userId.value, thing);
  }

  async function updateThing(thing: IUpdateThing) {
    await thingService.updateThing(userId.value, thing);
  }

  async function assignThingToStorage(thingId: string, storageId: string | null) {
    await thingService.assignThingToStorage(userId.value, thingId, storageId);
  }

  return {
    thing,
    thingId,
    things,
    setThingId,
    searchThings,
    fetchUnassignedThings,
    createThing,
    updateThing,
    assignThingToStorage,
    $reset: () => {
      thingId.value = 'xixi';
      isSearching.value = false;
      manualSearchResults.value = [];
    }
  };
});
