<script setup lang="ts">
import { ref } from "vue";
import type { DirectChatRoom } from "@/types/chat";
import ChatConversationList from "./ChatConversationList.vue";
import ChatWindow from "./ChatWindow.vue";

const currentUserId = ref("user_me_01");
const currentUserName = ref("Ja");
const currentUserAvatar = ref("avatar_wioletta_official.jpg");

const conversations = ref<DirectChatRoom[]>([
  {
    id: "chat_cezary",
    chatId: "chat_cezary",
    participants: ["user_me_01", "cezaryrgowski"],
    otherUserName: "Cezary Rogowski",
    otherUserAvatar: "avatar_cezary_official.jpg",
    otherUserSlug: "cezaryrgowski",
    lastMessage: "Niech Pan Ci błogosławi dzisiaj i strzeże! 🙏",
    lastMessageTime: "12:15",
    unreadCount: 1
  },
  {
    id: "chat_wioletta",
    chatId: "chat_wioletta",
    participants: ["user_me_01", "wiolettarogowska"],
    otherUserName: "Wioletta Rogowska",
    otherUserAvatar: "avatar_wioletta_official.jpg",
    otherUserSlug: "wiolettarogowska",
    lastMessage: "Świetnie! Cieszę się ze wspólnej modlitwy ✨",
    lastMessageTime: "Wczoraj",
    unreadCount: 0
  },
  {
    id: "chat_andrzej",
    chatId: "chat_andrzej",
    participants: ["user_me_01", "andrzejthiel"],
    otherUserName: "Andrzej Thiel",
    otherUserAvatar: "avatar_andrzejthiel.jpg",
    otherUserSlug: "andrzejthiel",
    lastMessage: "Chwała Bogu za to dzieło w radiu CC!",
    lastMessageTime: "27 sie",
    unreadCount: 0
  }
]);

const selectedChat = ref<DirectChatRoom | null>(conversations.value[0]);

function handleSelectChat(chat: DirectChatRoom) {
  selectedChat.value = chat;
}

function handleBack() {
  selectedChat.value = null;
}
</script>

<template>
  <div class="lumina-chat-view-container">
    <div class="chat-layout-card">
      <!-- Left Conversations List -->
      <div 
        class="conversations-column"
        :class="{ 'hide-on-mobile': selectedChat !== null }"
      >
        <ChatConversationList
          :conversations="conversations"
          :selected-chat-id="selectedChat ? (selectedChat.id || selectedChat.chatId) : null"
          @select="handleSelectChat"
        />
      </div>

      <!-- Right Active Chat Window -->
      <div 
        class="chat-window-column"
        :class="{ 'hide-on-mobile': selectedChat === null }"
      >
        <ChatWindow
          v-if="selectedChat"
          :chat="selectedChat"
          :current-user-id="currentUserId"
          :current-user-name="currentUserName"
          :current-user-avatar="currentUserAvatar"
          @back="handleBack"
        />
        <div v-else class="no-chat-selected">
          <i class="fa-solid fa-comments empty-illustration"></i>
          <h3>Wybierz rozmowę</h3>
          <p>Kliknij na dowolną konwersację z listy po lewej stronie, aby otworzyć czat na żywo.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lumina-chat-view-container {
  width: 100%;
  max-width: 1100px;
  height: calc(100vh - 160px);
  min-height: 520px;
  margin: 0 auto;
  padding: 16px;
}

.chat-layout-card {
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid var(--cc-border-glass, rgba(255, 255, 255, 0.10));
  border-radius: var(--cc-radius-lg, 20px);
  overflow: hidden;
  box-shadow: var(--cc-shadow-card, 0 12px 32px rgba(0, 0, 0, 0.55));
  backdrop-filter: blur(16px);
  display: flex;
}

.conversations-column {
  width: 340px;
  height: 100%;
  flex-shrink: 0;
}

.chat-window-column {
  flex: 1;
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.no-chat-selected {
  margin: auto;
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.empty-illustration {
  font-size: 3.5rem;
  color: #334155;
  margin-bottom: 16px;
}

.no-chat-selected h3 {
  font-family: var(--cc-font-heading, "Outfit", sans-serif);
  color: #ffffff;
  margin: 0 0 8px 0;
}

.no-chat-selected p {
  font-size: 0.88rem;
  max-width: 320px;
  margin: 0 auto;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .conversations-column {
    width: 100%;
  }

  .hide-on-mobile {
    display: none !important;
  }
}
</style>
