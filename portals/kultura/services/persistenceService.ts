import { Prayer, DailyGoal, DailyTask, DailyNote, SpiritualGoal, DailyGoalProgress, UserPersona, DualBibleVerse, RadioAlarm, CloudStatus, NotificationSettings, RadioStreamType, SystemNotification } from '../types';

const STORAGE_KEYS = {
  USER_PERSONA: 'cc_user_persona_v3',
  PRAYERS: 'cc_prayers_v3',
  DAILY_GOALS: 'cc_daily_goals_v3',
  DAILY_TASKS: 'cc_daily_tasks_v3',
  NOTES: 'cc_notes_v3',
  SPIRITUAL_GOALS: 'cc_spiritual_goals_v3',
  PROGRESS: 'cc_progress_v3',
  APP_CONFIG: 'cc_app_config_v3',
  DAILY_VERSE_CACHE: 'cc_daily_verse_cache',
  RADIO_ALARM: 'cc_radio_alarm',
  CLOUD_STATUS: 'cc_cloud_status',
  NOTIFICATION_SETTINGS: 'cc_notification_settings',
  LAST_STREAM: 'cc_last_stream',
  SYSTEM_NOTIFICATIONS: 'cc_system_notifications_v1'
};

const SSO_COOKIE_NAME = 'cc_auth_session_v1';

interface VerseCache {
  date: string;
  data: DualBibleVerse;
}

export const PersistenceService = {
  // --- SSO Cookie Methods (Single Sign-On across subdomains) ---
  setSSOCookie: (userData: Partial<UserPersona>) => {
    try {
      const hostname = window.location.hostname;
      // Jeśli jesteśmy na cclite.pl lub dowolnej subdomenie, ustawiamy domenę ciasteczka na .cclite.pl
      const domain = hostname.endsWith('cclite.pl') ? '.cclite.pl' : hostname;
      
      const ssoData = {
        name: userData.name,
        email: userData.googleEmail,
        picture: userData.profilePicture,
        gender: userData.gender,
        mentor: userData.assignedMentor,
        timestamp: Date.now()
      };
      
      const value = encodeURIComponent(JSON.stringify(ssoData));
      const isSecure = window.location.protocol === 'https:';
      const secureFlag = isSecure ? 'Secure;' : '';
      
      // Max-Age 30 dni, SameSite=Lax dla kompatybilności i bezpieczeństwa
      document.cookie = `${SSO_COOKIE_NAME}=${value}; Domain=${domain}; Path=/; Max-Age=2592000; SameSite=Lax; ${secureFlag}`;
      console.log(`[SSO] Session cookie broadcasted to domain: ${domain}`);
    } catch (e) {
      console.error("[SSO] Failed to set session cookie:", e);
    }
  },

  getSSOCookie: (): any | null => {
    try {
      const match = document.cookie.match(new RegExp('(^| )' + SSO_COOKIE_NAME + '=([^;]+)'));
      if (match) {
        return JSON.parse(decodeURIComponent(match[2]));
      }
    } catch (e) {
      console.debug("[SSO] No active session cookie found.");
    }
    return null;
  },

  clearSSOCookie: () => {
    try {
      const hostname = window.location.hostname;
      const domain = hostname.endsWith('cclite.pl') ? '.cclite.pl' : hostname;
      // Usuwanie ciasteczka poprzez ustawienie daty wygaśnięcia w przeszłości na domenie głównej
      document.cookie = `${SSO_COOKIE_NAME}=; Domain=${domain}; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`;
      console.log(`[SSO] Session cookie cleared from domain: ${domain}`);
    } catch (e) {
      console.error("[SSO] Failed to clear session cookie:", e);
    }
  },

  // --- Standard Storage Methods ---
  saveUserPersona: (data: UserPersona) => {
    localStorage.setItem(STORAGE_KEYS.USER_PERSONA, JSON.stringify(data));
  },
  loadUserPersona: (): UserPersona | null => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_PERSONA);
    if (saved) {
      const persona = JSON.parse(saved);
      if (persona.keepScreenOnWhileRadioPlaying === undefined) {
        persona.keepScreenOnWhileRadioPlaying = false; 
      }
      if (persona.autostartRadio === undefined) {
        persona.autostartRadio = true; 
      }
      persona.ageGroup = persona.ageGroup ?? 'unspecified';
      persona.maritalStatus = persona.maritalStatus ?? 'unspecified';
      persona.spiritualStatus = persona.spiritualStatus ?? 'unspecified';
      persona.googleEmail = persona.googleEmail ?? undefined; 
      persona.isGoogleCalendarConnected = persona.isGoogleCalendarConnected ?? false; 
      persona.googleCalendarId = persona.googleCalendarId ?? undefined; 
      return persona;
    }
    return null;
  },

  saveLastStream: (stream: RadioStreamType) => {
    localStorage.setItem(STORAGE_KEYS.LAST_STREAM, stream);
  },
  loadLastStream: (): RadioStreamType | null => {
    const saved = localStorage.getItem(STORAGE_KEYS.LAST_STREAM);
    return (saved === 'PL' || saved === 'GLOBAL' || saved === 'BIBLIA') ? (saved as RadioStreamType) : null;
  },

  saveSystemNotifications: (data: SystemNotification[]) => {
    localStorage.setItem(STORAGE_KEYS.SYSTEM_NOTIFICATIONS, JSON.stringify(data));
    const unreadCount = data.filter(n => !n.isRead).length;
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SET_APP_BADGE_COUNT',
        count: unreadCount
      });
    }
  },
  loadSystemNotifications: (): SystemNotification[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.SYSTEM_NOTIFICATIONS);
    return saved ? JSON.parse(saved) : [];
  },

  savePrayers: (data: Prayer[]) => {
    localStorage.setItem(STORAGE_KEYS.PRAYERS, JSON.stringify(data));
  },
  loadPrayers: (): Prayer[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRAYERS);
    return saved ? JSON.parse(saved) : [];
  },

  saveDailyGoals: (data: DailyGoal[]) => {
    localStorage.setItem(STORAGE_KEYS.DAILY_GOALS, JSON.stringify(data));
  },
  loadDailyGoals: (): DailyGoal[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_GOALS);
    return saved ? JSON.parse(saved) : [];
  },

  saveDailyTasks: (data: DailyTask[]) => {
    localStorage.setItem(STORAGE_KEYS.DAILY_TASKS, JSON.stringify(data));
  },
  loadDailyTasks: (): DailyTask[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_TASKS);
    return saved ? JSON.parse(saved) : [];
  },

  saveNotes: (data: DailyNote[]) => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(data));
  },
  loadNotes: (): DailyNote[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
    return saved ? JSON.parse(saved) : [];
  },

  saveSpiritualGoals: (data: SpiritualGoal[]) => {
    localStorage.setItem(STORAGE_KEYS.SPIRITUAL_GOALS, JSON.stringify(data));
  },
  loadSpiritualGoals: (): SpiritualGoal[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.SPIRITUAL_GOALS);
    return saved ? JSON.parse(saved) : [];
  },

  saveProgress: (data: DailyGoalProgress[]) => {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data));
  },
  loadProgress: (): DailyGoalProgress[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return saved ? JSON.parse(saved) : [];
  },

  saveDailyVerseCache: (date: string, data: DualBibleVerse) => {
    const cache: VerseCache = { date, data };
    localStorage.setItem(STORAGE_KEYS.DAILY_VERSE_CACHE, JSON.stringify(cache));
  },
  loadDailyVerseCache: (currentDate: string): DualBibleVerse | null => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_VERSE_CACHE);
    if (!saved) return null;
    const cache: VerseCache = JSON.parse(saved);
    if (cache.date !== currentDate) return null;
    return cache.data;
  },

  saveRadioAlarm: (alarm: RadioAlarm) => {
    localStorage.setItem(STORAGE_KEYS.RADIO_ALARM, JSON.stringify(alarm));
  },
  loadRadioAlarm: (): RadioAlarm | null => {
    const saved = localStorage.getItem(STORAGE_KEYS.RADIO_ALARM);
    return saved ? JSON.parse(saved) : null;
  },

  saveCloudStatus: (status: CloudStatus) => {
    localStorage.setItem(STORAGE_KEYS.CLOUD_STATUS, JSON.stringify(status));
  },
  loadCloudStatus: (): CloudStatus | null => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLOUD_STATUS);
    return saved ? JSON.parse(saved) : null;
  },

  saveNotificationSettings: (settings: NotificationSettings) => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'UPDATE_NOTIFICATION_SETTINGS',
        settings
      });
    }
  },
  loadNotificationSettings: (): NotificationSettings => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    const defaultSettings = {
      verseOfDayEnabled: true,
      verseOfDayTime: "08:00",
      dailyMiraclesEnabled: true,
      supportRemindersEnabled: true
    };
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  },

  clearAllData: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    PersistenceService.clearSSOCookie();
  }
};