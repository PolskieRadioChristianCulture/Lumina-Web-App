import { useState, useEffect } from 'react';
import { PersistenceService } from './services/persistenceService';
import { UserPersona, Prayer, DailyGoal, DailyTask, DailyNote, SpiritualGoal, DailyGoalProgress, SystemNotification } from './types';

export const usePersistence = () => {
  const [userPersona, setUserPersona] = useState<UserPersona>(() => {
    const local = PersistenceService.loadUserPersona();
    const sso = PersistenceService.getSSOCookie();

    const defaultPersona: UserPersona = { 
      name: "Gość", 
      gender: "unspecified", 
      profilePicture: undefined,
      personalStatus: undefined,
      ageGroup: 'unspecified',
      maritalStatus: 'unspecified',
      spiritualStatus: 'unspecified',
      appMode: 'standard', 
      location: undefined,
      geolocationConsent: false, 
      preferredLaunchMode: 'radio', 
      smartStart: true, 
      autostartRadio: true, 
      keepScreenOnWhileRadioPlaying: false,
      isGoogleCalendarConnected: false,
      googleCalendarId: undefined,
      googleEmail: undefined,
      isFirstRun: true,
      joshuaSystem: {
        enabled: false,
        disciplineMode: '5.10.15',
        driveSyncEnabled: false
      }
    };

    // LOGIKA SSO: Jeśli istnieje ciasteczko sesji z domeny cclite.pl, synchronizujemy dane profilowe
    if (sso && (!local || !local.googleEmail)) {
      console.log("[Persistence] Global SSO Session detected. Hydrating profile...");
      return {
        ...(local || defaultPersona),
        name: sso.name,
        googleEmail: sso.email,
        profilePicture: sso.picture,
        gender: sso.gender,
        assignedMentor: sso.mentor,
        isFirstRun: false,
        appMode: local?.appMode || 'standard'
      };
    }

    return local || defaultPersona;
  });

  const [prayers, setPrayers] = useState<Prayer[]>(() => PersistenceService.loadPrayers());
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>(() => PersistenceService.loadDailyGoals());
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(() => PersistenceService.loadDailyTasks());
  const [notes, setNotes] = useState<DailyNote[]>(() => PersistenceService.loadNotes());
  const [spiritualGoals, setSpiritualGoals] = useState<SpiritualGoal[]>(() => PersistenceService.loadSpiritualGoals());
  const [dailyGoalProgress, setDailyGoalProgress] = useState<DailyGoalProgress[]>(() => PersistenceService.loadProgress());
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>(() => PersistenceService.loadSystemNotifications());

  useEffect(() => {
    PersistenceService.saveUserPersona(userPersona);
    PersistenceService.savePrayers(prayers);
    PersistenceService.saveDailyGoals(dailyGoals);
    PersistenceService.saveDailyTasks(dailyTasks);
    PersistenceService.saveNotes(notes);
    PersistenceService.saveSpiritualGoals(spiritualGoals);
    PersistenceService.saveProgress(dailyGoalProgress);
    PersistenceService.saveSystemNotifications(systemNotifications);
  }, [userPersona, prayers, dailyGoals, dailyTasks, notes, spiritualGoals, dailyGoalProgress, systemNotifications]);

  return {
    userPersona, setUserPersona,
    prayers, setPrayers,
    dailyGoals, setDailyGoals,
    dailyTasks, setDailyTasks,
    notes, setNotes,
    spiritualGoals, setSpiritualGoals,
    dailyGoalProgress, setDailyGoalProgress,
    systemNotifications, setSystemNotifications
  };
};