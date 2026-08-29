<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    currentRoute?: string;
    unreadChatCount?: number;
  }>(),
  {
    currentRoute: "odkrywaj",
    unreadChatCount: 0
  }
);

const navItems = [
  { id: "tablica", label: "Tablica", icon: "fa-solid fa-newspaper", url: "lumina-tablica.html" },
  { id: "odkrywaj", label: "Odkrywaj", icon: "fa-solid fa-sparkles", url: "lumina.html" },
  { id: "modlitwa", label: "Modlitwa", icon: "fa-solid fa-hands-praying", url: "modlitwa.html" },
  { id: "czat", label: "Czat", icon: "fa-solid fa-comments", url: "lumina-tablica.html?open_messenger=1", hasBadge: true },
  { id: "profil", label: "Mój Profil", icon: "fa-solid fa-user", url: "lumina-profile.html" }
];

function navigate(url: string) {
  if (typeof window !== "undefined") {
    window.location.href = url;
  }
}
</script>

<template>
  <nav class="lumina-bottom-nav" aria-label="Nawigacja główna aplikacji">
    <div class="nav-container">
      <button
        v-for="item in navItems"
        :key="item.id"
        type="button"
        class="nav-tab"
        :class="{ 'is-active': currentRoute === item.id }"
        @click="navigate(item.url)"
        :aria-label="item.label"
      >
        <div class="nav-icon-box">
          <i :class="item.icon"></i>
          <!-- Unread Badge -->
          <span 
            v-if="item.hasBadge && unreadChatCount > 0" 
            class="nav-badge"
          >
            {{ unreadChatCount > 99 ? '99+' : unreadChatCount }}
          </span>
        </div>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.lumina-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: rgba(7, 12, 24, 0.88);
  backdrop-filter: blur(18px);
  border-top: 1px solid var(--cc-border-glass, rgba(255, 255, 255, 0.1));
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.6);
  padding: 6px 12px max(6px, env(safe-area-inset-bottom, 6px));
}

.nav-container {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.nav-tab {
  background: transparent;
  border: none;
  color: var(--cc-text-muted, #64748b);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s ease;
  min-width: 54px;
}

.nav-tab:hover {
  color: #cbd5e1;
}

.nav-tab.is-active {
  color: var(--cc-gold-primary, #f59e0b);
}

.nav-icon-box {
  position: relative;
  font-size: 1.15rem;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-tab.is-active .nav-icon-box {
  transform: translateY(-2px);
  filter: drop-shadow(0 2px 8px rgba(245, 158, 11, 0.5));
}

.nav-badge {
  position: absolute;
  top: -4px;
  right: -8px;
  background: #ef4444;
  color: #ffffff;
  font-size: 0.64rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 10px;
  border: 1.5px solid #070c18;
}

.nav-label {
  font-family: var(--cc-font-heading, Outfit, sans-serif);
  font-size: 0.68rem;
  font-weight: 700;
}
</style>
