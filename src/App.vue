<template>
  <AppPage>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </AppPage>
</template>

<script setup lang="ts">
import AppPage from './components/AppPage.vue';
</script>
