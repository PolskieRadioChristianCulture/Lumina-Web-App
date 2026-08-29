<script setup lang="ts">
import { ref, computed } from "vue";
import type { DirectChatRoom } from "@/types/chat";

const props = defineProps<{
  conversations: DirectChatRoom[];
  selectedChatId?: string | null;
}>();

const emit = defineEmits<{
  (e: "select", chat: DirectChatRoom): void;
  (e: "newChat"): void;
}>();

const searchQuery = ref("");

const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) return props.conversations;
  const q = searchQuery.value.toLowerCase().trim();
  return props.conversations.filter(
    (c) => (c.otherUserName && c.otherUserName.toLowerCase().includes(q)) ||
           (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
  );
});

function handleAvatarError(e: Event) {
  const target = e.target as HTMLImageElement;
  target.onerror = null;
  target.src = "lumina_icon.jpg";
}
</script>

<template>
  <aside class="chat-conversations-panel">
    <!-- Header & Search -->
    <div class="panel-header">
      <div class="panel-title-row">
        <h3 class="panel-title">
          <i class="fa-solid fa-comments"></i> Wiadomości
        </h3>
        <button 
          type="button" 
          class="btn-new-chat" 
          @click="emit('newChat')" 
          title="Rozpocznij nową rozmowę"
        >
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
      </div>

      <div class="chat-search-box">
        <i class="fa-solid fa-magnifying-glass search-icon"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Szukaj w rozmowach..." 
          class="chat-search-input"
        />
      </div>
    </div>

    <!-- Conversations List -->
    <div class="conversations-list">
      <div v-if="filteredChats.length === 0" class="empty-conversations">
        <i class="fa-regular fa-comment-dots empty-icon"></i>
        <p>Brak aktywnych konwersacji</p>
      </div>

      <div
        v-for="chat in filteredChats"
        :key="chat.id || chat.chatId"
        class="conversation-item"
        :class="{ 'is-selected': selectedChatId === (chat.id || chat.chatId) }"
        @click="emit('select', chat)"
        role="button"
        tabindex="0"
      >
        <div class="item-avatar-box">
          <img 
            :src="chat.otherUserAvatar || 'lumina_icon.jpg'" 
            :alt="chat.otherUserName || 'Rozmówca'" 
            class="item-avatar"
            @error="handleAvatarError"
          />
          <span class="status-dot-online"></span>
        </div>

        <div class="item-info">
          <div class="item-header-row">
            <span class="item-name">{{ chat.otherUserName || 'Rozmówca LUMINA' }}</span>
            <span v-if="chat.lastMessageTime" class="item-time">
              {{ typeof chat.lastMessageTime === 'string' ? chat.lastMessageTime : 'Teraz' }}
            </span>
          </div>
          <div class="item-preview-row">
            <p class="item-preview">{{ chat.lastMessage || 'Rozpocznij rozmowę...' }}</p>
            <span v-if="chat.unreadCount && chat.unreadCount > 0" class="item-badge">
              {{ chat.unreadCount }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.chat-conversations-panel {
  width: 100%;
  height: 100%;
  background: rgba(11, 19, 43, 0.95);
  border-right: 1px solid var(--cc-border-glass, rgba(255, 255, 255, 0.08));
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.panel-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.panel-title {
  margin: 0;
  font-family: var(--cc-font-heading, "Outfit", sans-serif);
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--cc-text-primary, #ffffff);
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title i {
  color: var(--cc-gold-primary, #f59e0b);
}

.btn-new-chat {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: var(--cc-gold-primary, #f59e0b);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-new-chat:hover {
  background: var(--cc-gold-primary, #f59e0b);
  color: #000000;
}

.chat-search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 0.8rem;
}

.chat-search-input {
  width: 100%;
  padding: 8px 12px 8px 34px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-family: inherit;
  font-size: 0.84rem;
  outline: none;
  box-sizing: border-box;
}

.chat-search-input:focus {
  border-color: var(--cc-gold-primary, #f59e0b);
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.empty-conversations {
  text-align: center;
  padding: 40px 16px;
  color: #64748b;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  cursor: pointer;
  transition: background 0.2s ease;
  border-left: 3px solid transparent;
}

.conversation-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.conversation-item.is-selected {
  background: rgba(245, 158, 11, 0.12);
  border-left-color: var(--cc-gold-primary, #f59e0b);
}

.item-avatar-box {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.item-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.status-dot-online {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #10b981;
  border: 2px solid #0b132b;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-header-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}

.item-name {
  font-family: var(--cc-font-heading, "Outfit", sans-serif);
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--cc-text-primary, #ffffff);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-time {
  font-size: 0.70rem;
  color: var(--cc-text-muted, #64748b);
  flex-shrink: 0;
}

.item-preview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.item-preview {
  margin: 0;
  font-size: 0.80rem;
  color: var(--cc-text-secondary, #94a3b8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-badge {
  background: #ef4444;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 10px;
  flex-shrink: 0;
}
</style>
