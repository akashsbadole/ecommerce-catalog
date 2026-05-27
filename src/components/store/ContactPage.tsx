'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

interface ContactPageProps {
  settings?: Record<string, string> | null;
}

export function ContactPage({ settings }: ContactPageProps) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const companyEmail = settings?.contact_email || 'hello@stylestore.com';
  const companyPhone = settings?.contact_phone || '+1 (555) 123-4567';
  const companyAddress = settings?.contact_address || '123 Style Avenue, Fashion District, NY 10001';
  const businessHours = settings?.business_hours || 'Mon-Fri: 9:00 AM - 6:00 PM';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          subject: form.subject,
          message: form.message,
        }),
      });

      if (res.ok) {
        toast.success('Your message has been sent successfully! We\'ll get back to you soon.', {
          icon: <Check className="h-4 w-4 text-emerald-600" />,
        });
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to send message');
      }
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Page Header */}
      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Get in Touch</h1>
        <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
          Have a question about our products or services? We&apos;d love to hear from you.
          Send us a message and we&apos;ll respond as soon as possible.
        </p>
      </section>

      {/* Contact Info Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <CardContent className="pt-6 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Mail className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Email Us</h3>
              <p className="text-sm text-muted-foreground mt-1">{companyEmail}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Phone className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Call Us</h3>
              <p className="text-sm text-muted-foreground mt-1">{companyPhone}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Clock className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Business Hours</h3>
              <p className="text-sm text-muted-foreground mt-1">{businessHours}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contact Form + Info */}
      <section className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-emerald-600" />
              Send us a Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ct-name">
                    Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="ct-name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ct-email">
                    Email <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="ct-email"
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ct-phone">Phone</Label>
                  <Input
                    id="ct-phone"
                    type="tel"
                    placeholder="Your phone number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ct-subject">
                    Subject <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="ct-subject"
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ct-message">
                  Message <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  id="ct-message"
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={submitting}
              >
                {submitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Our Office</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <p className="text-sm text-muted-foreground">{companyAddress}</p>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm text-muted-foreground">{companyEmail}</p>
                  <p className="text-xs text-muted-foreground mt-1">We reply within 24 hours</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm text-muted-foreground">{companyPhone}</p>
                  <p className="text-xs text-muted-foreground mt-1">Mon-Fri from 9am to 6pm</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
