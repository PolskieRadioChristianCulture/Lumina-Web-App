
import { SystemNotification, fixOrphans } from '../types';

export type TimeSlot = 'morning' | 'afternoon' | 'evening';

const NOTIF_TEMPLATES = {
  morning: {
    pl: { title: "Dobre Słowo na Dziś", msg: "Twój werset dnia i planer uświęcenia czekają. Oddaj Panu pierwociny tego poranka.", icon: "📖" },
    en: { title: "Daily Word", msg: "Your daily verse and sanctification planner are ready. Give the Lord the firstfruits of this morning.", icon: "📖" }
  },
  afternoon: {
    pl: { title: "Wesprzyj Misję CC", msg: "Twoje wsparcie pozwala nam utrzymać radio HI-RES. Sprawdź nowe sposoby pomocy w panelu wsparcia.", icon: "❤️" },
    en: { title: "Support CC Mission", msg: "Your support keeps our HI-RES radio running. Check new ways to help in the support panel.", icon: "❤️" }
  },
  evening: {
    pl: { title: "Globalne Wołanie 21:00", msg: "Dołącz do wieczornej modlitwy wspólnoty. Niech to będzie czas głębokiego wyciszenia z Panem.", icon: "🙏" },
    en: { title: "Global Cry 21:00", msg: "Join the evening community prayer. May this be a time of deep silence with the Lord.", icon: "🙏" }
  }
};

export const NotificationService = {
  getUpdateSlot(hour: number): TimeSlot | null {
    if (hour >= 8 && hour < 15) return 'morning';
    if (hour >= 15 && hour < 21) return 'afternoon';
    if (hour >= 21 || hour < 8) return 'evening';
    return null;
  },

  generateNotification(slot: TimeSlot, lang: 'pl' | 'en'): SystemNotification {
    const template = NOTIF_TEMPLATES[slot][lang];
    return {
      id: `auto-${slot}-${new Date().toDateString()}`,
      title: template.title,
      message: fixOrphans(template.msg),
      timestamp: new Date().toISOString(),
      isRead: false,
      type: slot === 'afternoon' ? 'event' : 'info',
      icon: template.icon
    };
  },

  shouldUpdate(lastUpdateStr: string | null, currentSlot: TimeSlot): boolean {
    if (!lastUpdateStr) return true;
    try {
      const lastUpdate = JSON.parse(lastUpdateStr);
      const today = new Date().toDateString();
      // Update only if it's a different day OR a different slot
      return lastUpdate.date !== today || lastUpdate.slot !== currentSlot;
    } catch (e) {
      return true;
    }
  }
};
