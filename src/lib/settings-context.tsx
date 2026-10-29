'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings } from './types';
import { DEFAULT_SETTINGS } from './db';

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: SiteSettings;
}) {
  const [settings, setSettings] = useState<SiteSettings>(
    initialSettings || DEFAULT_SETTINGS
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchLatestSettings = async () => {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
          if (typeof window !== 'undefined') {
            localStorage.setItem('bullgear_site_settings', JSON.stringify(data.settings));
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch latest settings from server:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Check local storage for quick cache
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('bullgear_site_settings');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setSettings((prev) => ({ ...prev, ...parsed }));
        } catch {
          // ignore corrupted JSON
        }
      }
    }

    // 2. Fetch fresh from server
    fetchLatestSettings();

    // 3. Listen for cross-tab or cross-component updates
    const handleSettingsUpdated = () => {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('bullgear_site_settings');
        if (cached) {
          try {
            setSettings(JSON.parse(cached));
          } catch {
            // ignore
          }
        }
      }
    };

    window.addEventListener('bullgear_settings_updated', handleSettingsUpdated);
    return () => {
      window.removeEventListener('bullgear_settings_updated', handleSettingsUpdated);
    };
  }, []);

  const handleUpdate = async (newSettings: Partial<SiteSettings>): Promise<boolean> => {
    try {
      const merged: SiteSettings = { ...settings, ...newSettings };
      setSettings(merged);
      if (typeof window !== 'undefined') {
        localStorage.setItem('bullgear_site_settings', JSON.stringify(merged));
        window.dispatchEvent(new Event('bullgear_settings_updated'));
      }

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings }),
      });

      if (!res.ok) {
        throw new Error('Failed to save settings on server');
      }

      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        if (typeof window !== 'undefined') {
          localStorage.setItem('bullgear_site_settings', JSON.stringify(data.settings));
        }
      }
      return true;
    } catch (err) {
      console.error('Error saving settings:', err);
      return false;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings: handleUpdate,
        refreshSettings: fetchLatestSettings,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      settings: DEFAULT_SETTINGS,
      updateSettings: async () => false,
      refreshSettings: async () => {},
      isLoading: false,
    };
  }
  return context;
}

