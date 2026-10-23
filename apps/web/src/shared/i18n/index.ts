import React, { createContext, useContext, useState, useCallback } from 'react';
import enLanding from '../../../public/locales/en/landing.json';
import amLanding from '../../../public/locales/am/landing.json';

type LocaleDict = Record<string, any>;

const dictionaries: Record<string, Record<string, LocaleDict>> = {
  en: {
    landing: enLanding,
  },
  am: {
    landing: amLanding,
  },
};

interface I18nContextType {
  language: string;
  changeLanguage: (lng: string) => void;
  t: (key: string, options?: Record<string, any>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = 'unimarket_lang';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
  });

  const changeLanguage = useCallback((lng: string) => {
    setLanguage(lng);
    try {
      localStorage.setItem(STORAGE_KEY, lng);
    } catch {
      // ignore
    }
  }, []);

  const translate = useCallback(
    (key: string, namespace = 'landing', options?: Record<string, any>): string => {
      const dict = dictionaries[language]?.[namespace] || dictionaries.en[namespace] || {};
      const parts = key.split('.');
      let current: any = dict;

      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          // fallback to en
          let fallback: any = dictionaries.en[namespace];
          for (const fbPart of parts) {
            if (fallback && typeof fallback === 'object' && fbPart in fallback) {
              fallback = fallback[fbPart];
            } else {
              fallback = null;
              break;
            }
          }
          current = fallback || key;
          break;
        }
      }

      if (typeof current !== 'string') {
        return key;
      }

      if (options) {
        let result = current;
        for (const [optKey, optVal] of Object.entries(options)) {
          result = result.replace(new RegExp(`{{${optKey}}}`, 'g'), String(optVal));
        }
        return result;
      }

      return current;
    },
    [language]
  );

  return React.createElement(
    I18nContext.Provider,
    {
      value: {
        language,
        changeLanguage,
        t: (key: string, options?: Record<string, any>) => translate(key, 'landing', options),
      },
    },
    children
  );
}

export function useTranslation(namespace = 'landing') {
  const context = useContext(I18nContext);

  if (!context) {
    // Graceful fallback outside provider
    const translateStatic = (key: string, options?: Record<string, any>): string => {
      const dict = dictionaries.en[namespace] || {};
      const parts = key.split('.');
      let current: any = dict;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return key;
        }
      }
      if (typeof current === 'string') {
        if (options) {
          let result = current;
          for (const [optKey, optVal] of Object.entries(options)) {
            result = result.replace(new RegExp(`{{${optKey}}}`, 'g'), String(optVal));
          }
          return result;
        }
        return current;
      }
      return key;
    };

    return {
      t: translateStatic,
      i18n: {
        language: 'en',
        changeLanguage: () => {},
      },
    };
  }

  return {
    t: context.t,
    i18n: {
      language: context.language,
      changeLanguage: context.changeLanguage,
    },
  };
}
