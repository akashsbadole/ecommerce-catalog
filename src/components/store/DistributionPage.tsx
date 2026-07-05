"use client";

import {
  Truck,
  Globe,
  Shield,
  TrendingUp,
  ArrowRight,
  MapPin,
  Package,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/lib/use-seo";
import { getPageContentData } from "@/lib/use-page-content";
import { useCmsPageData } from "@/lib/use-cms-data";
import { LeadCaptureSection } from "@/components/store/LeadCaptureSection";
import { StoreLoading } from "./StoreLoading";

interface DistributionPageProps {
  onNavigate: (page: string, data?: unknown) => void;
  data?: Record<string, unknown>;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck,
  Globe,
  Shield,
  TrendingUp,
  MapPin,
  Package,
  Clock,
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

export function DistributionPage({
  onNavigate,
  data: externalData,
}: DistributionPageProps) {
  useSeo("distribution", {
    title: "Purva Bites Distribution | Pan-India FMCG Distribution Network",
    description: "Become a distributor for Purva Bites. Pan-India FMCG distribution network for khakhra, bhakhri, makhana, extruder snacks and digestive biscuits.",
  });

  const { data: distPageData, isLoading } = useCmsPageData("distribution");
  const distBlocks = distPageData?.blocks ?? null;
  const cmsData = externalData ?? getPageContentData(distBlocks, "distribution", {});

  const hero = (cmsData.hero as Record<string, unknown>) || {};
  const sections = (cmsData.sections as Array<{
    title: string;
    description: string;
    imageUrl: string;
    imageSide: "left" | "right";
    icon: string;
  }>) || [];
  const stats = (cmsData.stats as Array<{
    label: string;
    value: string;
    icon: string;
  }>) || [];
  const cta = (cmsData.cta as Record<string, string>) || {};

  if (isLoading) {
    return <StoreLoading />;
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${(hero.backgroundImage as string) || "/placeholder-hero.jpg"})`,
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {(hero.title as string) || "Purva Bites Distribution"}
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            {(hero.subtitle as string) || "Your trusted FMCG distribution partner — pan-India coverage, quality assured supply chain."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => onNavigate("contact")}
            >
              {(hero.ctaText as string) || "Become a Distributor"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      {stats.length > 0 && (
        <section className="bg-primary py-8 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center text-primary-foreground">
                  <ResolvedIcon name={stat.icon} className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-primary-foreground/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2-column alternating sections */}
      {sections.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl space-y-16">
            {sections.map((section, i) => (
              <div
                key={section.title || i}
                className={`flex flex-col ${section.imageSide === "right" ? "md:flex-row" : "md:flex-row-reverse"} gap-8 items-center`}
              >
                <div className="flex-1">
                  <div className="aspect-video bg-muted rounded-xl overflow-hidden">
                    {section.imageUrl ? (
                      <img
                        src={section.imageUrl}
                        alt={section.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ResolvedIcon name={section.icon || "Package"} className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <ResolvedIcon name={section.icon} className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      {(cta.title as string) && (
        <section className="bg-muted/40 py-16 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold mb-4">{cta.title as string}</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {(cta.description as string) || ""}
            </p>
            <Button
              size="lg"
              onClick={() => onNavigate("contact")}
            >
              {(cta.buttonText as string) || "Enquire Now"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      )}

      {/* Lead capture */}
      <LeadCaptureSection
        heading="Interested in distribution?"
        description="Fill in your details and our distribution team will get back to you within 24 hours."
        submitText="Submit Enquiry"
        fields={[
          { name: "name", label: "Your name", type: "text", required: true, placeholder: "Your name *" },
          { name: "company", label: "Company / Business name", type: "text", required: true, placeholder: "Company name *" },
          { name: "phone", label: "Phone number", type: "tel", required: true, placeholder: "Phone number *" },
          { name: "email", label: "Email address", type: "email", required: false, placeholder: "Email address" },
          { name: "city", label: "City / state", type: "text", required: true, placeholder: "City / state *" },
          { name: "requirement", label: "Type of enquiry", type: "select", required: true, placeholder: "Select type", options: ["Bulk Order", "Distribution Partnership", "Private Label", "White Label", "Institutional Order", "Other"] },
        ]}
        messageField
        successMessage="Thank you for showing interest. Our distribution team will get in touch with you soon."
        bgColor="#85AA64"
      />
    </div>
  );
}
