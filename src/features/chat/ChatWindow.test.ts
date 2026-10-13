import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ChatWindow from "./ChatWindow.vue";
import { chatRepository } from "@/services/repositories/chatRepository";
import type { DirectChatRoom } from "@/types/chat";

vi.mock("@/services/repositories/chatRepository", () => {
  return {
    chatRepository: {
      subscribeToMessages: vi.fn((chatId, callback) => {
        // Natychmiastowe wywołanie z przykładowymi wiadomościami
        callback([
          {
            id: "msg_1",
            senderId: "user_other",
            text: "Pokój Wam!",
            timestamp: "12:00",
            isRead: true,
            status: "read"
          },
          {
            id: "msg_2",
            senderId: "user_me",
            text: "Amen!",
            timestamp: "12:01",
            isRead: false,
            status: "sent"
          },
          {
            id: "msg_3",
            senderId: "user_me",
            text: "I z duchem twoim",
            timestamp: "12:02",
            isRead: true,
            status: "read"
          }
        ]);
        return vi.fn();
      }),
      sendMessage: vi.fn(),
      markMessagesAsRead: vi.fn()
    }
  };
});

describe("ChatWindow.vue", () => {
  const baseChat: DirectChatRoom = {
    id: "room_1",
    chatId: "room_1",
    participants: ["user_me", "user_other"],
    otherUserName: "Brat Jan",
    otherUserAvatar: "avatar_jan.jpg",
    isVerified: false,
    isOnline: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("P1: nie wyświetla ikony weryfikacji gdy profil nie jest zweryfikowany", () => {
    const wrapper = mount(ChatWindow, {
      props: {
        chat: { ...baseChat, isVerified: false },
        currentUserId: "user_me",
        currentUserName: "Ja"
      }
    });

    expect(wrapper.find(".check-icon").exists()).toBe(false);
  });

  it("P1: wyświetla ikonę weryfikacji gdy isVerified jest true", () => {
    const wrapper = mount(ChatWindow, {
      props: {
        chat: { ...baseChat, isVerified: true },
        currentUserId: "user_me",
        currentUserName: "Ja"
      }
    });

    expect(wrapper.find(".check-icon").exists()).toBe(true);
  });

  it("P1: wyświetla status 'Aktywny teraz' tylko gdy isOnline jest true, a fallback gdy false", () => {
    const offlineWrapper = mount(ChatWindow, {
      props: {
        chat: { ...baseChat, isOnline: false },
        currentUserId: "user_me",
        currentUserName: "Ja"
      }
    });
    expect(offlineWrapper.find(".partner-status").text()).not.toContain("Aktywny teraz");
    expect(offlineWrapper.find(".status-indicator-dot").exists()).toBe(false);

    const onlineWrapper = mount(ChatWindow, {
      props: {
        chat: { ...baseChat, isOnline: true },
        currentUserId: "user_me",
        currentUserName: "Ja"
      }
    });
    expect(onlineWrapper.find(".partner-status").text()).toContain("Aktywny teraz");
    expect(onlineWrapper.find(".status-indicator-dot").exists()).toBe(true);
  });

  it("P1: rozróżnia znacznik wysłania (fa-check) od przeczytania (fa-check-double is-read)", () => {
    const wrapper = mount(ChatWindow, {
      props: {
        chat: baseChat,
        currentUserId: "user_me",
        currentUserName: "Ja"
      }
    });

    // msg_2 jest wychodząca i isRead: false -> powinna mieć pojedynczy ptaszek is-sent
    const sentIcons = wrapper.findAll(".read-check.is-sent");
    expect(sentIcons.length).toBe(1);

    // msg_3 jest wychodząca i isRead: true -> powinna mieć podwójny ptaszek is-read
    const readIcons = wrapper.findAll(".read-check.is-read");
    expect(readIcons.length).toBe(1);
  });

  it("P2: zachowuje wpisany tekst w polu gdy sendMessage zwróci błąd/null", async () => {
    vi.mocked(chatRepository.sendMessage).mockResolvedValue(null);

    const wrapper = mount(ChatWindow, {
      props: {
        chat: baseChat,
        currentUserId: "user_me",
        currentUserName: "Ja"
      }
    });

    const input = wrapper.find(".chat-input-field");
    await input.setValue("Ważna intencja modlitewna, która nie może zginąć");

    const form = wrapper.find(".chat-input-form");
    await form.trigger("submit");

    // Ponieważ zapis się nie powiódł, tekst w polu NIE może być wyczyszczony!
    expect((input.element as HTMLInputElement).value).toBe("Ważna intencja modlitewna, która nie może zginąć");
    // Wyświetla się czytelny komunikat błędu
    expect(wrapper.find(".chat-send-error-banner").exists()).toBe(true);
  });

  it("P2: czyści pole tekstowe po udanym wysłaniu wiadomości", async () => {
    vi.mocked(chatRepository.sendMessage).mockResolvedValue("new_msg_id_777");

    const wrapper = mount(ChatWindow, {
      props: {
        chat: baseChat,
        currentUserId: "user_me",
        currentUserName: "Ja"
      }
    });

    const input = wrapper.find(".chat-input-field");
    await input.setValue("Błogosławionego dnia!");

    const form = wrapper.find(".chat-input-form");
    await form.trigger("submit");

    // Sukces - pole wyczyszczone, brak banera błędu
    expect((input.element as HTMLInputElement).value).toBe("");
    expect(wrapper.find(".chat-send-error-banner").exists()).toBe(false);
  });
});
