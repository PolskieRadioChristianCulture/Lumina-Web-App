<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";
import BaseModal from "@/components/BaseModal.vue";
import BaseButton from "@/components/BaseButton.vue";

const authStore = useAuthStore();

const mode = ref<"login" | "register">("login");
const email = ref("");
const password = ref("");
const name = ref("");

async function handleSubmit() {
  if (mode.value === "login") {
    await authStore.login(email.value, password.value);
  } else {
    await authStore.register(email.value, password.value, name.value);
  }
}
</script>

<template>
  <BaseModal 
    v-model="authStore.isAuthModalOpen" 
    :title="mode === 'login' ? 'Logowanie do LUMINA' : 'Dołącz do Społeczności'"
    :icon="mode === 'login' ? '🔐' : '✨'"
    max-width="480px"
  >
    <!-- Switcher Tabs -->
    <div class="auth-tabs">
      <button 
        type="button" 
        class="auth-tab" 
        :class="{ active: mode === 'login' }"
        @click="mode = 'login'"
      >
        Logowanie
      </button>
      <button 
        type="button" 
        class="auth-tab" 
        :class="{ active: mode === 'register' }"
        @click="mode = 'register'"
      >
        Rejestracja
      </button>
    </div>

    <!-- Error Alert -->
    <div v-if="authStore.errorMessage" class="auth-error-alert">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <span>{{ authStore.errorMessage }}</span>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="auth-form">
      <div v-if="mode === 'register'" class="form-group">
        <label class="form-label">Twoje Imię / Nazwa profilu</label>
        <input 
          v-model="name" 
          type="text" 
          placeholder="np. Anna Kowalska" 
          class="form-input" 
          required 
        />
      </div>

      <div class="form-group">
        <label class="form-label">Adres e-mail</label>
        <input 
          v-model="email" 
          type="email" 
          placeholder="twoj.email@domena.pl" 
          class="form-input" 
          required 
        />
      </div>

      <div class="form-group">
        <label class="form-label">Hasło</label>
        <input 
          v-model="password" 
          type="password" 
          placeholder="••••••••" 
          class="form-input" 
          required 
        />
      </div>

      <div class="form-actions">
        <BaseButton 
          type="submit" 
          variant="gold" 
          size="lg" 
          :loading="authStore.isLoading"
          class="btn-auth-submit"
        >
          {{ mode === 'login' ? 'Zaloguj się' : 'Utwórz konto w LUMINA' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped>
.auth-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
  gap: 4px;
}

.auth-tab {
  flex: 1;
  padding: 8px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-family: var(--cc-font-heading, "Outfit", sans-serif);
  font-weight: 700;
  font-size: 0.86rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.auth-tab.active {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #000000;
}

.auth-error-alert {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.84rem;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.80rem;
  font-weight: 700;
  color: #94a3b8;
}

.form-input {
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

.form-input:focus {
  border-color: var(--cc-gold-primary, #f59e0b);
}

.form-actions {
  margin-top: 10px;
}

.btn-auth-submit {
  width: 100%;
}
</style>
