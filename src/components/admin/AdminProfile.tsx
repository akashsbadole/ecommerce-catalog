'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Upload, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminFetch } from '@/lib/admin-fetch';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
}

export function AdminProfile({ userId }: { userId?: string }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: '', avatar: '', bio: '' });

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await adminFetch(`/api/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        const user = data.user;
        setProfile(user);
        setForm({
          name: user.name || '',
          avatar: user.avatar || '',
          bio: user.bio || '',
        });
      }
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await adminFetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, avatar: data.url }));
        toast.success('Avatar uploaded');
      } else {
        toast.error('Failed to upload avatar');
      }
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!profile?.id) {
      toast.error('Profile not loaded');
      return;
    }
    setSaving(true);
    try {
      const res = await adminFetch(`/api/users/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          avatar: form.avatar || null,
          bio: form.bio.trim() || null,
        }),
      });
      if (res.ok) {
        toast.success('Profile updated');
        fetchProfile();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update profile');
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground mt-1">Manage your profile information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            {form.avatar ? (
              <img
                src={form.avatar}
                alt="Avatar"
                className="h-16 w-16 rounded-full object-cover border"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold border">
                {form.name.charAt(0).toUpperCase()}
              </span>
            )}
            <div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
                <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
                  <span>
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    {uploading ? 'Uploading...' : 'Upload Avatar'}
                  </span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {profile?.email && (
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="h-10 px-3 flex items-center text-sm text-muted-foreground bg-muted rounded-md border">
                {profile.email}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="profile-bio">Bio</Label>
            <Textarea
              id="profile-bio"
              placeholder="Write a short bio about yourself..."
              value={form.bio}
              onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              This will be displayed on your blog posts.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving || !profile}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
