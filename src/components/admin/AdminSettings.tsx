'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  Mail,
  RefreshCw,
  Globe,
  Phone,
  MapPin,
  Share2,
  Server,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface Settings {
  [key: string]: string;
}

const defaultSettings: Settings = {
  site_name: '',
  site_description: '',
  currency: 'USD',
  currency_symbol: '$',
  site_email: '',
  site_phone: '',
  site_address: '',
  facebook_url: '',
  instagram_url: '',
  twitter_url: '',
  smtp_host: '',
  smtp_port: '587',
  smtp_user: '',
  smtp_pass: '',
  email_from: '',
};

export function AdminSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings({ ...defaultSettings, ...data.settings });
        }
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        toast.success('Settings saved successfully');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save settings');
      }
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/settings', { method: 'POST' });
      if (res.ok) {
        toast.success('Test email sent successfully');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to send test email');
      }
    } catch {
      toast.error('Failed to send test email');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="grid gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6 space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground mt-1">Configure your store settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            General
          </CardTitle>
          <CardDescription>Basic store information</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="site_name">Site Name</Label>
            <Input
              id="site_name"
              value={settings.site_name}
              onChange={(e) => handleSettingChange('site_name', e.target.value)}
              placeholder="StyleStore"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={settings.currency}
              onChange={(e) => handleSettingChange('currency', e.target.value)}
              placeholder="USD"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="site_description">Site Description</Label>
            <Input
              id="site_description"
              value={settings.site_description}
              onChange={(e) => handleSettingChange('site_description', e.target.value)}
              placeholder="A brief description of your store"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency_symbol">Currency Symbol</Label>
            <Input
              id="currency_symbol"
              value={settings.currency_symbol}
              onChange={(e) => handleSettingChange('currency_symbol', e.target.value)}
              placeholder="$"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-4 w-4" />
            Contact Information
          </CardTitle>
          <CardDescription>How customers can reach you</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="site_email">Site Email</Label>
            <Input
              id="site_email"
              type="email"
              value={settings.site_email}
              onChange={(e) => handleSettingChange('site_email', e.target.value)}
              placeholder="info@store.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site_phone">Phone Number</Label>
            <Input
              id="site_phone"
              value={settings.site_phone}
              onChange={(e) => handleSettingChange('site_phone', e.target.value)}
              placeholder="+1 234 567 890"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="site_address">Address</Label>
            <Input
              id="site_address"
              value={settings.site_address}
              onChange={(e) => handleSettingChange('site_address', e.target.value)}
              placeholder="123 Main St, City, Country"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Share2 className="h-4 w-4" />
            Social Media
          </CardTitle>
          <CardDescription>Your social media profiles</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="facebook_url">Facebook URL</Label>
            <Input
              id="facebook_url"
              value={settings.facebook_url}
              onChange={(e) => handleSettingChange('facebook_url', e.target.value)}
              placeholder="https://facebook.com/yourpage"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram_url">Instagram URL</Label>
            <Input
              id="instagram_url"
              value={settings.instagram_url}
              onChange={(e) => handleSettingChange('instagram_url', e.target.value)}
              placeholder="https://instagram.com/yourpage"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="twitter_url">Twitter URL</Label>
            <Input
              id="twitter_url"
              value={settings.twitter_url}
              onChange={(e) => handleSettingChange('twitter_url', e.target.value)}
              placeholder="https://twitter.com/yourpage"
            />
          </div>
        </CardContent>
      </Card>

      {/* Email / SMTP Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Server className="h-4 w-4" />
            Email (SMTP)
          </CardTitle>
          <CardDescription>Configure email settings for notifications</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="smtp_host">SMTP Host</Label>
            <Input
              id="smtp_host"
              value={settings.smtp_host}
              onChange={(e) => handleSettingChange('smtp_host', e.target.value)}
              placeholder="smtp.gmail.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp_port">SMTP Port</Label>
            <Input
              id="smtp_port"
              type="number"
              value={settings.smtp_port}
              onChange={(e) => handleSettingChange('smtp_port', e.target.value)}
              placeholder="587"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp_user">SMTP User</Label>
            <Input
              id="smtp_user"
              value={settings.smtp_user}
              onChange={(e) => handleSettingChange('smtp_user', e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp_pass">SMTP Password</Label>
            <Input
              id="smtp_pass"
              type="password"
              value={settings.smtp_pass}
              onChange={(e) => handleSettingChange('smtp_pass', e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email_from">Email From</Label>
            <Input
              id="email_from"
              value={settings.email_from}
              onChange={(e) => handleSettingChange('email_from', e.target.value)}
              placeholder="noreply@store.com"
            />
          </div>

          <Separator className="sm:col-span-2" />

          <div className="sm:col-span-2 flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleTestEmail}
              disabled={testing}
            >
              {testing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              {testing ? 'Sending...' : 'Send Test Email'}
            </Button>
            <span className="text-sm text-muted-foreground">
              Sends a test email to the site email address
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}
