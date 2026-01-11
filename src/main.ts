import { createApp } from 'vue'
import './style.sass'
import App from './App.vue'
import router from "./router";
import { createPinia } from 'pinia';
import { VueFire, VueFireFirestoreOptionsAPI } from 'vuefire';
import { getFirestore } from 'firebase/firestore';
import { firebaseApp } from './firebase';
import { useUserStore } from './stores/user';

const app = createApp(App)
const pinia = createPinia();

app.use(VueFire, {
    firebaseApp,
    modules: [VueFireFirestoreOptionsAPI()]
})

app.use(pinia);
app.use(router);

const userStore = useUserStore();
userStore.initializeAuth().then(() => {
    app.mount('#app');

    if (userStore.isAuthenticated && router.currentRoute.value.path === '/login') {
        router.push('/things');
    }
});

const db = getFirestore(firebaseApp);

export { db };