import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth';

export const useUserStore = defineStore('user', () => {
    const user = ref<User | null>(null);
    const userId = ref('');
    const authMode = ref<'google' | 'guest' | 'test' | null>(null);
    const isInitialized = ref(false);

    const isAuthenticated = computed(() => user.value !== null || authMode.value !== null);

    const displayName = computed(() => {
        if (user.value) {
            return user.value.displayName || user.value.email || 'User';
        }
        if (authMode.value === 'guest') return 'Guest';
        if (authMode.value === 'test') return 'Test User';
        return 'Guest';
    });

    const initializeAuth = () => {
        return new Promise<void>((resolve) => {
            onAuthStateChanged(auth, (firebaseUser) => {
                if (firebaseUser) {
                    user.value = firebaseUser;
                    userId.value = firebaseUser.uid;
                    authMode.value = 'google';
                } else {
                    const savedMode = localStorage.getItem('authMode');
                    if (savedMode === 'guest') {
                        userId.value = '111_guest_user';
                        authMode.value = 'guest';
                    } else if (savedMode === 'test') {
                        userId.value = '111_test_user';
                        authMode.value = 'test';
                    } else {
                        user.value = null;
                        authMode.value = null;
                    }
                }
                isInitialized.value = true;
                resolve();
            });
        });
    };

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await resetStores();
            const result = await signInWithPopup(auth, provider);
            user.value = result.user;
            userId.value = result.user.uid;
            authMode.value = 'google';
            localStorage.removeItem('authMode');
        } catch (error) {
            console.error('Google sign-in error:', error);
            throw error;
        }
    };

    const signInGuest = async () => {
        await resetStores();
        userId.value = '111_guest_user';
        authMode.value = 'guest';
        localStorage.setItem('authMode', 'guest');
    };

    const signInTest = async () => {
        await resetStores();
        userId.value = '111_test_user';
        authMode.value = 'test';
        localStorage.setItem('authMode', 'test');
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            user.value = null;
            userId.value = '';
            authMode.value = null;
            localStorage.removeItem('authMode');

            await resetStores();
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    };

    const setUserId = (id: string) => {
        userId.value = id;
    };

    const resetStores = async () => {
        // Reset all stores to clear previous user's data
        try {
            const { useStorageStore } = await import('./storage');
            const { useThingStore } = await import('./thing');
            const { useTagStore } = await import('./tag');

            useStorageStore().$reset();
            useThingStore().$reset();
            useTagStore().$reset();
        } catch (error) {
            console.error('Error resetting stores:', error);
        }
    };

    return {
        user,
        userId,
        authMode,
        isAuthenticated,
        isInitialized,
        displayName,
        initializeAuth,
        signInWithGoogle,
        signInGuest,
        signInTest,
        signOut,
        setUserId
    };
});
