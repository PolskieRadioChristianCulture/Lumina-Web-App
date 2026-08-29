import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authRepository, type AuthUser } from "@/services/repositories/authRepository";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<AuthUser | null>(null);
  const isLoading = ref<boolean>(true);
  const isAuthModalOpen = ref<boolean>(false);
  const errorMessage = ref<string | null>(null);

  const isAuthenticated = computed(() => user.value !== null);
  const isAdmin = computed(() => user.value?.isAdmin === true);
  const displayName = computed(() => user.value?.displayName || "Gość LUMINA");

  let isInitialized = false;

  function init() {
    if (isInitialized) return;
    isInitialized = true;
    isLoading.value = true;

    authRepository.onAuthStateChanged((currentUser) => {
      user.value = currentUser;
      isLoading.value = false;
    });
  }

  async function login(email: string, pass: string): Promise<boolean> {
    errorMessage.value = null;
    isLoading.value = true;
    try {
      await authRepository.signIn(email, pass);
      isAuthModalOpen.value = false;
      return true;
    } catch (err: any) {
      console.warn("[AuthStore] Błąd logowania:", err);
      errorMessage.value = err.code === "auth/invalid-credential" 
        ? "Nieprawidłowy adres e-mail lub hasło." 
        : "Wystąpił problem z logowaniem. Spróbuj ponownie.";
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(email: string, pass: string, name: string): Promise<boolean> {
    errorMessage.value = null;
    isLoading.value = true;
    try {
      await authRepository.signUp(email, pass, name);
      isAuthModalOpen.value = false;
      return true;
    } catch (err: any) {
      console.warn("[AuthStore] Błąd rejestracji:", err);
      errorMessage.value = err.code === "auth/email-already-in-use" 
        ? "Konto o tym adresie e-mail już istnieje." 
        : "Wystąpił problem z rejestracją. Hasło musi mieć min. 6 znaków.";
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout(): Promise<void> {
    try {
      await authRepository.logOut();
      user.value = null;
    } catch (err) {
      console.warn("[AuthStore] Błąd wylogowania:", err);
    }
  }

  function openAuthModal() {
    errorMessage.value = null;
    isAuthModalOpen.value = true;
  }

  function closeAuthModal() {
    isAuthModalOpen.value = false;
    errorMessage.value = null;
  }

  return {
    user,
    isLoading,
    isAuthModalOpen,
    errorMessage,
    isAuthenticated,
    isAdmin,
    displayName,
    init,
    login,
    register,
    logout,
    openAuthModal,
    closeAuthModal
  };
});
