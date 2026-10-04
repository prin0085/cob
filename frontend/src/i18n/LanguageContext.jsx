import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { dictionary, DEFAULT_LANG, LANGS } from './dictionary.js';

const LanguageContext = createContext(null);
const KEY = 'cob_lang';

function readStored() {
  const saved = localStorage.getItem(KEY);
  if (saved && LANGS.includes(saved)) return saved;
  // Fall back to the browser preference, then default.
  const nav = (navigator.language || '').toLowerCase();
  if (nav.startsWith('th')) return 'th';
  return DEFAULT_LANG;
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readStored);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem(KEY, lang);
  }, [lang]);

  const setLang = useCallback((next) => {
    if (LANGS.includes(next)) setLangState(next);
  }, []);

  const toggle = useCallback(() => {
    setLangState((l) => (l === 'en' ? 'th' : 'en'));
  }, []);

  // t(key, vars) — looks up the string and interpolates {placeholders}.
  const t = useCallback(
    (key, vars) => {
      const table = dictionary[lang] || dictionary[DEFAULT_LANG];
      let str = table[key] ?? dictionary[DEFAULT_LANG][key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
        });
      }
      return str;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, toggle, t }), [lang, setLang, toggle, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  return (
    useContext(LanguageContext) || {
      lang: DEFAULT_LANG,
      setLang: () => {},
      toggle: () => {},
      t: (k) => dictionary[DEFAULT_LANG][k] ?? k,
    }
  );
}

// Pick a localized field from a CMS object: localize(obj, 'name', lang)
// returns obj.name_th when lang is 'th' and it exists, otherwise obj.name.
export function localize(obj, field, lang) {
  if (!obj) return '';
  if (lang && lang !== DEFAULT_LANG) {
    const localized = obj[`${field}_${lang}`];
    if (localized != null && localized !== '') return localized;
  }
  return obj[field] ?? '';
}
