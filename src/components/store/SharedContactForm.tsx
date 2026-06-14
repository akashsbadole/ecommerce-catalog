'use client';

import { useState } from 'react';
import { Send, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface SharedContactFormProps {
  initialEnquiryType?: string;
  categories?: { id: string; name: string }[];
  onSubmitSuccess?: () => void;
  variant?: 'full' | 'compact' | 'inline';
  bgColor?: string;
  textColor?: string;
  productContext?: string;
}

export function SharedContactForm({
  initialEnquiryType = 'contact',
  categories = [],
  onSubmitSuccess,
  variant = 'full',
  bgColor = '#2639ED',
  textColor = '#FFFFFF',
  productContext,
}: SharedContactFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    productInterest: '',
    quantity: '',
    message: '',
    source: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error('Please fill in your name and phone number');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email || null,
          phone: form.phone,
          companyName: form.company || null,
          subject: productContext
            ? `Enquiry about ${productContext}`
            : `Product Enquiry${form.productInterest ? ` - ${form.productInterest}` : ''}`,
          message: [
            form.company ? `Company: ${form.company}` : '',
            form.productInterest ? `Product interest: ${form.productInterest}` : '',
            form.quantity ? `Approx. qty/month: ${form.quantity}` : '',
            form.source ? `Source: ${form.source}` : '',
            form.message,
          ].filter(Boolean).join('\n'),
          type: initialEnquiryType === 'rfq' ? 'rfq' : 'product',
          quantity: form.quantity ? parseInt(form.quantity) : null,
        }),
      });
      if (res.ok) {
        toast.success('Enquiry submitted! Our team will respond within 24 hours.', { icon: <Check className="h-4 w-4" /> });
        setForm({ name: '', company: '', phone: '', email: '', productInterest: '', quantity: '', message: '', source: '' });
        onSubmitSuccess?.();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to submit enquiry');
      }
    } catch {
      toast.error('Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `w-full rounded px-3 py-2 text-sm border border-white/20 bg-white/10 placeholder:text-gray-400 text-[${textColor}]`;

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input placeholder="Your name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
          <input placeholder="Phone number *" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} required />
        </div>
        <input placeholder="Company name" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputClass} />
        <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          {submitting ? 'Submitting...' : 'Submit enquiry'}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {variant !== 'inline' && (
        <p className="text-xs" style={{ color: textColor }}>Fields marked * are required</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input placeholder="Your name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
        <input placeholder="Company name" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputClass} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input placeholder="Phone number *" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} required />
        <input placeholder="Email address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <select value={form.productInterest} onChange={(e) => setForm({ ...form, productInterest: e.target.value })} className={`${inputClass} text-gray-400`}>
          <option value="">Product category (optional)</option>
          {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <input placeholder="Approx. qty / month" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className={inputClass} />
      </div>
      <textarea placeholder="Message — describe your requirement (optional)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${inputClass} h-24 resize-none`} />
      {variant === 'full' && (
        <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={`${inputClass} text-gray-400`}>
          <option value="">How did you hear about us? (optional)</option>
          <option value="google">Google search</option>
          <option value="referral">Referral</option>
          <option value="social">Social media</option>
          <option value="trade">Trade show</option>
          <option value="other">Other</option>
        </select>
      )}
      <div className="text-center">
        <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium rounded px-8 py-2.5">
          {submitting ? 'Submitting...' : 'Submit enquiry'}
          <Send className="ml-2 h-4 w-4" />
        </Button>
        <p className="text-xs mt-2 opacity-70" style={{ color: textColor }}>Goes directly to CRM · sales team alerted · no spam</p>
      </div>
    </form>
  );
}
