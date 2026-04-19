<template>
  <div class="app-page">
    <!-- Top Navbar -->
    <header class="top-nav">
      <button class="icon-button" @click="toggle">
        <Menu :size="20"/>
      </button>
      <h2 class="title">
        <slot name="title">BarryScoreboard</slot>
      </h2>
    </header>

    <!-- Backdrop (mobile + desktop overlay) -->
    <div
      v-if="isOpen"
      class="backdrop"
      @click="close"
    />

    <!-- Sidebar -->
    <aside :class="['sidebar', { open: isOpen }]">
      <div class="sidebar-header">
        <span>Menu</span>

        <button class="icon-button close-btn" @click="close">
        <X :size="20"/>
        </button>
    </div>
      <nav class="nav-links">
        <slot name="nav">
          <!-- Default fallback -->
          <a href="#">
            <Network :size="18" class="rotate-90"/>
            <span>Bracket</span>
          </a>
          <a href="#">
            <ListOrdered :size="18"/>
            <span>Leaderboard</span>
          </a>
          <a href="#">
            <Monitor :size="18"/>
            <span>Scoreboard</span>
          </a>
        </slot>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Top Navbar */
.top-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 56px;
  padding: 0 16px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 1250;
}

.title {
  margin: 0;
  font-size: 18px;
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 56px;
  left: 0;
  height: calc(100vh - 56px);
  overflow-y: auto;
  background: var(--bg);
  border-right: 1px solid var(--border);
  transform: translateX(-100%);
  transition: transform 0.25s ease;
  z-index: 1200;
}

/* Open state */
.sidebar.open {
  transform: translateX(0);
}

.sidebar-header {
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border);
  color: var(--text-h);
  font-size: 16px;
}

.close-btn {
  color: var(--text-h);
}

/* Desktop */
@media (min-width: 768px) {
  .sidebar {
    width: 260px;
  }
}

/* Mobile */
@media (max-width: 767px) {
  .sidebar {
    width: 100%;
  }
}

/* Backdrop */
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1150;
}

/* Nav links */
.nav-links {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;
}

.nav-links a {
  display: flex;
  align-items: center;
  gap: 10px; 
  text-decoration: none;
  color: var(--text-h);
  padding: 8px;
  border-radius: 6px;
  font-size: 16px;
}

.nav-links a:hover {
  background: var(--accent-bg);
}

/* Content */
.content {
  flex: 1;
  padding: 16px;
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ListOrdered, Menu, Monitor, Network, X } from '@lucide/vue';

const isOpen = ref(false);

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

watch(isOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
});
</script>
