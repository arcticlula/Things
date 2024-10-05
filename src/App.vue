<template>
  <n-config-provider :theme="darkTheme">
    <n-message-provider>
      <n-global-style />
      <div class="body">
        <router-view />
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
  import { darkTheme } from 'naive-ui'

</script>


<style scoped lang="sass">
.body
  margin: 16px 32px

.header
  padding: 16px
  > *
    margin: 0 16px
  .n-button
    font-size: 20px
</style>
