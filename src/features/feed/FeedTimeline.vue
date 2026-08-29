<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import type { LuminaPost, PostType } from "@/types/post";
import { postRepository } from "@/services/repositories/postRepository";
import PostCard from "@/components/PostCard.vue";
import BaseButton from "@/components/BaseButton.vue";
import BaseModal from "@/components/BaseModal.vue";

const posts = ref<LuminaPost[]>([]);
const isLoading = ref(true);
const isCreateModalOpen = ref(false);
const activeTab = ref<"all" | PostType>("all");

// Form state
const newPostTitle = ref("");
const newPostText = ref("");
const newPostType = ref<PostType>("post");
const isSubmitting = ref(false);

let unsubscribe: (() => void) | null = null;

onMounted(() => {
 isLoading.value = true;
 unsubscribe = postRepository.subscribeToFeed((loadedPosts) => {
 posts.value = loadedPosts;
 isLoading.value = false;
 });
});

onUnmounted(() => {
 if (unsubscribe) unsubscribe();
});

const filteredPosts = computed(() => {
 if (activeTab.value === "all") return posts.value;
 return posts.value.filter((p) => (p.type || "post") === activeTab.value);
});

async function handleCreatePost() {
 if (!newPostText.value.trim()) return;
 isSubmitting.value = true;

 const createdId = await postRepository.createPost({
 title: newPostTitle.value.trim() || undefined,
 text: newPostText.value.trim(),
 type: newPostType.value,
 author: "Społeczność LUMINA",
 authorRole: "Członek Społeczności ✨"
 });

 isSubmitting.value = false;
 if (createdId) {
 newPostTitle.value = "";
 newPostText.value = "";
 isCreateModalOpen.value = false;
 }
}

function handlePostLike(post: LuminaPost) {
 postRepository.toggleLike(post.id, false);
}

function handlePostAmen(post: LuminaPost) {
 postRepository.toggleAmen(post.id, false);
}
</script>

<template>
  <div class="lumina-feed-container">
    <!-- Top Action Bar -->
    <div class="feed-top-bar">
      <div class="feed-filter-tabs">
        <button 
          type="button" 
          class="feed-tab-btn" 
          :class="{ 'is-active': activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          ✨ Wszystkie ({{ posts.length }})
        </button>
        <button 
          type="button" 
          class="feed-tab-btn" 
          :class="{ 'is-active': activeTab === 'post' }"
          @click="activeTab = 'post'"
        >
          🕊️ Świadectwa
        </button>
        <button 
          type="button" 
          class="feed-tab-btn" 
          :class="{ 'is-active': activeTab === 'announcement' }"
          @click="activeTab = 'announcement'"
        >
          📜 Ogłoszenia
        </button>
      </div>

      <BaseButton 
        variant="gold" 
        size="md" 
        icon="fa-solid fa-pen-to-square"
        @click="isCreateModalOpen = true"
      >
        Napisz na Tablicy
      </BaseButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="feed-loading">
      <div class="feed-spinner"></div>
      <p>Wczytywanie wpisów na żywo z chmury...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredPosts.length === 0" class="feed-empty">
      <i class="fa-solid fa-feather-pointed empty-icon"></i>
      <p>Brak wpisów w tej kategorii. Bądź pierwszą osobą, która napisze!</p>
    </div>

    <!-- Posts Stream -->
    <div v-else class="feed-stream">
      <PostCard
        v-for="p in filteredPosts"
        :key="p.id"
        :post="p"
        @like="handlePostLike"
        @amen="handlePostAmen"
      />
    </div>

    <!-- Create Post Modal -->
    <BaseModal 
      v-model="isCreateModalOpen" 
      title="Nowy Wpis na Tablicy"
      icon="✍️"
    >
      <form @submit.prevent="handleCreatePost" class="create-post-form">
        <div class="form-group">
          <label class="form-label">Tytuł wpisu (opcjonalnie)</label>
          <input 
            v-model="newPostTitle" 
            type="text" 
            placeholder="np. Świadectwo Bożej wierności..." 
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Treść wiadomości / modlitwy / świadectwa</label>
          <textarea 
            v-model="newPostText" 
            rows="4" 
            placeholder="Podziel się tym, co Bóg czyni w Twoim życiu..." 
            class="form-textarea"
            required
          ></textarea>
        </div>

        <div class="form-footer">
          <BaseButton 
            type="button" 
            variant="glass" 
            @click="isCreateModalOpen = false"
          >
            Anuluj
          </BaseButton>
          <BaseButton 
            type="submit" 
            variant="gold" 
            :loading="isSubmitting"
            icon="fa-solid fa-paper-plane"
          >
            Opublikuj Wpis
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<style scoped>
.lumina-feed-container {
 width: 100%;
 max-width: 720px;
 margin: 0 auto;
 padding: 24px 16px 100px;
}

.feed-top-bar {
 display: flex;
 justify-content: space-between;
 align-items: center;
 flex-wrap: wrap;
 gap: 12px;
 margin-bottom: 24px;
}

.feed-filter-tabs {
 display: flex;
 gap: 6px;
}

.feed-tab-btn {
 background: rgba(255, 255, 255, 0.06);
 border: 1px solid rgba(255, 255, 255, 0.12);
 color: #94a3b8;
 padding: 8px 14px;
 border-radius: 14px;
 font-family: var(--cc-font-heading, Outfit, sans-serif);
 font-weight: 700;
 font-size: 0.82rem;
 cursor: pointer;
 transition: all 0.2s ease;
}

.feed-tab-btn.is-active {
 background: rgba(245, 158, 11, 0.2);
 color: var(--cc-gold-primary, #f59e0b);
 border-color: rgba(245, 158, 11, 0.4);
}

.feed-loading, .feed-empty {
 text-align: center;
 padding: 60px 20px;
 color: #94a3b8;
}

.feed-spinner {
 width: 36px;
 height: 36px;
 border: 3px solid rgba(245, 158, 11, 0.2);
 border-top-color: #f59e0b;
 border-radius: 50%;
 animation: spin 0.8s linear infinite;
 margin: 0 auto 16px;
}

@keyframes spin {
 to { transform: rotate(360deg); }
}

.empty-icon {
 font-size: 2.5rem;
 color: #475569;
 margin-bottom: 12px;
}

.create-post-form {
 display: flex;
 flex-direction: column;
 gap: 16px;
}

.form-group {
 display: flex;
 flex-direction: column;
 gap: 6px;
}

.form-label {
 font-size: 0.78rem;
 font-weight: 700;
 color: var(--cc-text-secondary, #94a3b8);
}

.form-input, .form-textarea {
 width: 100%;
 padding: 10px 14px;
 border-radius: 12px;
 background: rgba(255, 255, 255, 0.06);
 border: 1px solid rgba(255, 255, 255, 0.14);
 color: #ffffff;
 font-family: inherit;
 font-size: 0.90rem;
 outline: none;
 box-sizing: border-box;
 transition: border-color 0.2s ease;
}

.form-input:focus, .form-textarea:focus {
 border-color: var(--cc-gold-primary, #f59e0b);
}

.form-textarea {
 resize: vertical;
}

.form-footer {
 display: flex;
 justify-content: flex-end;
 gap: 10px;
 margin-top: 10px;
}
</style>
