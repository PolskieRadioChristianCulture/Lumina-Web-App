import { describe, it, expect } from "vitest";
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
});
