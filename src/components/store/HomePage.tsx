"use client";

import { useState, useEffect } from "react";
import { PageBlockRenderer } from "./PageBlockRenderer";
import type { PageBlock } from "@/lib/page-blocks";
import { normalizePageBlocks } from "@/lib/page-blocks";
import { useSeo } from "@/lib/use-seo";
import { StoreLoading } from "./StoreLoading";
import { LeadCaptureSection } from "./LeadCaptureSection";

interface HomePageProps {
  onNavigate: (page: string, data?: unknown) => void;
  settings?: Record<string, string> | null;
  data?: Record<string, unknown>;
}

export function HomePage({
  onNavigate,
  settings,
  data: externalData,
}: HomePageProps) {
  const [blocks, setBlocks] = useState<PageBlock[] | null>(null);
  const [cmsLoading, setCmsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [homeMeta, setHomeMeta] = useState<{
    metaTitle: string | null;
    metaDescription: string | null;
    ogImage: string | null;
  } | null>(null);

  useEffect(() => {
    if (externalData) {
      setCmsLoading(false);
      return;
    }

    const fetchHomepage = async () => {
      try {
        const res = await fetch("/api/content-pages?slug=homepage");
        if (res.ok) {
          const data = await res.json();
          const pages = data.contentPages || [];
          if (pages.length > 0) {
            const page = pages[0];
            setHomeMeta({
              metaTitle: page.metaTitle || null,
              metaDescription: page.metaDescription || null,
              ogImage: page.ogImage || null,
            });
            if (page.blocks) {
              const parsed = normalizePageBlocks(page.blocks);
              if (parsed.length > 0) {
                setBlocks(parsed);
                return;
              }
            }
            setCmsLoading(false);
            return;
          }
        }
      } catch {
      } finally {
        setCmsLoading(false);
      }
    };
    fetchHomepage();
  }, [externalData]);

  const siteOrigin =
    typeof window !== "undefined" ? window.location.origin : "";

  useSeo("home", {
    title:
      homeMeta?.metaTitle ||
      (settings?.site_name ? `${settings.site_name}` : undefined),
    description: homeMeta?.metaDescription,
    ogImage: homeMeta?.ogImage,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          name: settings?.site_name,
          url: siteOrigin,
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${siteOrigin}/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@type": "Organization",
          name: settings?.site_name,
          url: siteOrigin,
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "sales",
            availableLanguage: ["English", "Hindi"],
          },
        },
      ],
    },
  });

  if (cmsLoading) {
    return <StoreLoading />;
  }

  // Error state
  if (error || (!externalData && (!blocks || blocks.length === 0))) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">
          Unable to load homepage content.
        </p>
        <p className="mt-2 text-sm text-muted-foreground/70">
          Please ensure the homepage content page exists in the admin panel.
        </p>
      </div>
    );
  }

  // If external data is provided, render it directly
  if (externalData) {
    return (
      <div className="flex flex-col">
        <div className="p-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            {(externalData.hero as any)?.title || "Welcome to Our Company"}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            {(externalData.hero as any)?.subtitle ||
              "Your trusted partner for quality products"}
          </p>
          <div className="space-y-8">
            <pre className="text-left text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(externalData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // Render CMS blocks
  return (
    <div className="flex flex-col">
      <PageBlockRenderer blocks={blocks ?? undefined} onNavigate={onNavigate} />
      <LeadCaptureSection
        heading="Looking for a Manufacturing Partner?"
        description="Submit Your Requirements"
        submitText="Submit"
        fields={[
          { name: "name", label: "Your name", type: "text", required: true, placeholder: "Your name *" },
          { name: "company", label: "Company name", type: "text", required: true, placeholder: "Company name *" },
          { name: "phone", label: "Phone number", type: "tel", required: true, placeholder: "Phone number *" },
          { name: "email", label: "Email address", type: "email", required: false, placeholder: "Email address" },
          { name: "requirement", label: "Requirement type", type: "select", required: true, placeholder: "Inquiry type", options: ["Bulk Order", "Private Label", "White Label", "Distribution", "Institutional Order", "Other"] },
          { name: "city", label: "City / state", type: "text", required: false, placeholder: "City / state" },
        ]}
        messageField
        disclaimer="Data goes directly to CRM · No spam"
        successMessage="Thank You For Showing an Interest. We will get in touch with you soon."
        bgColor="#85AA64"
      />
    </div>
  );
}
