<template>
  <AppPage>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <ConfirmModal />
  </AppPage>
</template>

<script setup lang="ts">
import AppPage from './components/AppPage.vue';
import ConfirmModal from './components/ui/ConfirmModal.vue';
</script>
