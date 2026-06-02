'use client';

import { useState } from 'react';
import { Send, Check, Building2, Hash, Package, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const [businessOpen, setBusinessOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: `I'm interested in ${productName}. Please provide more information.`,
    enquiryType: 'product',
    quantity: '1',
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
  });

  const isRFQ = form.enquiryType === 'rfq';

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      message: `I'm interested in ${productName}. Please provide more information.`,
      enquiryType: 'product',
      quantity: '1',
      companyName: '',
      companyEmail: '',
      companyPhone: '',
      companyAddress: '',
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      resetForm();
      setBusinessOpen(false);
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isRFQ && (!form.quantity || parseInt(form.quantity) < 1)) {
      toast.error('Please enter a valid quantity for your quote request');
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
          subject: isRFQ
            ? `RFQ: ${productName} (Qty: ${form.quantity})`
            : `Enquiry about ${productName}`,
          message: form.message,
          productId: productId,
          type: isRFQ ? 'rfq' : 'product',
          quantity: form.quantity ? parseInt(form.quantity) : null,
          companyName: form.companyName || null,
          companyEmail: form.companyEmail || null,
          companyPhone: form.companyPhone || null,
          companyAddress: form.companyAddress || null,
        }),
      });

      if (res.ok) {
        toast.success(
          isRFQ
            ? 'Quote request submitted! Our sales team will respond shortly.'
            : 'Enquiry submitted successfully! We\'ll get back to you soon.',
          {
            icon: <Check className="h-4 w-4 text-primary" />,
          }
        );
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Enquire about this product
          </DialogTitle>
          <DialogDescription>
            You&apos;re enquiring about:{' '}
            <span className="font-semibold text-foreground">{productName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Enquiry Type & Quantity */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="em-type">Enquiry Type</Label>
              <Select
                value={form.enquiryType}
                onValueChange={(val) =>
                  setForm({ ...form, enquiryType: val })
                }
              >
                <SelectTrigger id="em-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">General Enquiry</SelectItem>
                  <SelectItem value="rfq">Request for Quote (RFQ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="em-qty" className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                Required Quantity
                {isRFQ && <span className="text-rose-500">*</span>}
              </Label>
              <Input
                id="em-qty"
                type="number"
                min="1"
                placeholder="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className={isRFQ ? 'border-amber-400 ring-1 ring-amber-400' : ''}
              />
              {isRFQ && (
                <p className="text-xs text-amber-600">
                  Quantity is required for quote requests
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Personal Details */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Your Details
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
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
          </div>

          {/* Collapsible Business Details */}
          <Collapsible open={businessOpen} onOpenChange={setBusinessOpen}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Business Details
                  {(form.companyName || form.companyEmail) && (
                    <span className="text-xs text-primary font-normal">(filled)</span>
                  )}
                </span>
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="em-company" className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    Company Name
                  </Label>
                  <Input
                    id="em-company"
                    placeholder="Acme Corp"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="em-company-email">Company Email</Label>
                  <Input
                    id="em-company-email"
                    type="email"
                    placeholder="sales@company.com"
                    value={form.companyEmail}
                    onChange={(e) => setForm({ ...form, companyEmail: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="em-company-phone">Company Phone</Label>
                  <Input
                    id="em-company-phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={form.companyPhone}
                    onChange={(e) => setForm({ ...form, companyPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="em-company-address">Company Address</Label>
                  <Input
                    id="em-company-address"
                    placeholder="123 Business St"
                    value={form.companyAddress}
                    onChange={(e) => setForm({ ...form, companyAddress: e.target.value })}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="em-message">
              Message <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="em-message"
              placeholder="Tell us what you'd like to know..."
              rows={3}
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
            className="bg-primary hover:bg-primary/80 text-white"
            disabled={submitting}
          >
            {submitting ? (
              'Submitting...'
            ) : isRFQ ? (
              <>
                <Hash className="mr-2 h-4 w-4" />
                Request Quote
              </>
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
