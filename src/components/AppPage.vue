<template>
  <div class="app-page">
    <!-- Top Navbar -->
    <header class="top-nav">
      <button class="icon-btn" @click="toggle">
        <Menu :size="20" />
      </button>
      <router-link to="/" class="title-link">
        <img src="../assets/barryscoreboard.svg" alt="Logo" class="logo" />
        <h2 class="title">
          <slot name="title"> BarryScoreboard </slot>
        </h2>
        <h3 class="sub-title">
          <slot name="sub-title"> {{ subTitle }} </slot>
        </h3>
      </router-link>
    </header>

    <!-- Backdrop (mobile + desktop overlay) -->
    <div v-if="isOpen" class="backdrop" @click="close" />

    <!-- Sidebar -->
    <aside :class="['sidebar', { open: isOpen }]">
      <div class="sidebar-header">
        <span>Menu</span>

        <button class="icon-btn close-btn" @click="close">
          <X :size="20" />
        </button>
      </div>
      <nav class="nav-links">
        <slot name="nav">
          <router-link to="/bracket">
            <Network :size="18" class="rotate-90" />
            <span>Bracket</span>
          </router-link>
          <router-link to="/scoreboard">
            <Monitor :size="18" />
            <span>Scoreboard</span>
          </router-link>
        </slot>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useBracketStore } from '../stores/bracket';
import { Menu, Monitor, Network, X } from '@lucide/vue';

const route = useRoute();
const bracketStore = useBracketStore();

const isOpen = ref(false);

function toggle() {
  isOpen.value = !isOpen.value;
}

function close() {
  isOpen.value = false;
}

const subTitle = computed(() => {
  switch (route.name) {
    case 'bracket':
      return '| Brackets';
    case 'bracket-create':
      return '| Create Bracket';
    case 'bracket-manage': {
      const bracketName = bracketStore.currentBracket?.name;
      return `| ${bracketName ?? 'Bracket'}`;
    }
    default:
      return undefined;
  }
});

watch(isOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : '';
});

watch(route, () => {
  isOpen.value = false;
});
</script>

<style scoped>
.app-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* Top Navbar */
.top-nav {
  display: flex;
  align-items: center;
  gap: 20px;
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

.sub-title {
  margin: 0;
  font-size: 16px;
}

.title-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: inherit;
}

.title-link:hover {
  opacity: 0.85;
}

.logo {
  width: 32px;
  height: 32px;
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

.nav-links a.router-link-active {
  font-weight: bold;
  background: var(--accent-bg);
}

/* Content */
.content {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  padding: 16px;
}
</style>
