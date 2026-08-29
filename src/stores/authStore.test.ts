import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "./authStore";

describe("authStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("posiada poprawny stan początkowy", () => {
    const store = useAuthStore();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.isAdmin).toBe(false);
    expect(store.isAuthModalOpen).toBe(false);
    expect(store.displayName).toBe("Gość LUMINA");
  });

  it("poprawnie otwiera i zamyka modal autoryzacji", () => {
    const store = useAuthStore();
    expect(store.isAuthModalOpen).toBe(false);

    store.openAuthModal();
    expect(store.isAuthModalOpen).toBe(true);

    store.closeAuthModal();
    expect(store.isAuthModalOpen).toBe(false);
  });
});
