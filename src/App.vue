<script setup lang="ts">
import { ref } from "vue";
import ProfileGrid from "@/features/profiles/ProfileGrid.vue";
import FeedTimeline from "@/features/feed/FeedTimeline.vue";
import ChatView from "@/features/chat/ChatView.vue";
import BottomNav from "@/components/BottomNav.vue";

const activeView = ref<"profiles" | "feed" | "chat">("feed");
</script>

<template>
  <main class="lumina-app-root">
    <!-- Top View Switcher -->
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
          📰 Tablica Wpisów
        </button>
        <button 
          type="button" 
          class="switch-tab" 
          :class="{ 'is-active': activeView === 'profiles' }"
          @click="activeView = 'profiles'"
        >
          ✨ Katalog Profili
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
    </header>

    <!-- Active View Area -->
    <FeedTimeline v-if="activeView === 'feed'" />
    <ProfileGrid v-else-if="activeView === 'profiles'" />
    <ChatView v-else />

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
</style>
