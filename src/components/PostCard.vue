<script setup lang="ts">
import { ref, computed } from "vue";
import type { LuminaPost } from "@/types/post";

const props = defineProps<{
  post: LuminaPost;
}>();

const emit = defineEmits<{
  (e: "like", post: LuminaPost): void;
  (e: "amen", post: LuminaPost): void;
  (e: "comment", post: LuminaPost): void;
  (e: "share", post: LuminaPost): void;
  (e: "authorClick", authorSlug: string): void;
}>();

const isLiked = ref(false);
const isAmen = ref(false);

const likesCount = computed(() => (props.post.likes || 0) + (isLiked.value ? 1 : 0));
const amenCount = computed(() => (props.post.amen || 0) + (isAmen.value ? 1 : 0));

const authorAvatar = computed(() => {
  if (props.post.authorAvatar && props.post.authorAvatar.trim() !== "") {
    return props.post.authorAvatar;
  }
  return "lumina_icon.jpg";
});

const isCampaign = computed(() => {
  return props.post.type === "ad" || props.post.type === "promo" || props.post.type === "announcement" || props.post.type === "event";
});

const badgeLabel = computed(() => {
  if (props.post.isPinnedByAdmin) return "Przypięty Wpis";
  if (props.post.pinned) return "Rozważanie Dnia";
  if (props.post.type === "ad") return "Reklama Misji CC";
  if (props.post.type === "promo") return "Promocja CC";
  if (props.post.type === "announcement") return "Ogłoszenie CC";
  if (props.post.type === "event") return "Wydarzenie";
  return "Społeczność";
});

function toggleLike() {
  isLiked.value = !isLiked.value;
  emit("like", props.post);
}

function toggleAmen() {
  isAmen.value = !isAmen.value;
  emit("amen", props.post);
}

function handleImgError(e: Event) {
  const target = e.target as HTMLImageElement;
  target.onerror = null;
  target.src = "lumina_icon.jpg";
}
</script>

<template>
  <article 
    class="lumina-post-card" 
    :class="{ 'is-pinned-admin': post.isPinnedByAdmin, 'is-campaign-card': isCampaign }"
    :id="post.id"
  >
    <!-- Top Header -->
    <header class="post-header">
      <div 
        class="author-box" 
        @click="emit('authorClick', post.authorSlug || '')"
        role="button"
        tabindex="0"
      >
        <img 
          :src="authorAvatar" 
          :alt="post.author" 
          class="author-avatar"
          loading="lazy"
          @error="handleImgError"
        />
        <div class="author-info">
          <div class="author-name-row">
            <span class="author-name">{{ post.author }}</span>
            <i class="fa-solid fa-circle-check check-icon" title="Zweryfikowany Profil"></i>
          </div>
          <div class="author-role">{{ post.authorRole || post.time || "Społeczność LUMINA" }}</div>
        </div>
      </div>

      <!-- Post Type Badge -->
      <span class="post-type-badge" :class="`badge-${post.type || 'post'}`">
        <i v-if="post.isPinnedByAdmin" class="fa-solid fa-thumbtack"></i>
        <i v-else-if="post.type === 'ad'" class="fa-solid fa-rectangle-ad"></i>
        <i v-else-if="post.type === 'promo'" class="fa-solid fa-rocket"></i>
        <i v-else-if="post.type === 'event'" class="fa-solid fa-calendar-star"></i>
        <i v-else class="fa-solid fa-wand-magic-sparkles"></i>
        {{ badgeLabel }}
      </span>
    </header>

    <!-- Post Media Graphic (if present) -->
    <div v-if="post.image && post.image.trim() !== ''" class="post-media-container">
      <img 
        :src="post.image" 
        :alt="post.title || post.author" 
        class="post-media-img"
        loading="lazy"
        @error="handleImgError"
      />
    </div>

    <!-- Post Content Details -->
    <div class="post-body">
      <h3 v-if="post.title" class="post-title">{{ post.title }}</h3>
      <p class="post-text">{{ post.text || post.desc }}</p>

      <!-- Event info pill -->
      <div v-if="post.type === 'event' && (post.eventDate || post.eventLoc)" class="event-pill">
        <span v-if="post.eventDate"><i class="fa-solid fa-calendar-days"></i> {{ post.eventDate }}</span>
        <span v-if="post.eventLoc"><i class="fa-solid fa-location-dot"></i> {{ post.eventLoc }}</span>
      </div>

      <!-- Campaign CTA Button -->
      <div v-if="isCampaign && post.btnUrl" class="campaign-cta-row">
        <a :href="post.btnUrl" target="_blank" rel="noopener noreferrer" class="btn-campaign-cta">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> {{ post.btnText || "Zobacz Szczegóły" }}
        </a>
      </div>
    </div>

    <!-- Actions Bar -->
    <footer class="post-actions-bar">
      <div class="actions-left">
        <!-- Like Button -->
        <button 
          type="button" 
          class="btn-action" 
          :class="{ 'is-active-heart': isLiked }"
          @click="toggleLike"
          title="Polubienie"
        >
          <i class="fa-solid fa-heart"></i>
          <span class="count">{{ likesCount }}</span>
        </button>

        <!-- Amen Button -->
        <button 
          type="button" 
          class="btn-action" 
          :class="{ 'is-active-amen': isAmen }"
          @click="toggleAmen"
          title="Amen!"
        >
          <i class="fa-solid fa-hands-praying"></i>
          <span class="count">{{ amenCount }}</span>
          <span class="btn-text">Amen</span>
        </button>

        <!-- Comment Button -->
        <button 
          type="button" 
          class="btn-action" 
          @click="emit('comment', post)"
          title="Komentarze"
        >
          <i class="fa-solid fa-comment-dots"></i>
          <span class="btn-text">Komentarze</span>
        </button>
      </div>

      <!-- Share Button -->
      <button 
        type="button" 
        class="btn-action btn-share" 
        @click="emit('share', post)"
        title="Udostępnij"
        aria-label="Udostępnij wpis"
      >
        <i class="fa-solid fa-share-nodes"></i>
      </button>
    </footer>
  </article>
</template>

<style scoped>
.lumina-post-card {
 width: 100%;
 background: var(--cc-bg-card, rgba(15, 23, 42, 0.78));
 border: 1px solid var(--cc-border-glass, rgba(255, 255, 255, 0.10));
 border-radius: var(--cc-radius-lg, 20px);
 overflow: hidden;
 box-shadow: var(--cc-shadow-card, 0 12px 32px rgba(0, 0, 0, 0.55));
 backdrop-filter: blur(16px);
 margin-bottom: 24px;
 display: flex;
 flex-direction: column;
 transition: border-color 0.2s ease;
}

.lumina-post-card:hover {
 border-color: rgba(245, 158, 11, 0.35);
}

.lumina-post-card.is-pinned-admin {
 border: 1.5px solid var(--cc-gold-primary, #f59e0b);
 box-shadow: 0 12px 36px rgba(245, 158, 11, 0.25);
}

.post-header {
 padding: 16px 18px;
 display: flex;
 align-items: center;
 justify-content: space-between;
 gap: 12px;
}

.author-box {
 display: flex;
 align-items: center;
 gap: 12px;
 cursor: pointer;
}

.author-avatar {
 width: 44px;
 height: 44px;
 border-radius: 50%;
 object-fit: cover;
 border: 1.5px solid rgba(245, 158, 11, 0.4);
 background: #0b1329;
}

.author-info {
 display: flex;
 flex-direction: column;
}

.author-name-row {
 display: flex;
 align-items: center;
 gap: 6px;
}

.author-name {
 font-family: var(--cc-font-heading, Outfit, sans-serif);
 font-weight: 800;
 font-size: 0.98rem;
 color: var(--cc-text-primary, #ffffff);
}

.check-icon {
 color: #38bdf8;
 font-size: 0.78rem;
}

.author-role {
 font-size: 0.76rem;
 color: var(--cc-text-secondary, #94a3b8);
}

.post-type-badge {
 font-size: 0.70rem;
 font-weight: 800;
 padding: 4px 10px;
 border-radius: 12px;
 display: inline-flex;
 align-items: center;
 gap: 5px;
 background: rgba(255, 255, 255, 0.08);
 color: #e2e8f0;
 border: 1px solid rgba(255, 255, 255, 0.12);
}

.badge-ad, .badge-promo {
 background: rgba(245, 158, 11, 0.18);
 color: var(--cc-gold-primary, #f59e0b);
 border-color: rgba(245, 158, 11, 0.4);
}

.post-media-container {
 width: 100%;
 background: #000;
 overflow: hidden;
}

.post-media-img {
 width: 100%;
 max-height: 520px;
 object-fit: contain;
 display: block;
}

.post-body {
 padding: 16px 18px;
 color: #e2e8f0;
}

.post-title {
 margin: 0 0 8px 0;
 font-family: var(--cc-font-heading, Outfit, sans-serif);
 font-size: 1.12rem;
 font-weight: 800;
 color: #ffffff;
}

.post-text {
 margin: 0;
 font-size: 0.92rem;
 line-height: 1.65;
 white-space: pre-wrap;
 word-break: break-word;
}

.event-pill {
 margin-top: 12px;
 display: inline-flex;
 gap: 12px;
 font-size: 0.78rem;
 font-weight: 700;
 color: #6ee7b7;
 background: rgba(16, 185, 129, 0.1);
 padding: 6px 12px;
 border-radius: 10px;
 border: 1px solid rgba(16, 185, 129, 0.25);
}

.campaign-cta-row {
 margin-top: 14px;
}

.btn-campaign-cta {
 display: inline-flex;
 align-items: center;
 gap: 8px;
 padding: 10px 20px;
 border-radius: 14px;
 background: linear-gradient(135deg, #f59e0b, #d97706);
 color: #000000;
 font-weight: 800;
 font-size: 0.88rem;
 text-decoration: none;
 box-shadow: 0 4px 16px rgba(245, 158, 11, 0.35);
 transition: transform 0.2s ease;
}

.btn-campaign-cta:hover {
 transform: translateY(-2px);
}

.post-actions-bar {
 padding: 12px 18px;
 border-top: 1px solid rgba(255, 255, 255, 0.08);
 display: flex;
 align-items: center;
 justify-content: space-between;
}

.actions-left {
 display: flex;
 gap: 8px;
}

.btn-action {
 background: rgba(255, 255, 255, 0.06);
 border: 1px solid rgba(255, 255, 255, 0.12);
 color: #cbd5e1;
 padding: 6px 12px;
 border-radius: 12px;
 font-size: 0.84rem;
 font-weight: 700;
 display: inline-flex;
 align-items: center;
 gap: 6px;
 cursor: pointer;
 transition: all 0.2s ease;
}

.btn-action:hover {
 background: rgba(255, 255, 255, 0.12);
 color: #ffffff;
}

.btn-action.is-active-heart {
 background: rgba(236, 72, 153, 0.2);
 border-color: #ec4899;
 color: #f472b6;
}

.btn-action.is-active-amen {
 background: rgba(245, 158, 11, 0.2);
 border-color: #f59e0b;
 color: #fef08a;
}
</style>
