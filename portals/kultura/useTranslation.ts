
import { useState, useEffect, useCallback } from 'react';
import { AppLanguage } from './types';

interface Translations {
  [key: string]: string | Translations; // Allow nested objects for structured keys
}

const translationCache: { [lang: string]: Translations } = {};

export const useTranslation = (appLanguage: AppLanguage) => {
  const [translations, setTranslations] = useState<Translations>(() => translationCache[appLanguage] || {});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (translationCache[appLanguage]) {
      setTranslations(translationCache[appLanguage]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Use dynamic import for better module loading in React/Vite
    import(`./locales/${appLanguage}/translation.json`)
      .then(module => {
        const data = module.default; // Access default export for JSON modules
        translationCache[appLanguage] = data;
        setTranslations(data);
        setLoading(false);
      })
      .catch(error => {
        console.error(`Error loading translations for ${appLanguage}:`, error);
        // Fallback to English if the requested language fails
        if (appLanguage !== 'en' && translationCache['en']) {
          setTranslations(translationCache['en']);
        } else if (appLanguage !== 'en') {
          // If English isn't loaded yet, try to load it
          import('./locales/en/translation.json')
            .then(enModule => {
              translationCache['en'] = enModule.default;
              setTranslations(enModule.default);
              setLoading(false);
            })
            .catch(enError => {
              console.error(`Error loading fallback English translations:`, enError);
              setTranslations({}); // Fallback to empty if all fails
              setLoading(false);
            });
        } else {
          setTranslations({}); // Fallback to empty if default 'en' also fails
          setLoading(false);
        }
      });
  }, [appLanguage]);

  const t = useCallback((key: string, fallback?: string): string => {
    const keys = key.split('.');
    let current: string | Translations = translations;
    for (const k of keys) {
      if (typeof current === 'object' && current !== null && k in current) {
        current = (current as Translations)[k];
      } else {
        return fallback !== undefined ? fallback : key; // Return key or fallback if not found
      }
    }
    return typeof current === 'string' ? current : (fallback !== undefined ? fallback : key);
  }, [translations]);

  return { t, loading };
};
