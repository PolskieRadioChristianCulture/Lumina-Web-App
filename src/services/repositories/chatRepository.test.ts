import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { ChatRepository } from "./chatRepository";

const firestoreMocks = vi.hoisted(() => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn()
}));

vi.mock("firebase/firestore", () => ({
  collection: firestoreMocks.collection,
  addDoc: firestoreMocks.addDoc,
  doc: firestoreMocks.doc,
  setDoc: firestoreMocks.setDoc,
  serverTimestamp: firestoreMocks.serverTimestamp,
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn()
}));

vi.mock("../firebase", () => ({ db: {} }));

describe("ChatRepository", () => {
  const repo = new ChatRepository();

  beforeEach(() => {
    vi.resetAllMocks();
    firestoreMocks.collection.mockReturnValue({ name: "messages" });
    firestoreMocks.addDoc.mockResolvedValue({ id: "message-123" });
    firestoreMocks.doc.mockReturnValue({ name: "chat" });
    firestoreMocks.setDoc.mockResolvedValue(undefined);
    firestoreMocks.serverTimestamp.mockReturnValue("server-time");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("powinien generować spójny identyfikator pokoju dla obu uczestników niezależnie od kolejności", () => {
    const id1 = repo.getChatRoomId("user_alice", "user_bob");
    const id2 = repo.getChatRoomId("user_bob", "user_alice");

    expect(id1).toBe("user_alice_user_bob");
    expect(id2).toBe("user_alice_user_bob");
    expect(id1).toBe(id2);
  });

  it("powinien poprawnie sortować alfabetycznie identyfikatory użytkowników", () => {
    const roomId = repo.getChatRoomId("cezaryrgowski", "andrzejthiel");
    expect(roomId).toBe("andrzejthiel_cezaryrgowski");
  });

  it("powinien zwracać null i nie rzucać błędu przy pustym tekście lub braku chatId/senderId", async () => {
    const res1 = await repo.sendMessage("", "user1", "User", "avatar.jpg", "Hej");
    expect(res1).toBeNull();

    const res2 = await repo.sendMessage("room1", "", "User", "avatar.jpg", "Hej");
    expect(res2).toBeNull();

    const res3 = await repo.sendMessage("room1", "user1", "User", "avatar.jpg", "   ");
    expect(res3).toBeNull();
  });

  it("zgłasza niepotwierdzony status gdy addDoc odrzuci zapis", async () => {
    firestoreMocks.addDoc.mockRejectedValueOnce(new Error("network"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await repo.sendMessage("room1", "user1", "User", "", "Hej");

    expect(result).toEqual({ status: "delivery_unconfirmed" });
    expect(firestoreMocks.setDoc).not.toHaveBeenCalled();
  });

  it("zwraca wysłane ID i osobny status, gdy aktualizacja ostatniej wiadomości się nie powiedzie", async () => {
    firestoreMocks.setDoc.mockRejectedValueOnce(new Error("permission-denied"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await repo.sendMessage("room1", "user1", "User", "", "Hej");

    expect(firestoreMocks.addDoc).toHaveBeenCalledOnce();
    expect(result).toEqual({ status: "sent_preview_update_failed", id: "message-123" });
  });

  it("zwraca sukces po zapisaniu wiadomości i podglądu pokoju", async () => {
    const result = await repo.sendMessage("room1", "user1", "User", "", "Hej");

    expect(result).toEqual({ status: "sent", id: "message-123" });
  });

  it("powinien bezpiecznie zwracać no-op unsubscribe gdy chatId jest pusty", () => {
    const unsub = repo.subscribeToMessages("", () => {});
    expect(typeof unsub).toBe("function");
    expect(() => unsub()).not.toThrow();
  });

  it("powinien zwracać 0 gdy markMessagesAsRead wywołano z pustym chatId lub userId", async () => {
    const res1 = await repo.markMessagesAsRead("", "user1");
    expect(res1).toBe(0);

    const res2 = await repo.markMessagesAsRead("room1", "");
    expect(res2).toBe(0);
  });
});
