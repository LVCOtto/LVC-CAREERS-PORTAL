import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { usePortalSettings, SETTING_DEFAULTS } from '@/lib/portalSettingsContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import {
  Palette,
  Navigation,
  Eye,
  Type,
  Star,
  Save,
  RotateCcw,
  Paintbrush,
} from 'lucide-react';

interface SettingField {
  key: string;
  label: string;
  description?: string;
  type?: 'text' | 'textarea' | 'color';
}

function useSectionForm(fields: SettingField[], category: string) {
  const { getSetting, refetch } = usePortalSettings();
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initial: Record<string, string> = {};
    fields.forEach(f => {
      initial[f.key] = getSetting(f.key);
    });
    setValues(initial);
  }, [getSetting]);

  const setValue = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const settings = Object.entries(values).map(([key, value]) => ({
        key,
        value,
        category,
      }));
      const res = await fetch('/api/portal-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast({ title: 'Settings saved', description: 'Your changes have been saved successfully.' });
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    const initial: Record<string, string> = {};
    fields.forEach(f => {
      initial[f.key] = SETTING_DEFAULTS[f.key] || '';
    });
    setValues(initial);
  };

  return { values, setValue, save, reset, saving };
}

function BrandingSection() {
  const fields: SettingField[] = [
    { key: 'portal.title', label: 'Portal Title', description: 'Shown in the browser tab' },
    { key: 'portal.sidebarTitle', label: 'Sidebar Title', description: 'Text below the logo in the sidebar' },
    { key: 'portal.loginHeading', label: 'Login Page Heading', description: 'Main heading on the login screen' },
    { key: 'portal.loginSubheading', label: 'Login Page Subheading', description: 'Subtitle text on the login screen' },
    { key: 'branding.primaryColor', label: 'Primary Colour (HSL)', description: 'HSL values without commas, e.g. "222 47% 20%"', type: 'text' },
  ];
  const { values, setValue, save, reset, saving } = useSectionForm(fields, 'branding');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Branding & Identity</h3>
          <p className="text-sm text-muted-foreground">Customise portal titles and branding</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reset} data-testid="button-reset-branding">
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </Button>
          <Button size="sm" onClick={save} disabled={saving} data-testid="button-save-branding">
            <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
      <div className="grid gap-4">
        {fields.map(field => (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={field.key}>{field.label}</Label>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
            <Input
              id={field.key}
              value={values[field.key] || ''}
              onChange={e => setValue(field.key, e.target.value)}
              data-testid={`input-${field.key.replace(/\./g, '-')}`}
            />
          </div>
        ))}
      </div>
      {values['branding.primaryColor'] && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <div
            className="w-10 h-10 rounded-lg border"
            style={{ backgroundColor: `hsl(${values['branding.primaryColor']})` }}
          />
          <div className="text-sm">
            <p className="font-medium">Colour Preview</p>
            <p className="text-muted-foreground">hsl({values['branding.primaryColor']})</p>
          </div>
        </div>
      )}
    </div>
  );
}

function NavigationSection() {
  const fields: SettingField[] = [
    { key: 'nav.dashboard', label: 'Dashboard' },
    { key: 'nav.induction', label: 'Induction' },
    { key: 'nav.training', label: 'Training Matrix' },
    { key: 'nav.career', label: 'Career Roadmap' },
    { key: 'nav.playbook', label: 'Role Playbook' },
    { key: 'nav.milestones', label: 'Achievements' },
    { key: 'nav.resources', label: 'Resources' },
    { key: 'nav.organisation', label: 'Organisation' },
    { key: 'nav.team', label: 'My Team' },
  ];
  const { values, setValue, save, reset, saving } = useSectionForm(fields, 'navigation');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Navigation Labels</h3>
          <p className="text-sm text-muted-foreground">Rename sidebar menu items</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reset} data-testid="button-reset-navigation">
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </Button>
          <Button size="sm" onClick={save} disabled={saving} data-testid="button-save-navigation">
            <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {fields.map(field => (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              id={field.key}
              value={values[field.key] || ''}
              onChange={e => setValue(field.key, e.target.value)}
              data-testid={`input-${field.key.replace(/\./g, '-')}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PagesSection() {
  const pages = [
    { key: 'pages.induction.visible', label: 'Induction', description: 'Onboarding checklist for new starters' },
    { key: 'pages.career.visible', label: 'Career Roadmap', description: 'Visual career progression paths' },
    { key: 'pages.playbook.visible', label: 'Role Playbook', description: 'Role-specific guidance and expectations' },
    { key: 'pages.milestones.visible', label: 'Achievements', description: 'Career milestones and accomplishments' },
    { key: 'pages.resources.visible', label: 'Resources', description: 'Company documents and links' },
    { key: 'pages.organisation.visible', label: 'Organisation', description: 'Company structure and org chart' },
  ];
  const { getSetting, refetch } = usePortalSettings();
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    pages.forEach(p => {
      initial[p.key] = getSetting(p.key) !== 'false';
    });
    setValues(initial);
  }, [getSetting]);

  const toggle = (key: string) => {
    setValues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const settings = Object.entries(values).map(([key, value]) => ({
        key,
        value: String(value),
        category: 'pages',
      }));
      const res = await fetch('/api/portal-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast({ title: 'Settings saved', description: 'Page visibility updated.' });
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Page Visibility</h3>
          <p className="text-sm text-muted-foreground">Show or hide pages from the portal navigation</p>
        </div>
        <Button size="sm" onClick={save} disabled={saving} data-testid="button-save-pages">
          <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
      <div className="space-y-3">
        {pages.map(page => (
          <div key={page.key} className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">{page.label}</p>
              <p className="text-sm text-muted-foreground">{page.description}</p>
            </div>
            <Switch
              checked={values[page.key] ?? true}
              onCheckedChange={() => toggle(page.key)}
              data-testid={`switch-${page.key.replace(/\./g, '-')}`}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Dashboard and Training Matrix are always visible and cannot be hidden.
      </p>
    </div>
  );
}

function WordingSection() {
  const fields: SettingField[] = [
    { key: 'page.dashboard.welcomePrefix', label: 'Dashboard Welcome Prefix', description: 'Text before the user\'s name on the dashboard' },
    { key: 'page.training.heading', label: 'Training Page Heading' },
    { key: 'page.training.description', label: 'Training Page Description' },
    { key: 'page.training.assessmentInstructions', label: 'Self-Assessment Instructions', type: 'textarea' },
    { key: 'page.induction.heading', label: 'Induction Page Heading' },
    { key: 'page.induction.description', label: 'Induction Page Description' },
  ];
  const { values, setValue, save, reset, saving } = useSectionForm(fields, 'wording');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Page Wording</h3>
          <p className="text-sm text-muted-foreground">Customise headings, descriptions and instructions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reset} data-testid="button-reset-wording">
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </Button>
          <Button size="sm" onClick={save} disabled={saving} data-testid="button-save-wording">
            <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
      <div className="grid gap-4">
        {fields.map(field => (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={field.key}>{field.label}</Label>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
            {field.type === 'textarea' ? (
              <Textarea
                id={field.key}
                value={values[field.key] || ''}
                onChange={e => setValue(field.key, e.target.value)}
                rows={3}
                data-testid={`input-${field.key.replace(/\./g, '-')}`}
              />
            ) : (
              <Input
                id={field.key}
                value={values[field.key] || ''}
                onChange={e => setValue(field.key, e.target.value)}
                data-testid={`input-${field.key.replace(/\./g, '-')}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RatingScaleSection() {
  const fields: SettingField[] = [
    { key: 'rating.0', label: 'Level 0' },
    { key: 'rating.1', label: 'Level 1' },
    { key: 'rating.2', label: 'Level 2' },
    { key: 'rating.3', label: 'Level 3' },
    { key: 'rating.4', label: 'Level 4' },
  ];
  const { values, setValue, save, reset, saving } = useSectionForm(fields, 'ratings');

  const previewColors = [
    'bg-gray-200 text-gray-600',
    'bg-red-100 text-red-700',
    'bg-amber-100 text-amber-700',
    'bg-emerald-100 text-emerald-700',
    'bg-blue-100 text-blue-700',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Rating Scale Labels</h3>
          <p className="text-sm text-muted-foreground">Customise the 5-level rating scale used in the training matrix</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reset} data-testid="button-reset-ratings">
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </Button>
          <Button size="sm" onClick={save} disabled={saving} data-testid="button-save-ratings">
            <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
      <div className="grid gap-4">
        {fields.map((field, i) => (
          <div key={field.key} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold ${previewColors[i]}`}>
              {i}
            </div>
            <div className="flex-1">
              <Input
                id={field.key}
                value={values[field.key] || ''}
                onChange={e => setValue(field.key, e.target.value)}
                data-testid={`input-${field.key.replace(/\./g, '-')}`}
              />
            </div>
          </div>
        ))}
      </div>
      <Separator />
      <div>
        <p className="text-sm font-medium mb-3">Preview</p>
        <div className="flex gap-2 flex-wrap">
          {fields.map((field, i) => (
            <Badge key={i} variant="outline" className={`${previewColors[i]} border-0 px-3 py-1.5`}>
              {i} — {values[field.key] || SETTING_DEFAULTS[field.key]}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ArchitectStudio() {
  const { currentUser } = useAuth();
  const { isLoaded } = usePortalSettings();

  if (!currentUser || currentUser.role !== 'architect') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Access denied. Architect role required.</p>
        </div>
      </Layout>
    );
  }

  if (!isLoaded) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in max-w-4xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Paintbrush className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl font-bold" data-testid="text-architect-heading">
              Architect Studio
            </h1>
          </div>
          <p className="text-muted-foreground">
            Customise the portal appearance, wording, and navigation for all users.
          </p>
        </div>

        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="branding" data-testid="tab-branding" className="flex items-center gap-1.5">
              <Palette className="h-4 w-4" /> Branding
            </TabsTrigger>
            <TabsTrigger value="navigation" data-testid="tab-navigation" className="flex items-center gap-1.5">
              <Navigation className="h-4 w-4" /> Navigation
            </TabsTrigger>
            <TabsTrigger value="pages" data-testid="tab-pages" className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" /> Pages
            </TabsTrigger>
            <TabsTrigger value="wording" data-testid="tab-wording" className="flex items-center gap-1.5">
              <Type className="h-4 w-4" /> Wording
            </TabsTrigger>
            <TabsTrigger value="ratings" data-testid="tab-ratings" className="flex items-center gap-1.5">
              <Star className="h-4 w-4" /> Ratings
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <TabsContent value="branding" className="mt-0">
                  <BrandingSection />
                </TabsContent>
                <TabsContent value="navigation" className="mt-0">
                  <NavigationSection />
                </TabsContent>
                <TabsContent value="pages" className="mt-0">
                  <PagesSection />
                </TabsContent>
                <TabsContent value="wording" className="mt-0">
                  <WordingSection />
                </TabsContent>
                <TabsContent value="ratings" className="mt-0">
                  <RatingScaleSection />
                </TabsContent>
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}
