import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export const SETTING_DEFAULTS: Record<string, string> = {
  'portal.title': 'LVC Career Portal',
  'portal.loginHeading': 'Career Portal',
  'portal.loginSubheading': 'Training & Development Management System',
  'portal.sidebarTitle': 'Career Portal',
  'branding.primaryColor': '222 47% 20%',
  'nav.dashboard': 'Dashboard',
  'nav.induction': 'Induction',
  'nav.training': 'Training Matrix',
  'nav.career': 'Career Roadmap',
  'nav.playbook': 'Role Playbook',
  'nav.milestones': 'Achievements',
  'nav.resources': 'Resources',
  'nav.organisation': 'Organisation',
  'nav.team': 'My Team',
  'pages.induction.visible': 'true',
  'pages.career.visible': 'true',
  'pages.playbook.visible': 'true',
  'pages.milestones.visible': 'true',
  'pages.resources.visible': 'true',
  'pages.organisation.visible': 'true',
  'page.training.heading': 'Training Matrix',
  'page.training.description': 'Skills & development tracking',
  'page.training.assessmentInstructions': 'Rate your confidence for each skill area below. Be honest — this helps us identify training opportunities and celebrate your strengths.',
  'page.dashboard.welcomePrefix': 'Welcome back',
  'page.induction.heading': 'Induction',
  'page.induction.description': 'Complete your onboarding checklist to get started at LVC.',
  'rating.0': 'No Experience',
  'rating.1': 'Needs Training',
  'rating.2': 'Developing',
  'rating.3': 'Confident',
  'rating.4': 'Expert/Trainer',
};

interface PortalSettingsContextType {
  settings: Record<string, string>;
  getSetting: (key: string, defaultValue?: string) => string;
  isLoaded: boolean;
  refetch: () => void;
}

const PortalSettingsContext = createContext<PortalSettingsContextType | undefined>(undefined);

export function PortalSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/portal-settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch {
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const getSetting = useCallback((key: string, defaultValue?: string) => {
    return settings[key] || defaultValue || SETTING_DEFAULTS[key] || '';
  }, [settings]);

  return (
    <PortalSettingsContext.Provider value={{ settings, getSetting, isLoaded, refetch: fetchSettings }}>
      {children}
    </PortalSettingsContext.Provider>
  );
}

export function usePortalSettings() {
  const context = useContext(PortalSettingsContext);
  if (context === undefined) {
    throw new Error('usePortalSettings must be used within a PortalSettingsProvider');
  }
  return context;
}
