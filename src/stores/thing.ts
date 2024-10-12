import { doc } from 'firebase/firestore';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useCollection, useDocument } from 'vuefire';

import thingService from '../services/thing.service';
import { ICreateThing, IUpdateThing } from '../models/thing.model';

export const useThingStore = defineStore('thingStore', () => {
    const thingId = ref('xixi');

    const thingDoc = computed(() =>
      doc(thingService.thingsColRef, thingId.value)
    );

    const thingsQuery = thingService.thingsQuery;
  
    const thing = useDocument(thingDoc);
    const things = useCollection(thingsQuery);
  
    function setThingId(id: string) {
      thingId.value = id;
    }

    async function searchThings(value: string) {
      await thingService.searchThings(value);
    }

    async function createThing(thing: ICreateThing) {
      await thingService.createThing(thing);
    }

    async function updateThing(thing: IUpdateThing) {
      await thingService.updateThing(thing);
    }
  
    return {
      thing,        
      thingId,
      things,
      setThingId,
      searchThings,
      createThing,
      updateThing
    };
});
