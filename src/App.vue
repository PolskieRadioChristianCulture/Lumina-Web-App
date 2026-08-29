<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import ProfileGrid from "@/features/profiles/ProfileGrid.vue";
import FeedTimeline from "@/features/feed/FeedTimeline.vue";
import ChatView from "@/features/chat/ChatView.vue";
import BottomNav from "@/components/BottomNav.vue";
import AuthModal from "@/features/auth/AuthModal.vue";
import BaseButton from "@/components/BaseButton.vue";

const activeView = ref<"profiles" | "feed" | "chat">("feed");
const authStore = useAuthStore();

onMounted(() => {
  authStore.init();
});
</script>

<template>
  <main class="lumina-app-root">
    <!-- Top Header -->
    <header class="app-header">
      <div class="header-logo">
        <span class="logo-accent">LUMINA</span>
        <span class="logo-sub">Christian Culture</span>
      </div>

      <div class="view-switch">
        <button 
          type="button" 
          class="switch-tab" 
          :class="{ 'is-active': activeView === 'feed' }"
          @click="activeView = 'feed'"
        >
          📰 Tablica
        </button>
        <button 
          type="button" 
          class="switch-tab" 
          :class="{ 'is-active': activeView === 'profiles' }"
          @click="activeView = 'profiles'"
        >
          ✨ Odkrywaj
        </button>
        <button 
          type="button" 
          class="switch-tab" 
          :class="{ 'is-active': activeView === 'chat' }"
          @click="activeView = 'chat'"
        >
          💬 Komunikator
        </button>
      </div>

      <!-- Auth Controls -->
      <div class="header-auth">
        <div v-if="authStore.isAuthenticated" class="user-pill">
          <span class="user-name">{{ authStore.displayName }}</span>
          <span v-if="authStore.isAdmin" class="admin-badge">Admin</span>
          <button type="button" class="btn-logout" @click="authStore.logout" title="Wyloguj">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </div>
        <BaseButton 
          v-else 
          variant="gold" 
          size="sm" 
          icon="fa-solid fa-user-lock"
          @click="authStore.openAuthModal"
        >
          Zaloguj się
        </BaseButton>
      </div>
    </header>

    <!-- Active View Area -->
    <FeedTimeline v-if="activeView === 'feed'" />
    <ProfileGrid v-else-if="activeView === 'profiles'" />
    <ChatView v-else />

    <!-- Auth Modal -->
    <AuthModal />

    <!-- Bottom Navigation Bar -->
    <BottomNav 
      :current-route="activeView === 'feed' ? 'tablica' : (activeView === 'profiles' ? 'odkrywaj' : 'czat')" 
      :unread-chat-count="1"
    />
  </main>
</template>

<style>
@import "@/styles/tokens.css";

body {
  margin: 0;
  padding: 0;
  background-color: var(--cc-bg-primary, #070c18);
  color: var(--cc-text-primary, #ffffff);
  font-family: var(--cc-font-body, sans-serif);
  -webkit-font-smoothing: antialiased;
}

* {
  box-sizing: border-box;
}

.lumina-app-root {
  min-height: 100vh;
  padding-bottom: 70px;
}

.app-header {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  border-bottom: 1px solid var(--cc-border-glass, rgba(255, 255, 255, 0.08));
}

.header-logo {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.logo-accent {
  font-family: var(--cc-font-heading, "Outfit", sans-serif);
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #ffffff, #fef08a, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo-sub {
  font-size: 0.76rem;
  color: #94a3b8;
  font-weight: 600;
}

.view-switch {
  display: flex;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 4px;
  gap: 4px;
}

.switch-tab {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 6px 14px;
  border-radius: 12px;
  font-family: var(--cc-font-heading, "Outfit", sans-serif);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.switch-tab.is-active {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #000000;
}

.header-auth {
  display: flex;
  align-items: center;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.08);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.user-name {
  font-size: 0.84rem;
  font-weight: 700;
  color: #ffffff;
}

.admin-badge {
  background: #f59e0b;
  color: #000000;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 8px;
  text-transform: uppercase;
}

.btn-logout {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px 4px;
  font-size: 0.85rem;
  transition: color 0.2s ease;
}

.btn-logout:hover {
  color: #ef4444;
}
</style>
