import { describe, it, expect } from "vitest";
import { NotificationRepository } from "./notificationRepository";
import type { LuminaNotification, NotificationPreferences } from "@/types/notification";

describe("NotificationRepository", () => {
  const repo = new NotificationRepository();

  describe("isQuietHours", () => {
    const prefs: NotificationPreferences = {
      soundEnabled: true,
      vibrationEnabled: true,
      quietHoursEnabled: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
      mutedUsers: [],
      groupingEnabled: true
    };

    it("powinien wykrywać czas nocny (np. 23:30 w oknie 22:00 - 08:00)", () => {
      const nightDate = new Date("2026-08-29T23:30:00");
      expect(repo.isQuietHours(prefs, nightDate)).toBe(true);
    });

    it("powinien wykrywać czas nocny (np. 04:15 rano w oknie 22:00 - 08:00)", () => {
      const earlyDate = new Date("2026-08-29T04:15:00");
      expect(repo.isQuietHours(prefs, earlyDate)).toBe(true);
    });

    it("powinien zwracać false w ciągu dnia (np. 14:00 w oknie 22:00 - 08:00)", () => {
      const dayDate = new Date("2026-08-29T14:00:00");
      expect(repo.isQuietHours(prefs, dayDate)).toBe(false);
    });

    it("powinien zwracać false gdy tryb cichy jest wyłączony", () => {
      const disabledPrefs = { ...prefs, quietHoursEnabled: false };
      const nightDate = new Date("2026-08-29T23:30:00");
      expect(repo.isQuietHours(disabledPrefs, nightDate)).toBe(false);
    });
  });

  describe("groupNotifications", () => {
    it("powinien agregować powiadomienia z tym samym groupKey", () => {
      const rawNotifs: LuminaNotification[] = [
        {
          id: "n1",
          recipientId: "user1",
          senderName: "Anna",
          type: "like",
          title: "Nowe polubienie",
          body: "Anna polubiła Twój wpis",
          groupKey: "like_post_100",
          isRead: false,
          timestamp: 1000
        },
        {
          id: "n2",
          recipientId: "user1",
          senderName: "Piotr",
          type: "like",
          title: "Nowe polubienie",
          body: "Piotr polubił Twój wpis",
          groupKey: "like_post_100",
          isRead: false,
          timestamp: 2000
        },
        {
          id: "n3",
          recipientId: "user1",
          senderName: "Krzysztof",
          type: "like",
          title: "Nowe polubienie",
          body: "Krzysztof polubił Twój wpis",
          groupKey: "like_post_100",
          isRead: false,
          timestamp: 3000
        },
        {
          id: "n4",
          recipientId: "user1",
          senderName: "Marek",
          type: "message",
          title: "Wiadomość",
          body: "Cześć!",
          groupKey: "message_marek",
          isRead: false,
          timestamp: 4000
        }
      ];

      const grouped = repo.groupNotifications(rawNotifs);
      expect(grouped).toHaveLength(2);

      const likeGroup = grouped.find((g) => g.groupKey === "like_post_100");
      expect(likeGroup).toBeDefined();
      expect(likeGroup?.groupCount).toBe(3);
      expect(likeGroup?.body).toContain("2 innych zareagowało");

      const msgGroup = grouped.find((g) => g.groupKey === "message_marek");
      expect(msgGroup).toBeDefined();
      expect(msgGroup?.groupCount).toBe(1);
    });
  });
});
