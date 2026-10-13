import { beforeEach, describe, expect, it, vi } from "vitest";
const sdk = vi.hoisted(() => ({ observer: undefined as any, error: undefined as any, unsubscribe: vi.fn() }));
vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn((_auth, callback, error) => { sdk.observer = callback; sdk.error = error; return sdk.unsubscribe; }),
  signInWithEmailAndPassword: vi.fn(), createUserWithEmailAndPassword: vi.fn(),
  signInAnonymously: vi.fn(), signOut: vi.fn(), updateProfile: vi.fn()
}));
vi.mock("../firebase", () => ({ auth: { currentUser: null } }));
import { AuthRepository } from "./authRepository";

const user = (token: () => Promise<any>, overrides = {}) => ({
  uid: "audit-user", email: "audit@example.invalid", isAnonymous: false,
  displayName: "Audit fixture", photoURL: null, getIdTokenResult: token, ...overrides
});
const deferred = () => {
  let resolve!: (value: any) => void;
  let reject!: (reason: any) => void;
  const promise = new Promise<any>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
describe("AuthRepository session observer", () => {
  beforeEach(() => vi.clearAllMocks());
  it.each([undefined, false, "false", "true", 1, null])("does not grant admin UI for claim %s", async claim => {
    const callback = vi.fn(); new AuthRepository().onAuthStateChanged(callback);
    await sdk.observer(user(async () => ({ claims: { admin: claim } }), { uid: "nazirczarkes" }));
    expect(callback.mock.lastCall?.[0].isAdmin).toBe(false);
  });
  it("accepts only boolean true for admin UI", async () => {
    const callback = vi.fn(); new AuthRepository().onAuthStateChanged(callback);
    await sdk.observer(user(async () => ({ claims: { admin: true } })));
    expect(callback.mock.lastCall?.[0].isAdmin).toBe(true);
  });
  it("does not grant admin from a former email allowlist alone", async () => {
    const callback = vi.fn(); new AuthRepository().onAuthStateChanged(callback);
    await sdk.observer(user(async () => ({ claims: {} }), { email: "polskieradio.cc@gmail.com" }));
    expect(callback.mock.lastCall?.[0].isAdmin).toBe(false);
  });
  it("cannot restore identity after logout", async () => {
    const token = deferred(); const callback = vi.fn(); new AuthRepository().onAuthStateChanged(callback);
    const pending = sdk.observer(user(() => token.promise)); await sdk.observer(null);
    token.resolve({ claims: { admin: true } }); await pending;
    expect(callback).toHaveBeenCalledExactlyOnceWith(null);
  });
  it("cannot overwrite a newer account", async () => {
    const token = deferred(); const callback = vi.fn(); new AuthRepository().onAuthStateChanged(callback);
    const pending = sdk.observer(user(() => token.promise));
    await sdk.observer(user(async () => ({ claims: {} }), { uid: "audit-new-user" }));
    token.resolve({ claims: { admin: true } }); await pending;
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.lastCall?.[0].uid).toBe("audit-new-user");
  });
  it("handles token rejection without exposing provider details", async () => {
    const callback = vi.fn(); const error = vi.fn(); new AuthRepository().onAuthStateChanged(callback, error);
    await sdk.observer(user(async () => { throw Error("PRIVATE_FIXTURE"); }));
    expect(callback).toHaveBeenCalledExactlyOnceWith(null);
    expect(error).toHaveBeenCalledExactlyOnceWith();
  });
  it("ignores old token failures after a new account", async () => {
    const token = deferred(); const callback = vi.fn(); const error = vi.fn(); new AuthRepository().onAuthStateChanged(callback, error);
    const pending = sdk.observer(user(() => token.promise));
    await sdk.observer(user(async () => ({ claims: {} }), { uid: "audit-new-user" }));
    token.reject(Error("PRIVATE_FIXTURE")); await pending;
    expect(error).not.toHaveBeenCalled(); expect(callback).toHaveBeenCalledTimes(1);
  });
  it("unsubscribe suppresses pending completion and later events", async () => {
    const token = deferred(); const callback = vi.fn(); const error = vi.fn();
    const stop = new AuthRepository().onAuthStateChanged(callback, error);
    const pending = sdk.observer(user(() => token.promise)); stop();
    token.resolve({ claims: {} }); await pending; await sdk.observer(null); sdk.error(Error("PRIVATE_FIXTURE"));
    expect(callback).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled(); expect(sdk.unsubscribe).toHaveBeenCalledTimes(1);
  });
  it("SDK observer error invalidates pending work and clears identity", async () => {
    const token = deferred(); const callback = vi.fn(); const error = vi.fn(); new AuthRepository().onAuthStateChanged(callback, error);
    const pending = sdk.observer(user(() => token.promise)); sdk.error(Error("PRIVATE_FIXTURE"));
    token.resolve({ claims: {} }); await pending;
    expect(callback).toHaveBeenCalledExactlyOnceWith(null); expect(error).toHaveBeenCalledExactlyOnceWith();
  });
});
