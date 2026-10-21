<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import type { ChatMessage, DirectChatRoom } from "@/types/chat";
import { chatRepository } from "@/services/repositories/chatRepository";

const props = defineProps<{
  chat: DirectChatRoom;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
}>();

const emit = defineEmits<{
  (e: "back"): void;
}>();

const messages = ref<ChatMessage[]>([]);
const messageText = ref("");
const isSending = ref(false);
const sendError = ref<string | null>(null);
const pendingDeliveries = ref<Record<string, { chatId: string; receiverId: string; text: string }>>({});
const messageLoadError = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

let unsubscribe: (() => void) | null = null;
const draftsByTarget = new Map<string, string>();
const sendErrorsByTarget = new Map<string, string>();

function chatIdFor(chat: DirectChatRoom): string {
  return chat.chatId || chat.id;
}

function receiverIdFor(chat: DirectChatRoom): string {
  return chat.participants?.find((participant) => participant !== props.currentUserId) || "";
}

function targetKeyFor(chat: DirectChatRoom): string {
  return JSON.stringify([chatIdFor(chat), receiverIdFor(chat)]);
}

const activeTargetKey = computed(() => targetKeyFor(props.chat));
const currentPendingDelivery = computed(() => pendingDeliveries.value[activeTargetKey.value]);
const deliveryUnconfirmed = computed(() => Boolean(currentPendingDelivery.value));

const quickEmojis = ["🙏", "❤️", "✨", "🕊️", "🔥", "🙌"];

const isPartnerVerified = computed(() => {
  return Boolean(props.chat.isVerified);
});

const isPartnerOnline = computed(() => {
  return Boolean(props.chat.isOnline);
});

const partnerStatusText = computed(() => {
  if (props.chat.isOnline) return "Aktywny teraz";
  if (props.chat.statusText) return props.chat.statusText;
  if (props.chat.lastSeen) return `Ostatnio: ${props.chat.lastSeen}`;
  return "Społeczność LUMINA";
});

function formatTimestamp(ts: any): string {
  if (!ts) return "Teraz";
  if (typeof ts === "string") return ts;
  if (ts.toDate && typeof ts.toDate === "function") {
    const d = ts.toDate();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (ts.seconds) {
    const d = new Date(ts.seconds * 1000);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return "Teraz";
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

function startSubscription(chatId: string) {
  if (unsubscribe) unsubscribe();
  messages.value = [];
  messageLoadError.value = false;
  unsubscribe = chatRepository.subscribeToMessages(
    chatId,
    (loaded) => {
      messages.value = loaded;
      messageLoadError.value = false;
      scrollToBottom();
      // Oznaczamy odebrane wiadomości jako przeczytane przez odbiorcę
      chatRepository.markMessagesAsRead(chatId, props.currentUserId);
    },
    undefined,
    () => {
      messageLoadError.value = true;
    }
  );
}

watch(
  () => props.chat.chatId || props.chat.id,
  (newId) => {
    if (newId) startSubscription(newId);
  },
  { immediate: true }
);

watch(activeTargetKey, (newTarget, oldTarget) => {
  if (oldTarget) {
    if (!pendingDeliveries.value[oldTarget]) {
      draftsByTarget.set(oldTarget, messageText.value);
    }
  }

  const pendingDelivery = pendingDeliveries.value[newTarget];
  messageText.value = pendingDelivery?.text ?? draftsByTarget.get(newTarget) ?? "";
  sendError.value = pendingDelivery?.text
    ? "Nie udało się potwierdzić wysłania. Wiadomość mogła zostać zapisana — sprawdź historię rozmowy przed ponowną próbą. Tekst zachowano."
    : sendErrorsByTarget.get(newTarget) || null;
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

async function handleSendMessage() {
  if (!messageText.value.trim() || isSending.value || deliveryUnconfirmed.value) return;

  const text = messageText.value.trim();
  const chatId = props.chat.chatId || props.chat.id;
  const otherUserId = props.chat.participants?.find((p) => p !== props.currentUserId) || "";
  const targetKey = activeTargetKey.value;

  sendErrorsByTarget.delete(targetKey);
  if (activeTargetKey.value === targetKey) sendError.value = null;
  isSending.value = true;

  try {
    const res = await chatRepository.sendMessage(
      chatId,
      props.currentUserId,
      props.currentUserName,
      props.currentUserAvatar || "lumina_icon.jpg",
      text,
      otherUserId
    );

    if (res?.status === "sent") {
      draftsByTarget.delete(targetKey);
      sendErrorsByTarget.delete(targetKey);
      if (activeTargetKey.value === targetKey) {
        messageText.value = "";
        sendError.value = null;
        scrollToBottom();
      }
    } else if (res?.status === "sent_preview_update_failed") {
      draftsByTarget.delete(targetKey);
      const error = "Wiadomość została wysłana, ale nie udało się zaktualizować podglądu rozmowy. Nie wysyłaj jej ponownie.";
      sendErrorsByTarget.set(targetKey, error);
      if (activeTargetKey.value === targetKey) {
        messageText.value = "";
        sendError.value = error;
        scrollToBottom();
      }
    } else if (res?.status === "delivery_unconfirmed") {
      const error = "Nie udało się potwierdzić wysłania. Wiadomość mogła zostać zapisana — sprawdź historię rozmowy przed ponowną próbą. Tekst zachowano.";
      pendingDeliveries.value = {
        ...pendingDeliveries.value,
        [targetKey]: { chatId, receiverId: otherUserId, text }
      };
      sendErrorsByTarget.set(targetKey, error);
      if (activeTargetKey.value === targetKey) sendError.value = error;
    } else {
      const error = "Nie udało się rozpocząć zapisu wiadomości. Twój tekst został zachowany.";
      sendErrorsByTarget.set(targetKey, error);
      if (activeTargetKey.value === targetKey) sendError.value = error;
    }
  } catch (err) {
    console.error("[ChatWindow] Błąd podczas wysyłania wiadomości:", err);
    const error = "Nie udało się potwierdzić wysłania. Wiadomość mogła zostać zapisana — sprawdź historię rozmowy przed ponowną próbą. Tekst zachowano.";
    pendingDeliveries.value = {
      ...pendingDeliveries.value,
      [targetKey]: { chatId, receiverId: otherUserId, text }
    };
    sendErrorsByTarget.set(targetKey, error);
    if (activeTargetKey.value === targetKey) sendError.value = error;
  } finally {
    isSending.value = false;
  }
}

function acknowledgeDeliveryCheck() {
  draftsByTarget.set(activeTargetKey.value, messageText.value);
  sendErrorsByTarget.delete(activeTargetKey.value);
  const { [activeTargetKey.value]: _acknowledged, ...remainingDeliveries } = pendingDeliveries.value;
  pendingDeliveries.value = remainingDeliveries;
  sendError.value = null;
}

function addEmoji(emoji: string) {
  messageText.value += emoji;
}
</script>

<template>
  <section class="chat-window-panel">
    <!-- Active Chat Header -->
    <header class="chat-header">
      <button 
        type="button" 
        class="btn-back-mobile" 
        @click="emit('back')" 
        title="Wróć do listy rozmów"
      >
        <i class="fa-solid fa-arrow-left"></i>
      </button>

      <div class="chat-partner-info">
        <img 
          :src="chat.otherUserAvatar || 'lumina_icon.jpg'" 
          :alt="chat.otherUserName || 'Rozmówca'" 
          class="partner-avatar"
        />
        <div>
          <div class="partner-name-row">
            <span class="partner-name">{{ chat.otherUserName || 'Rozmówca LUMINA' }}</span>
            <i 
              v-if="isPartnerVerified" 
              class="fa-solid fa-circle-check check-icon" 
              title="Zweryfikowany Profil"
            ></i>
          </div>
          <span 
            class="partner-status" 
            :class="{ 'is-online': isPartnerOnline, 'is-offline': !isPartnerOnline }"
          >
            <span v-if="isPartnerOnline" class="status-indicator-dot"></span>
            {{ partnerStatusText }}
          </span>
        </div>
      </div>
    </header>

    <!-- Messages Container -->
    <div ref="messagesContainer" class="messages-container">
      <div v-if="messageLoadError" class="chat-load-error-banner" role="alert">
        <span>Nie udało się załadować wiadomości. Sprawdź połączenie i spróbuj ponownie.</span>
        <button
          type="button"
          class="btn-retry-messages"
          @click="startSubscription(chat.chatId || chat.id)"
        >
          Spróbuj ponownie
        </button>
      </div>

      <div v-if="messages.length === 0 && !messageLoadError" class="empty-messages-state">
        <i class="fa-solid fa-hand-holding-heart empty-chat-icon"></i>
        <p>Rozpocznij budującą rozmowę z {{ chat.otherUserName || 'bratem/siostrą' }} ✨</p>
      </div>

      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-bubble-wrapper"
        :class="{ 'is-outgoing': msg.senderId === currentUserId, 'is-incoming': msg.senderId !== currentUserId }"
      >
        <div class="message-bubble">
          <p class="msg-text">{{ msg.text }}</p>
          <span class="msg-meta">
            {{ formatTimestamp(msg.timestamp) }}
            <!-- Potwierdzenie dostarczenia i przeczytania dla wiadomości wychodzących -->
            <template v-if="msg.senderId === currentUserId">
              <i 
                v-if="msg.isRead || msg.status === 'read'" 
                class="fa-solid fa-check-double read-check is-read" 
                title="Przeczytano"
              ></i>
              <i 
                v-else 
                class="fa-solid fa-check read-check is-sent" 
                title="Wysłano / Dostarczono"
              ></i>
            </template>
          </span>
        </div>
      </div>
    </div>

    <!-- Quick Emoji Bar -->
    <div class="quick-emoji-bar">
      <button 
        v-for="emoji in quickEmojis" 
        :key="emoji" 
        type="button" 
        class="btn-emoji"
        @click="addEmoji(emoji)"
      >
        {{ emoji }}
      </button>
    </div>

    <!-- Error Banner (gdy zapis się nie powiódł, tekst nie jest tracony) -->
    <div v-if="sendError" class="chat-send-error-banner" role="alert">
      <i class="fa-solid fa-triangle-exclamation error-icon"></i>
      <span class="error-text">{{ sendError }}</span>
      <button
        v-if="deliveryUnconfirmed"
        type="button"
        class="btn-confirm-delivery-check"
        @click="acknowledgeDeliveryCheck"
      >
        Sprawdziłem historię — pozwól ponowić
      </button>
      <button 
        v-if="!deliveryUnconfirmed"
        type="button" 
        class="btn-dismiss-error" 
        @click="sendError = null" 
        title="Ukryj powiadomienie"
      >
        ✕
      </button>
    </div>

    <!-- Input Bar -->
    <footer class="chat-input-bar">
      <form @submit.prevent="handleSendMessage" class="chat-input-form">
        <input 
          v-model="messageText" 
          type="text" 
          placeholder="Napisz budującą wiadomość..." 
          class="chat-input-field"
          :disabled="isSending || deliveryUnconfirmed"
        />
        <button 
          type="submit" 
          class="btn-send-message" 
          :disabled="!messageText.trim() || isSending || deliveryUnconfirmed"
          title="Wyślij wiadomość"
        >
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </form>
    </footer>
  </section>
</template>

<style scoped>
.chat-window-panel {
  width: 100%;
  height: 100%;
  background: var(--cc-bg-primary, #070c18);
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 14px 20px;
  background: rgba(15, 23, 42, 0.9);
  border-bottom: 1px solid var(--cc-border-glass, rgba(255, 255, 255, 0.08));
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-back-mobile {
  display: none;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px 8px;
}

@media (max-width: 768px) {
  .btn-back-mobile {
    display: block;
  }
}

.chat-partner-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.partner-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(245, 158, 11, 0.4);
}

.partner-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.partner-name {
  font-family: var(--cc-font-heading, "Outfit", sans-serif);
  font-weight: 800;
  font-size: 0.96rem;
  color: var(--cc-text-primary, #ffffff);
}

.check-icon {
  color: #38bdf8;
  font-size: 0.76rem;
}

.partner-status {
  font-size: 0.72rem;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
}

.partner-status.is-online {
  color: #10b981;
}

.partner-status.is-offline {
  color: #94a3b8;
}

.status-indicator-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.7);
  display: inline-block;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-messages-state {
  margin: auto;
  text-align: center;
  color: #64748b;
  font-size: 0.88rem;
}

.empty-chat-icon {
  font-size: 2.4rem;
  color: #334155;
  margin-bottom: 10px;
}

.chat-load-error-banner {
  margin: auto;
  max-width: 32rem;
  padding: 16px;
  text-align: center;
  color: #fca5a5;
  background: rgba(220, 38, 38, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 8px;
}

.btn-retry-messages {
  display: block;
  min-height: 44px;
  margin: 12px auto 0;
  padding: 8px 16px;
  color: #ffffff;
  background: rgba(220, 38, 38, 0.55);
  border: 1px solid rgba(239, 68, 68, 0.6);
  border-radius: 8px;
  cursor: pointer;
}

.message-bubble-wrapper {
  display: flex;
  width: 100%;
}

.message-bubble-wrapper.is-outgoing {
  justify-content: flex-end;
}

.message-bubble-wrapper.is-incoming {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 16px;
  position: relative;
  word-break: break-word;
  line-height: 1.5;
}

.is-outgoing .message-bubble {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #000000;
  border-bottom-right-radius: 4px;
  font-weight: 600;
}

.is-incoming .message-bubble {
  background: rgba(30, 41, 59, 0.85);
  color: #ffffff;
  border-bottom-left-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.msg-text {
  margin: 0;
  font-size: 0.90rem;
}

.msg-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  font-size: 0.65rem;
  margin-top: 4px;
  opacity: 0.75;
}

.read-check {
  font-size: 0.68rem;
}

.read-check.is-read {
  color: #0284c7;
  font-weight: bold;
}

.is-outgoing .read-check.is-read {
  color: #0f172a;
}

.read-check.is-sent {
  color: #64748b;
}

.quick-emoji-bar {
  display: flex;
  gap: 6px;
  padding: 6px 20px;
  background: rgba(15, 23, 42, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.btn-emoji {
  background: transparent;
  border: none;
  font-size: 1.15rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: transform 0.15s ease;
}

.btn-emoji:hover {
  transform: scale(1.25);
}

.chat-send-error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: rgba(220, 38, 38, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  font-size: 0.82rem;
  border-radius: 8px;
  margin: 0 16px 8px 16px;
}

.chat-send-error-banner .error-icon {
  color: #ef4444;
  font-size: 0.9rem;
}

.chat-send-error-banner .error-text {
  flex: 1;
}

.btn-dismiss-error {
  background: transparent;
  border: none;
  color: #fca5a5;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0 4px;
}

.btn-confirm-delivery-check {
  min-height: 44px;
  padding: 8px 12px;
  color: #ffffff;
  background: rgba(220, 38, 38, 0.55);
  border: 1px solid rgba(239, 68, 68, 0.6);
  border-radius: 8px;
  cursor: pointer;
}

.chat-input-bar {
  padding: 12px 20px;
  background: rgba(15, 23, 42, 0.95);
  border-top: 1px solid var(--cc-border-glass, rgba(255, 255, 255, 0.08));
}

.chat-input-form {
  display: flex;
  gap: 10px;
  align-items: center;
}

.chat-input-field {
  flex: 1;
  padding: 12px 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #ffffff;
  font-family: inherit;
  font-size: 0.90rem;
  outline: none;
  box-sizing: border-box;
}

.chat-input-field:focus {
  border-color: var(--cc-gold-primary, #f59e0b);
}

.btn-send-message {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: none;
  color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.btn-send-message:hover:not(:disabled) {
  transform: scale(1.08);
}

.btn-send-message:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
