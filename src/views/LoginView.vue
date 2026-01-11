<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img class="app-logo" src="/logo.png" alt="Things Logo" />
        <h1 class="app-title">Things</h1>
      </div>

      <div class="login-content">
        <n-button
          type="primary"
          size="medium"
          block
          @click="handleGoogleSignIn"
          :loading="isLoading"
          class="google-btn"
        >
          <template #icon>
            <n-icon><svg viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg></n-icon>
          </template>
          Sign in with Google
        </n-button>

        <n-divider>or</n-divider>

        <n-button
          secondary
          size="large"
          block
          @click="handleGuestMode"
          :loading="isLoading"
          class="guest-btn"
        >
          <template #icon>
            <n-icon><PlayCircleOutline /></n-icon>
          </template>
          Guest Mode
        </n-button>

        <n-button
          v-if="isLocalhost"
          tertiary
          size="medium"
          block
          @click="handleTestMode"
          :loading="isLoading"
          class="test-btn"
        >
          <template #icon>
            <n-icon><CodeSlash /></n-icon>
          </template>
          Test Mode (Dev)
        </n-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { PlayCircleOutline, CodeSlash } from '@vicons/ionicons5';
import { useUserStore } from '../stores/user';

const router = useRouter();
const message = useMessage();
const userStore = useUserStore();

const isLoading = ref(false);
const isLocalhost = computed(() => {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
});

const handleGoogleSignIn = async () => {
  isLoading.value = true;
  try {
    await userStore.signInWithGoogle();
    message.success('Signed in successfully!');
    router.push('/things');
  } catch {
    message.error('Failed to sign in');
    console.error('Google sign-in error');
  } finally {
    isLoading.value = false;
  }
};

const handleGuestMode = async () => {
  isLoading.value = true;
  try {
    await userStore.signInGuest();
    message.info('Entered guest mode');
    router.push('/things');
  } catch {
    message.error('Failed to enter guest mode');
    console.error('Guest mode error');
  } finally {
    isLoading.value = false;
  }
};

const handleTestMode = async () => {
  isLoading.value = true;
  try {
    await userStore.signInTest();
    message.info('Entered test mode');
    router.push('/things');
  } catch {
    message.error('Failed to enter test mode');
    console.error('Test mode error');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped lang="sass">
.login-container
  display: flex
  align-items: center
  justify-content: center
  padding: 20px

.login-card
  background: rgba(255, 255, 255, 0.05)
  backdrop-filter: blur(10px)
  border: 1px solid rgba(255, 255, 255, 0.1)
  border-radius: 24px
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2)
  padding: 48px 40px
  width: 100%
  max-width: 420px
  animation: fadeInUp 0.6s ease-out

.login-header
  text-align: center
  margin-bottom: 20px

.app-logo
  width: 240px
  height: 240px
  margin: 0 auto
  display: block
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))

.app-title
  font-size: 40px
  font-weight: 700
  margin: 0 0 12px 0
  color: var(--n-text-color)

.app-subtitle
  font-size: 18px
  color: var(--n-text-color-disabled)
  margin: 0

.login-content
  display: flex
  flex-direction: column
  gap: 16px

.google-btn
  height: 56px
  font-size: 16px
  font-weight: 600
  transition: all 0.3s ease
  
  &:hover
    transform: translateY(-2px)
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4)

.guest-btn
  height: 56px
  font-size: 16px
  font-weight: 600
  transition: all 0.3s ease
  
  &:hover
    transform: translateY(-2px)

.test-btn
  height: 44px
  font-size: 14px
  margin-top: 8px
  opacity: 0.7
  
  &:hover
    opacity: 1

@keyframes fadeInUp
  from
    opacity: 0
    transform: translateY(30px)
  to
    opacity: 1
    transform: translateY(0)

@media (max-width: 600px)
  .login-card
    padding: 32px 24px

  .app-logo
    width: 90px
    height: 90px

  .app-title
    font-size: 44px
</style>
