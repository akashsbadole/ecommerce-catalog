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
  Search,
  Building2,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { adminFetch } from '@/lib/admin-fetch';

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
  seo_default_title: '',
  seo_default_description: '',
  seo_ga_id: '',
  seo_fb_pixel: '',
  seo_canonical_url: '',
  b2b_show_company_fields: 'true',
  b2b_require_company: 'true',
  b2b_default_moq: '1',
  b2b_auto_reply: 'true',
  b2b_enable_tiered_pricing: 'false',
  b2b_enable_buyer_portal: 'false',
  b2b_verify_new_accounts: 'false',
  b2b_discount_silver: '0.05',
  b2b_discount_gold: '0.10',
  b2b_discount_platinum: '0.15',
};

export function AdminSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await adminFetch('/api/settings');
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
      const res = await adminFetch('/api/settings', {
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
      const res = await adminFetch('/api/settings', { method: 'POST' });
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
          {[1, 2, 3, 4, 5, 6].map((i) => (
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

  const metaDescLength = settings.seo_default_description?.length || 0;
  const metaDescColor = metaDescLength > 160 ? 'text-rose-500' : metaDescLength > 140 ? 'text-amber-500' : 'text-muted-foreground';

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

      {/* SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4" />
            SEO Settings
          </CardTitle>
          <CardDescription>
            Search engine optimization and analytics configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="seo_default_title">Default Meta Title</Label>
            <Input
              id="seo_default_title"
              value={settings.seo_default_title}
              onChange={(e) => handleSettingChange('seo_default_title', e.target.value)}
              placeholder="StyleStore - Premium Products"
            />
            <p className="text-xs text-muted-foreground">
              Used as the default page title across the site. Best practice: 50-60 characters.
            </p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo_default_description">Default Meta Description</Label>
              <span className={`text-xs font-medium ${metaDescColor}`}>
                {metaDescLength}/160
              </span>
            </div>
            <Textarea
              id="seo_default_description"
              value={settings.seo_default_description}
              onChange={(e) => handleSettingChange('seo_default_description', e.target.value)}
              placeholder="Brief description for search engines..."
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Describes your page in search results. Keep under 160 characters for optimal display.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo_ga_id">Google Analytics ID</Label>
            <Input
              id="seo_ga_id"
              value={settings.seo_ga_id}
              onChange={(e) => handleSettingChange('seo_ga_id', e.target.value)}
              placeholder="G-XXXXXXXXXX"
            />
            <p className="text-xs text-muted-foreground">
              Your Google Analytics 4 measurement ID.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo_fb_pixel">Facebook Pixel ID</Label>
            <Input
              id="seo_fb_pixel"
              value={settings.seo_fb_pixel}
              onChange={(e) => handleSettingChange('seo_fb_pixel', e.target.value)}
              placeholder="XXXXXXXXXXXXXXX"
            />
            <p className="text-xs text-muted-foreground">
              Your Meta (Facebook) Pixel ID for tracking conversions.
            </p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="seo_canonical_url">Canonical URL</Label>
            <Input
              id="seo_canonical_url"
              value={settings.seo_canonical_url}
              onChange={(e) => handleSettingChange('seo_canonical_url', e.target.value)}
              placeholder="https://your-domain.com"
            />
            <p className="text-xs text-muted-foreground">
              The primary URL for your site. Used in sitemap, canonical tags, and OG URLs.
            </p>
          </div>

          <div className="sm:col-span-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4">
            <div className="flex gap-3">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">SEO Deployment Checklist</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Set <code className="bg-muted px-1 py-0.5 rounded text-xs">NEXT_PUBLIC_SITE_URL</code> in your <code className="bg-muted px-1 py-0.5 rounded text-xs">.env</code> to your production domain</li>
                  <li>Verify your domain in Google Search Console</li>
                  <li>Submit your sitemap at <code className="bg-muted px-1 py-0.5 rounded text-xs">/sitemap.xml</code></li>
                  <li>Configure robots.txt via the public folder</li>
                  <li>Add structured data (JSON-LD) for rich results</li>
                  <li>Test with Google&apos;s Rich Results Test tool</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* B2B Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            B2B Settings
          </CardTitle>
          <CardDescription>
            Configure business-to-business enquiry and quotation behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="b2b_show_company_fields" className="cursor-pointer">
                Show Company Fields
              </Label>
              <p className="text-xs text-muted-foreground">
                Display company name field on enquiry forms
              </p>
            </div>
            <Switch
              id="b2b_show_company_fields"
              checked={settings.b2b_show_company_fields === 'true'}
              onCheckedChange={(checked) =>
                handleSettingChange('b2b_show_company_fields', String(checked))
              }
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="b2b_require_company" className="cursor-pointer">
                Require Company Name
              </Label>
              <p className="text-xs text-muted-foreground">
                Make company name mandatory for RFQ submissions
              </p>
            </div>
            <Switch
              id="b2b_require_company"
              checked={settings.b2b_require_company === 'true'}
              onCheckedChange={(checked) =>
                handleSettingChange('b2b_require_company', String(checked))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="b2b_default_moq">Default Minimum Order Quantity</Label>
            <Input
              id="b2b_default_moq"
              type="number"
              min="1"
              value={settings.b2b_default_moq}
              onChange={(e) => handleSettingChange('b2b_default_moq', e.target.value)}
              placeholder="1"
            />
            <p className="text-xs text-muted-foreground">
              Default MOQ displayed on product enquiry forms
            </p>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="b2b_auto_reply" className="cursor-pointer">
                Auto-Reply to Customer
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically send confirmation email to enquirers
              </p>
            </div>
            <Switch
              id="b2b_auto_reply"
              checked={settings.b2b_auto_reply === 'true'}
              onCheckedChange={(checked) =>
                handleSettingChange('b2b_auto_reply', String(checked))
              }
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="b2b_enable_tiered_pricing" className="cursor-pointer">
                Enable Tiered Pricing
              </Label>
              <p className="text-xs text-muted-foreground">
                Show different prices based on customer tier (Standard, Gold, etc.)
              </p>
            </div>
            <Switch
              id="b2b_enable_tiered_pricing"
              checked={settings.b2b_enable_tiered_pricing === 'true'}
              onCheckedChange={(checked) =>
                handleSettingChange('b2b_enable_tiered_pricing', String(checked))
              }
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="b2b_enable_buyer_portal" className="cursor-pointer">
                Enable Buyer Portal
              </Label>
              <p className="text-xs text-muted-foreground">
                Allow customers to login and view their personalized dashboard
              </p>
            </div>
            <Switch
              id="b2b_enable_buyer_portal"
              checked={settings.b2b_enable_buyer_portal === 'true'}
              onCheckedChange={(checked) =>
                handleSettingChange('b2b_enable_buyer_portal', String(checked))
              }
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="b2b_verify_new_accounts" className="cursor-pointer">
                Verify New Accounts
              </Label>
              <p className="text-xs text-muted-foreground">
                Manually approve B2B accounts before they can see tiered pricing
              </p>
            </div>
            <Switch
              id="b2b_verify_new_accounts"
              checked={settings.b2b_verify_new_accounts === 'true'}
              onCheckedChange={(checked) =>
                handleSettingChange('b2b_verify_new_accounts', String(checked))
              }
            />
          </div>

          <Separator className="sm:col-span-2" />

          <div className="sm:col-span-2 space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              B2B Tier Discount Percentages
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="discount-silver">Silver Tier (%)</Label>
                <Input
                  id="discount-silver"
                  type="number"
                  value={Math.round(Number(settings.b2b_discount_silver || 0.05) * 100)}
                  onChange={(e) => handleSettingChange('b2b_discount_silver', String(Number(e.target.value) / 100))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount-gold">Gold Tier (%)</Label>
                <Input
                  id="discount-gold"
                  type="number"
                  value={Math.round(Number(settings.b2b_discount_gold || 0.10) * 100)}
                  onChange={(e) => handleSettingChange('b2b_discount_gold', String(Number(e.target.value) / 100))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount-platinum">Platinum Tier (%)</Label>
                <Input
                  id="discount-platinum"
                  type="number"
                  value={Math.round(Number(settings.b2b_discount_platinum || 0.15) * 100)}
                  onChange={(e) => handleSettingChange('b2b_discount_platinum', String(Number(e.target.value) / 100))}
                />
              </div>
            </div>
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
