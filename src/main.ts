import { createApp } from 'vue'
import './style.sass'
import App from './App.vue'
import router from "./router";
import { createPinia } from 'pinia';
import { VueFire, VueFireFirestoreOptionsAPI } from 'vuefire';
import { getFirestore } from 'firebase/firestore';
import { firebaseApp } from './firebase';

const app = createApp(App)
const pinia = createPinia();

app.use(VueFire, {
    firebaseApp, 
    modules: [VueFireFirestoreOptionsAPI()]
})

app.use(pinia);
app.use(router);
app.mount('#app');

const db = getFirestore(firebaseApp);

export { db };