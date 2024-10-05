import { createApp } from 'vue'
import './style.sass'
import App from './App.vue'
import router from "./router";
import { VueFire, VueFireFirestoreOptionsAPI } from 'vuefire';
import { getFirestore } from 'firebase/firestore';
import { firebaseApp } from './firebase';

createApp(App).use(VueFire, {firebaseApp, modules: [VueFireFirestoreOptionsAPI()]}).use(router).mount('#app');

const db = getFirestore(firebaseApp);

export { db };