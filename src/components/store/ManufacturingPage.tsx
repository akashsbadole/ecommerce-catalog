"use client";

import { useState } from "react";
import {
  Factory,
  Leaf,
  Filter,
  Flame,
  Microscope,
  Package,
  Truck,
  MapPin,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useSeo } from "@/lib/use-seo";
import { StoreHeroBanner } from "@/components/store/StoreHeroBanner";
import { getPageContentData } from "@/lib/use-page-content";
import { useCmsPageData } from "@/lib/use-cms-data";
import { LeadCaptureSection } from "@/components/store/LeadCaptureSection";
import { StoreLoading } from "./StoreLoading";

interface ManufacturingPageProps {
  onNavigate: (page: string, data?: unknown) => void;
  data?: Record<string, unknown>;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Leaf,
  Filter,
  Flame,
  Microscope,
  Package,
  Truck,
  Factory,
  Settings,
  ShieldCheck,
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

export function ManufacturingPage({
  onNavigate,
  data: _data,
}: ManufacturingPageProps) {
  useSeo("manufacturing", {
    title: "State-of-the-art FMCG contract manufacturing | Purva Bites",
    description: "From raw material to finished, packaged goods — at scale, with precision, under one roof in Gujarat. FSSAI certified, 100% own manufacturing.",
  });
  const [activeLine, setActiveLine] = useState("khakhra");
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const { data: mfgPageData, isLoading: mfgLoading } = useCmsPageData("mfg-page-content");
  const { data: fallbackPageData, isLoading: fallbackLoading } = useCmsPageData("manufacturing");
  const isLoading = mfgLoading || fallbackLoading;
  const effectiveBlocks = (mfgPageData?.blocks ?? fallbackPageData?.blocks) ?? null;
  const cmsMfgData = getPageContentData(effectiveBlocks, "manufacturing-content", {});

  const hero = (cmsMfgData?.hero as Record<string, unknown>) || {};
  const metrics = (cmsMfgData?.metrics as Array<{ value: string; label: string }>) || [];
  const intro = (cmsMfgData?.intro as Record<string, string>) || {};
  const productionLines = (cmsMfgData?.productionLines as Array<{
    id: string;
    name: string;
    flagship: boolean;
    capacity: string;
    variants: string;
    packs: string;
    desc: string;
    tags: string[];
    ctaText?: string;
    ctaLink?: string;
    ctaEnabled?: boolean;
    image?: string;
  }>) || [];
  const qualitySteps = (cmsMfgData?.qualitySteps as Array<{ icon: string; color: string; title: string; desc: string }>) || [];
  const qualityFooterItems = (cmsMfgData?.qualityFooterItems as string[]) || [];
  const privateLabel = (cmsMfgData?.privateLabel as Record<string, unknown>) || {};
  const plItems = (privateLabel.items as Array<{ icon: string; title: string; desc: string }>) || [];
  const plDetails = (privateLabel.details as Array<{ label: string; value: string }>) || [];
  const certifications = (cmsMfgData?.certifications as Array<{ name: string; desc: string }>) || [];
  const ctaData = (cmsMfgData?.cta as Record<string, string>) || {};

  if (isLoading) return <StoreLoading />;

  const activeLineData =
    productionLines.find((l) => l.id === activeLine) || productionLines[0];

  return (
    <div className="flex flex-col">
      {/* M1: Hero */}
      <StoreHeroBanner hero={hero} onNavigate={onNavigate} />

      {/* Intro + Metrics */}
      {(intro.heading || intro.description || metrics.length > 0) && (
      <section className="bg-muted/40 py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <p className="text-xs text-muted-foreground mb-4">
            Home › Manufacturing
          </p>
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-[2]">
              {(intro.heading as string) && (
                <h2 className="text-lg font-bold mb-2">
                  {intro.heading as string}
                </h2>
              )}
              {(intro.description as string) && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {intro.description as string}
                </p>
              )}
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              {metrics.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-background border rounded-lg p-4 text-center"
                >
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* M2: Production Lines */}
      {productionLines.length > 0 && (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Production lines
          </p>
          <h2 className="text-2xl font-bold mb-6">
            Our {productionLines.length} production lines
          </h2>
          <div className="flex gap-2 mb-8 flex-wrap">
            {productionLines.map((line) => (
              <button
                key={line.id}
                onClick={() => setActiveLine(line.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  activeLine === line.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {line.name}
              </button>
            ))}
          </div>
          <div className="border rounded-xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-[280px] h-48 md:h-auto bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                {activeLineData?.image && !imgErrors.has(activeLine) ? (
                  <img
                    src={activeLineData.image}
                    alt={activeLineData.name}
                    className="w-full h-full object-cover"
                    onError={() =>
                      setImgErrors((prev) => new Set(prev).add(activeLine))
                    }
                  />
                ) : (
                  <span className="text-muted-foreground text-sm">
                    {activeLineData?.name} machinery photo
                  </span>
                )}
              </div>
              <div className="flex-1 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">
                    {activeLineData?.name} production
                  </h3>
                  {activeLineData?.flagship && (
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                      Flagship line
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-xs">
                    <p className="font-semibold text-sm mb-0.5">
                      Capacity / day
                    </p>
                    <p className="text-muted-foreground">
                      {activeLineData?.capacity}
                    </p>
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-sm mb-0.5">Variants</p>
                    <p className="text-muted-foreground">
                      {activeLineData?.variants}
                    </p>
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-sm mb-0.5">Pack sizes</p>
                    <p className="text-muted-foreground">
                      {activeLineData?.packs}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {activeLineData?.desc}
                </p>
                <div className="flex gap-2 flex-wrap items-center">
                  {activeLineData?.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-muted px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {activeLineData?.ctaEnabled !== false && activeLineData?.ctaText && (
                    <button
                      onClick={() => {
                        const link = (activeLineData?.ctaLink as string) || "";
                        if (link.startsWith("/")) {
                          window.location.assign(link);
                        } else {
                          onNavigate(link || "category", activeLineData?.id || "khakhra");
                        }
                      }}
                      className="text-xs bg-primary text-primary-foreground rounded px-3 py-1.5 hover:bg-primary/90 transition-colors ml-auto"
                    >
                      {activeLineData?.ctaText ?? ""}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* M4: Quality Process */}
      {qualitySteps.length > 0 && (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Quality process
          </p>
          <h2 className="text-2xl font-bold mb-2">
            From raw material to your shelf
          </h2>
          <p className="text-sm text-muted-foreground mb-10">
            Every batch follows a documented {qualitySteps.length}-stage quality
            process — no shortcuts
          </p>
          <div className="flex flex-col md:flex-row items-start gap-2">
            {qualitySteps.map((step, i) => (
              <div key={step.title} className="flex items-start flex-1">
                <div className="flex flex-col items-center text-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center mb-3`}
                  >
                    <ResolvedIcon name={step.icon} className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold mb-1">{step.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                {i < qualitySteps.length - 1 && (
                  <div className="hidden md:flex items-start pt-5 px-1 text-muted-foreground">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
          {qualityFooterItems.length > 0 && (
            <div className="mt-10 bg-muted/50 border rounded-lg p-4 flex flex-wrap gap-6 items-center">
              {qualityFooterItems.map((item) => (
                <span
                  key={item}
                  className="text-xs text-muted-foreground flex items-center gap-1.5"
                >
                  <span className="text-emerald-600">✓</span> {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
      )}

      {/* M5: Private Label */}
      {(privateLabel.heading || plItems.length > 0) && (
      <section className="bg-muted/40 py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {(privateLabel.heading as string) && (
            <h2 className="text-2xl font-bold mb-2">
              {privateLabel.heading as string}
            </h2>
          )}
          {(privateLabel.subtitle as string) && (
            <p className="text-sm text-muted-foreground mb-10">
              {privateLabel.subtitle as string}
            </p>
          )}
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-[1.2] space-y-4">
              {plItems.map((item) => (
                <div
                  key={item.title}
                  className="bg-background border rounded-lg p-4 flex gap-3"
                >
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ResolvedIcon
                      name={item.icon}
                      className="h-4 w-4 text-primary"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-1">
              <div className="bg-background border rounded-xl p-5">
                <p className="text-sm font-semibold mb-4">
                  Key details at a glance
                </p>
                {plDetails.map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-center text-xs py-2.5 border-b last:border-0"
                  >
                    <span className="text-foreground/60">{item.label}</span>
                    <span className="font-semibold text-foreground">
                      {item.value}
                    </span>
                  </div>
                ))}
                {(privateLabel.ctaLink as string) && (privateLabel.ctaText as string) ? (
                  <button
                    onClick={() => {
                      const link = (privateLabel.ctaLink as string);
                      if (link.startsWith("http")) {
                        window.open(link, "_blank");
                      } else if (link.startsWith("#")) {
                        const el = document.getElementById(link.slice(1));
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      } else if (link.startsWith("/")) {
                        window.location.assign(link);
                      } else {
                        onNavigate(link);
                      }
                    }}
                    className="w-full mt-5 bg-primary text-primary-foreground text-sm font-medium rounded-md py-2.5 hover:bg-primary/90 transition-colors"
                  >
                    {(privateLabel.ctaText as string) ?? ""}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* M6: Certifications */}
      {certifications.length > 0 && (
        <section className="bg-muted/40 py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Certifications
            </p>
            <h2 className="text-2xl font-bold mb-8">
              Certified. Audited. Trusted.
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {certifications.map((cert) => (
                <div
                  key={cert.name}
                  className="bg-background border rounded-xl p-5 text-center"
                >
                  <div className="w-12 h-12 bg-muted rounded-lg mx-auto mb-3 flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {cert.name.split(" ")[0]}
                  </div>
                  <p className="text-sm font-semibold mb-1">{cert.name}</p>
                  <p className="text-xs text-muted-foreground">{cert.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* M7: Contact Form */}
      <LeadCaptureSection
        heading={(ctaData.title as string) ?? ""}
        description={ctaData.subtitle as string}
        submitText="Send Enquiry"
        fields={[
          { name: "name", label: "Your name", type: "text", required: true, placeholder: "Your name *" },
          { name: "company", label: "Company name", type: "text", required: true, placeholder: "Company name *" },
          { name: "phone", label: "Phone number", type: "tel", required: true, placeholder: "Phone number *" },
          { name: "email", label: "Email address", type: "email", required: false, placeholder: "Email address" },
          { name: "requirement", label: "Requirement type", type: "select", required: true, placeholder: "Inquiry type", options: ["Bulk Order", "Private Label", "White Label", "Distribution", "Institutional Order", "Other"] },
          { name: "city", label: "City / state", type: "text", required: false, placeholder: "City / state" },
        ]}
        messageField
        successMessage="Thank You For Showing an Interest. We will get in touch with you soon."
        bgColor="#85AA64"
      />
    </div>
  );
}
