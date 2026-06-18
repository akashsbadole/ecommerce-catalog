"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Box,
  Truck,
  TrendingUp,
  Briefcase,
  MoreHorizontal,
  MapPin,
  Factory,
  Clock,
} from "lucide-react";
import { useAppStore } from '@/lib/store';
import { useContentPage, getBlockData } from "@/lib/use-page-content";
import { BLOCK_DEFAULTS } from "@/lib/page-blocks";
import { useSeo } from "@/lib/use-seo";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ContactPageProps {
  onNavigate: (page: string, data?: unknown) => void;
  data?: Record<string, unknown>;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Package,
  Box,
  Truck,
  TrendingUp,
  Briefcase,
  MoreHorizontal,
  MapPin,
  Factory,
};

function ResolvedIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = iconMap[name];
  if (Icon) return <Icon className={className} />;
  return null;
}

export function ContactPage({
  onNavigate,
  data: externalData,
}: ContactPageProps) {
  const { blocks, meta, loading } = useContentPage("contact-page-content");
  useSeo("contact", {
    title: meta?.metaTitle || meta?.title,
    description: meta?.metaDescription,
    ogImage: meta?.ogImage,
  });
  const rawData = getBlockData(blocks, "contact-page-content");
  if (loading && !externalData) return null;
  const data =
    externalData ??
    rawData ??
    BLOCK_DEFAULTS["contact-page-content"].defaultData;

  const hero = (data.hero as Record<string, unknown>) || {};
  const requirementTypes =
    (hero.requirementTypes as Array<{
      id: string;
      label: string;
      icon: string;
    }>) || [];
  const formSection = (data.formSection as Record<string, string>) || {};
  const responsePromise =
    (data.responsePromise as Record<string, unknown>) || {};
  const promiseItems =
    (responsePromise.items as Array<{ label: string; time: string }>) || [];
  const locations = (data.locations as Record<string, unknown>) || {};
  const locationCards =
    (locations.cards as Array<{
      type: string;
      title: string;
      subtitle?: string;
      address?: string;
      accessibility?: string;
      description?: string;
      highlights?: string[];
      cta?: string;
      buttons?: Array<{ text: string; icon: string }>;
    }>) || [];

  const [selectedType, setSelectedType] = useState(
    requirementTypes[0]?.id || "bulk",
  );
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col">
      {/* CT0: Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-[#abd0ff] to-gray-900 py-28 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-white/80 mb-4">
            Get in touch
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-gray">
            {(hero.title as string) || "Let's talk about your requirement"}
          </h1>
          {(hero.subtitle as string) && (
            <p className="text-gray max-w-2xl mx-auto leading-relaxed mb-8">
              {hero.subtitle as string}
            </p>
          )}
          <div className="flex gap-2 justify-center flex-wrap">
            {requirementTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                  selectedType === type.id
                    ? "bg-black/40 text-primary border-white"
                    : "bg-black/40 border-white/20 text-gray hover:bg-black/40"
                }`}
              >
                <ResolvedIcon name={type.icon} className="h-3.5 w-3.5" />
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CT1: Shared Contact Form */}
      <section id="contact-form" className="bg-white py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          {(formSection.title as string) && (
            <h2 className="text-xl font-bold text-center mb-2 text-foreground">
              {formSection.title as string}
            </h2>
          )}
          {(formSection.subtitle as string) && (
            <p className="text-sm text-muted-foreground text-center mb-8">
              {formSection.subtitle as string}
            </p>
          )}
          <div className="flex justify-center">
            <button
              onClick={() => useAppStore.getState().openEnquiryModal()}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium px-8 py-3 rounded-md hover:bg-primary/90 transition-colors"
            >
              Submit Enquiry
            </button>
          </div>
        </div>
      </section>

      {/* Response promise */}
      {promiseItems.length > 0 && (
        <section className="bg-muted/40 py-8 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 max-w-md mx-auto">
              <p className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />{" "}
                {(responsePromise.title as string) || "Our response commitment"}
              </p>
              <div className="space-y-3">
                {promiseItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-center text-xs border-b pb-2 last:border-0"
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-primary font-medium">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
              {(responsePromise.footer as string) && (
                <p className="text-[10px] text-muted-foreground mt-3">
                  {responsePromise.footer as string}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CT2: Address Cards */}
      {locationCards.length > 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-5xl">
            {(locations.title as string) && (
              <h2 className="text-lg font-bold mb-8">
                {locations.title as string}
              </h2>
            )}
            <div className="grid md:grid-cols-3 gap-6">
              {locationCards.map((card) => (
                <div
                  key={card.title}
                  className={`bg-background border rounded-xl p-5 border-t-4 ${card.type === "visit" ? "border-t-primary bg-primary/5 border-primary/20" : card.type === "factory" ? "border-t-primary" : "border-t-muted"}`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <ResolvedIcon
                      name={card.type === "visit" ? "MapPin" : "Factory"}
                      className={`h-5 w-5 ${card.type === "factory" || card.type === "visit" ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <p className="text-sm font-semibold">{card.title}</p>
                    {card.subtitle && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-auto">
                        {card.subtitle}
                      </span>
                    )}
                  </div>
                  {card.address && (
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3 whitespace-pre-line">
                      {card.address}
                    </p>
                  )}
                  {card.accessibility && (
                    <p className="text-xs text-muted-foreground mb-4">
                      {card.accessibility}
                    </p>
                  )}
                  {card.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      {card.description}
                    </p>
                  )}
                  {card.highlights && (
                    <div className="space-y-2 mb-5">
                      {card.highlights.map((h) => (
                        <p
                          key={h}
                          className="text-xs text-muted-foreground flex items-center gap-2"
                        >
                          <span className="text-primary">✓</span> {h}
                        </p>
                      ))}
                    </div>
                  )}
                  {card.buttons && (
                    <div className="flex gap-2">
                      {card.buttons.map((btn) => (
                        <button
                          key={btn.text}
                          className="text-[10px] border rounded px-2 py-1 flex items-center gap-1 hover:bg-muted"
                        >
                          <ResolvedIcon name={btn.icon} className="h-3 w-3" />{" "}
                          {btn.text}
                        </button>
                      ))}
                    </div>
                  )}
                  {card.cta && (
                    <button
                      onClick={() => {
                        const form = document.getElementById("contact-form");
                        if (form) form.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="w-full bg-primary text-primary-foreground text-xs font-medium rounded py-2.5 hover:bg-primary/90 transition-colors"
                    >
                      {card.cta}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
