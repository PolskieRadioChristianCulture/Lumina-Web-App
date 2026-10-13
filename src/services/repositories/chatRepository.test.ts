import { describe, it, expect, vi } from "vitest";
import { ChatRepository } from "./chatRepository";

describe("ChatRepository", () => {
  const repo = new ChatRepository();

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
