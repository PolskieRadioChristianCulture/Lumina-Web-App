<script setup lang=ts>
import { computed } from 'vue';
import type { LuminaProfile } from '@/types/profile';

const props = defineProps<{
  profile: LuminaProfile;
  matchScore?: string | null;
}>();

const emit = defineEmits<{
  (e: 'click', profile: LuminaProfile): void;
  (e: 'like', profile: LuminaProfile): void;
}>();

const avatarUrl = computed(() => {
  if (props.profile.avatar && props.profile.avatar.trim() !== '') {
    return props.profile.avatar;
  }
  return props.profile.gender === 'kobieta' ? 'avatar_wioletta_official.jpg' : 'avatar_new1.jpg';
});

const isFounder = computed(() => {
  return props.profile.isFounder || props.profile.slug === 'cezaryrgowski' || props.profile.slug === 'wiolettarogowska';
});

const subtitle = computed(() => {
  const parts = [];
  if (props.profile.age) parts.push(`${props.profile.age} lat`);
  if (props.profile.city) parts.push(props.profile.city.split(',')[0]);
  return parts.join(' • ') || 'Polska';
});

function handleImgError(e: Event) {
  const target = e.target as HTMLImageElement;
  target.onerror = null;
  target.src = 'lumina_icon.jpg';
}
</script>

<template>
  <div 
    class="lumina-profile-card"
    :class="{ 'is-founder-card': isFounder }"
    @click="emit('click', profile)"
    role="button"
    tabindex="0"
    :aria-label="`Profil: ${profile.name}`"
  >
    <!-- Card Photo with Badges -->
    <div class="card-media-wrapper">
      <img 
        :src="avatarUrl" 
        :alt="profile.name" 
        class="card-img" 
        loading="lazy"
        @error="handleImgError"
      />
      
      <!-- Top Match Badge -->
      <span v-if="matchScore" class="badge-match">
        <i class="fa-solid fa-heart-pulse"></i> {{ matchScore }}
      </span>

      <!-- Founder Badge -->
      <span v-if="isFounder" class="badge-founder">
        <i class="fa-solid fa-crown"></i> Założyciel CC
      </span>

      <!-- Quick Like Button -->
      <button 
        type="button" 
        class="btn-card-heart" 
        @click.stop="emit('like', profile)"
        title="Polub profil"
        aria-label="Polub profil"
      >
        <i class="fa-solid fa-heart"></i>
      </button>
    </div>

    <!-- Card Info -->
    <div class="card-info">
      <div class="card-title-row">
        <h4 class="card-name">{{ profile.name }}</h4>
        <i class="fa-solid fa-circle-check verified-icon" title="Zweryfikowany Profil"></i>
      </div>

      <div class="card-meta">
        <i class="fa-solid fa-location-dot"></i> {{ subtitle }}
      </div>

      <p v-if="profile.verse || profile.bio" class="card-snippet">
        {{ profile.verse ? `„${profile.verse}”` : profile.bio }}
      </p>

      <!-- Tags Row -->
      <div v-if="profile.tags && profile.tags.length" class="card-tags">
        <span 
          v-for="tag in profile.tags.slice(0, 3)" 
          :key="tag" 
          class="tag-chip"
        >
          #{{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lumina-profile-card {
  background: var(--cc-bg-card, rgba(15, 23, 42, 0.78));
  border: 1px solid var(--cc-border-glass, rgba(255, 255, 255, 0.10));
  border-radius: var(--cc-radius-lg, 20px);
  overflow: hidden;
  box-shadow: var(--cc-shadow-card, 0 12px 32px rgba(0, 0, 0, 0.55));
  backdrop-filter: blur(16px);
  transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.lumina-profile-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.7);
  border-color: rgba(245, 158, 11, 0.4);
}

.lumina-profile-card.is-founder-card {
  border-color: rgba(245, 158, 11, 0.5);
  box-shadow: 0 12px 32px rgba(245, 158, 11, 0.18);
}

.card-media-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #0b1329;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.lumina-profile-card:hover .card-img {
  transform: scale(1.04);
}

.badge-match {
  position: absolute;
  top: 10px;
  left: 10px;
  background: linear-gradient(135deg, #ec4899, #be185d);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.45);
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.badge-founder {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.45);
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.btn-card-heart {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-card-heart:hover {
  background: #ec4899;
  transform: scale(1.1);
  border-color: #ec4899;
}

.card-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-name {
  margin: 0;
  font-family: var(--cc-font-heading, 'Outfit', sans-serif);
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--cc-text-primary, #fff);
}

.verified-icon {
  color: #38bdf8;
  font-size: 0.85rem;
}

.card-meta {
  font-size: 0.82rem;
  color: var(--cc-text-secondary, #94a3b8);
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-snippet {
  margin: 4px 0 0 0;
  font-size: 0.84rem;
  color: #cbd5e1;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 6px;
}

.tag-chip {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--cc-gold-light, #fef08a);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
