import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const SiteContext = createContext(null);

// Loads global site data (settings, menus, social) once for the public site.
export function SiteProvider({ children }) {
  const [data, setData] = useState({ settings: {}, menus: [], social: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/settings').catch(() => ({})),
      api.get('/menus').catch(() => []),
      api.get('/social').catch(() => []),
    ]).then(([settings, menus, social]) => {
      if (active) {
        setData({ settings, menus, social });
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return <SiteContext.Provider value={{ ...data, loading }}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext) || { settings: {}, menus: [], social: [], loading: true };
}
