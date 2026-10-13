import { describe, it, expect, beforeEach, vi } from "vitest";
const session = vi.hoisted(() => ({ callback: undefined as any, error: undefined as any, count: 0 }));
vi.mock("@/services/repositories/authRepository", () => ({ authRepository: {
  onAuthStateChanged: vi.fn((callback, error) => { session.callback = callback; session.error = error; session.count++; return () => {}; })
} }));
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "./authStore";

describe("authStore", () => {
  beforeEach(() => {
    session.count = 0;
    setActivePinia(createPinia());
  });

  it("kończy ładowanie i usuwa nieaktualny stan przy błędzie sesji", () => {
    const store = useAuthStore(); store.init();
    session.callback({ uid: "audit-user", isAdmin: true, displayName: "Audit fixture" });
    session.error();
    expect(store.user).toBeNull(); expect(store.isLoading).toBe(false);
    expect(store.isAdmin).toBe(false); expect(store.errorMessage).toContain("Nie udało się sprawdzić sesji");
  });

  it("inicjalizuje jeden observer i kończy ładowanie dla gościa", () => {
    const store = useAuthStore(); store.init(); store.init();
    expect(session.count).toBe(1); session.callback(null);
    expect(store.isLoading).toBe(false); expect(store.user).toBeNull();
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
