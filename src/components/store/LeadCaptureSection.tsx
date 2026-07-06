"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface LeadCaptureField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string;
  options?: string[];
}

export interface LeadCaptureSectionProps {
  heading?: string;
  description?: string;
  submitText?: string;
  disclaimer?: string;
  fields?: LeadCaptureField[];
  messageField?: boolean;
  bgColor?: string;
  apiEndpoint?: string;
  successMessage?: string;
  productContext?: { name: string; id: string } | null;
}

export function LeadCaptureSection({
  heading = "",
  description = "",
  submitText = "Submit",
  disclaimer = "",
  fields = [],
  messageField = true,
  bgColor,
  apiEndpoint = "/api/enquiries",
  successMessage = "Enquiry submitted! We'll call you back within 24 hours.",
  productContext,
}: LeadCaptureSectionProps) {
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const body: Record<string, unknown> = Object.fromEntries(formData);
      if (productContext) {
        body.productName = productContext.name;
        body.productId = productContext.id;
      }
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(successMessage, {
          icon: <Send className="h-4 w-4" />,
        });
        form.reset();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to submit. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      className="relative overflow-hidden bg-foreground text-background scroll-mt-14"
      id="contact"
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: bgColor || "#016129" }}
      />
      <div className="relative z-10 container mx-auto px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {heading && (
            <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-2">
              {heading}
            </h2>
          )}
          {description && (
            <p className="text-sm text-white text-center mb-8">{description}</p>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {productContext && (
              <input type="hidden" name="productName" value={productContext.name} />
            )}
            {fields.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {fields.map((field) => (
                  <div
                    key={field.name}
                    className={`space-y-1 ${field.type === "textarea" ? "sm:col-span-2 md:col-span-3" : ""}`}
                  >
                    {field.label && (
                      <label className="text-xs font-medium text-background/80 ml-1">
                        {field.label}
                        {field.required && (
                          <span className="text-rose-400 ml-1">*</span>
                        )}
                      </label>
                    )}
                    {field.type === "select" ? (
                      <Select name={field.name} required={field.required}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-base w-full">
                          <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {(field.options || []).map((opt) => (
                            <SelectItem key={opt} value={opt.toLowerCase()}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === "textarea" ? (
                      <Textarea
                        name={field.name}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-base"
                        rows={4}
                      />
                    ) : (
                      <Input
                        name={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-base"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            {messageField && (
              <Textarea
                name="message"
                placeholder="Brief requirement or message (optional)"
                rows={3}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-base"
              />
            )}
            <div className="text-center">
              <Button
                type="submit"
                size="lg"
                disabled={sending}
                className="bg-primary text-white hover:bg-background/40"
              >
                {sending ? "Sending..." : submitText}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
            {disclaimer && (
              <p className="text-xs text-background/50 text-center mt-3">
                {disclaimer}
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
