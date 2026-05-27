'use client';

import { useState } from 'react';
import { Send, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface EnquiryModalProps {
  productName: string;
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnquiryModal({
  productName,
  productId,
  open,
  onOpenChange,
}: EnquiryModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: `I'm interested in ${productName}. Please provide more information.`,
  });

  // Reset form when modal opens with a new product
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setForm({
        name: '',
        email: '',
        phone: '',
        message: `I'm interested in ${productName}. Please provide more information.`,
      });
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          subject: `Enquiry about ${productName}`,
          message: form.message,
          productId: productId,
          type: 'product',
        }),
      });

      if (res.ok) {
        toast.success('Enquiry submitted successfully! We\'ll get back to you soon.', {
          icon: <Check className="h-4 w-4 text-emerald-600" />,
        });
        handleOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-emerald-600" />
            Enquire about this product
          </DialogTitle>
          <DialogDescription>
            You&apos;re enquiring about: <span className="font-semibold text-foreground">{productName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="em-name">
              Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="em-name"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="em-email">
              Email <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="em-email"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="em-phone">Phone</Label>
            <Input
              id="em-phone"
              type="tel"
              placeholder="Your phone number (optional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="em-message">
              Message <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="em-message"
              placeholder="Tell us what you'd like to know..."
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit as unknown as () => void}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={submitting}
          >
            {submitting ? (
              'Submitting...'
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Enquiry
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
