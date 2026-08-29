<script setup lang=ts>
import { ref, onMounted, computed } from 'vue';
import type { LuminaProfile, Gender } from '@/types/profile';
import { profileRepository } from '@/services/repositories/profileRepository';
import ProfileCard from '@/components/ProfileCard.vue';

const profiles = ref<LuminaProfile[]>([]);
const isLoading = ref<boolean>(true);
const selectedFilter = ref<'all' | Gender>('all');
const searchQuery = ref<string>('');

onMounted(async () => {
  isLoading.value = true;
  profiles.value = await profileRepository.getCommunityProfiles();
  isLoading.value = false;
});

const filteredProfiles = computed(() => {
  let list = profiles.value;

  if (selectedFilter.value !== 'all') {
    list = list.filter((p) => p.gender === selectedFilter.value);
  }

  if (searchQuery.value.trim() !== '') {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((p) => 
      p.name.toLowerCase().includes(q) || 
      (p.city && p.city.toLowerCase().includes(q)) ||
      (p.denom && p.denom.toLowerCase().includes(q))
    );
  }

  return list;
});

function handleCardClick(p: LuminaProfile) {
  const url = p.slug === 'cezaryrgowski' ? 'lumina.cezaryrgowski.html' : 
              p.slug === 'wiolettarogowska' ? 'lumina.wiolettarogowska.html' : 
              p.slug === 'andrzejthiel' ? 'lumina.andrzejthiel.html' : 
              `lumina-profile.html?u=${p.slug}`;
  window.location.href = url;
}

function handleCardLike(p: LuminaProfile) {
  console.log('Polubiono profil:', p.name);
}
</script>

<template>
  <section class="lumina-profile-grid-section">
    <!-- Header & Filter Toolbar -->
    <div class="grid-toolbar">
      <div class="filter-chips">
        <button 
          type="button"
          class="filter-chip"
          :class="{ active: selectedFilter === 'all' }"
          @click="selectedFilter = 'all'"
        >
          ✨ Wszyscy ({{ profiles.length }})
        </button>
        <button 
          type="button"
          class="filter-chip"
          :class="{ active: selectedFilter === 'kobieta' }"
          @click="selectedFilter = 'kobieta'"
        >
          <i class="fa-solid fa-venus"></i> Kobiety
        </button>
        <button 
          type="button"
          class="filter-chip"
          :class="{ active: selectedFilter === 'mezczyzna' }"
          @click="selectedFilter = 'mezczyzna'"
        >
          <i class="fa-solid fa-mars"></i> Mężczyźni
        </button>
      </div>

      <div class="search-box">
        <i class="fa-solid fa-magnifying-glass search-icon"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Szukaj po imieniu, mieście..." 
          class="search-input"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Wczytywanie profili społeczności LUMINA...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredProfiles.length === 0" class="empty-state">
      <i class="fa-solid fa-users-slash empty-icon"></i>
      <p>Nie znaleziono profili dla wybranych kryteriów.</p>
    </div>

    <!-- Reactive Cards Grid -->
    <div v-else class="profiles-grid">
      <ProfileCard
        v-for="p in filteredProfiles"
        :key="p.id || p.slug"
        :profile="p"
        @click="handleCardClick"
        @like="handleCardLike"
      />
    </div>
  </section>
</template>

<style scoped>
.lumina-profile-grid-section {
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 24px 16px;
}

.grid-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 24px;
}

.filter-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  font-weight: 700;
  font-size: 0.84rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.filter-chip.active {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #000;
  border-color: #f59e0b;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
}

.search-box {
  position: relative;
  min-width: 260px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 0.85rem;
}

.search-input {
  width: 100%;
  padding: 9px 14px 9px 38px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #fff;
  font-family: inherit;
  font-size: 0.86rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: #f59e0b;
}

.profiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.spinner {
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
</style>
