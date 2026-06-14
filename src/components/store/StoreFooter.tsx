"use client";

import {
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

import { toast } from "sonner";
import { useState, useEffect } from "react";

interface StoreFooterProps {
  onNavigate: (page: string, data?: unknown) => void;
  settings?: Record<string, string> | null;
}

interface FooterMenuItem {
  id: string;
  label: string;
  page?: string;
  url?: string;
  slug?: string;
  children?: FooterMenuItem[];
}

export function StoreFooter({ onNavigate, settings }: StoreFooterProps) {
  const companyEmail = settings?.site_email || settings?.contact_email || "";
  const companyPhone = settings?.site_phone || settings?.contact_phone || "";
  const companyAddress =
    settings?.site_address || settings?.contact_address || "";
  const siteName = settings?.site_name || "My Store";

  const [footerMenuItems, setFooterMenuItems] = useState<FooterMenuItem[]>([]);
  const [footerMenuLoading, setFooterMenuLoading] = useState(true);

  const facebookUrl = settings?.facebook_url || "#";
  const twitterUrl = settings?.twitter_url || "#";
  const instagramUrl = settings?.instagram_url || "#";
  const linkedinUrl = settings?.linkedin_url || "#";

  // Fetch footer menu from API
  useEffect(() => {
    async function fetchFooterMenu() {
      try {
        const res = await fetch("/api/menus?location=footer");
        if (res.ok) {
          const data = await res.json();
          if (data.menu && data.items) {
            setFooterMenuItems(data.items);
          }
        }
      } catch {
        // Use fallback to hardcoded links if menu fetch fails
        setFooterMenuItems([]);
      } finally {
        setFooterMenuLoading(false);
      }
    }
    fetchFooterMenu();
  }, []);

  const customerServiceLinks = [
    { label: "Shipping Info", page: "content-page", data: "shipping-info" },
    {
      label: "Returns & Exchanges",
      page: "content-page",
      data: "returns-exchanges",
    },
    { label: "Privacy Policy", page: "content-page", data: "privacy-policy" },
    {
      label: "Terms of Service",
      page: "content-page",
      data: "terms-of-service",
    },
  ];

  return (
    <footer className="border-t bg-muted/30" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold tracking-tight">
                {siteName}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {settings?.site_description ||
                "Your trusted online store for quality products and exceptional service."}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {footerMenuLoading ? (
                // Loading skeleton
                Array.from({ length: 7 }).map((_, i) => (
                  <li key={i}>
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  </li>
                ))
              ) : footerMenuItems.length > 0 ? (
                // Render menu items from API
                footerMenuItems.map((item) => {
                  const hasChildren = item.children && item.children.length > 0;
                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => {
                          if (item.page) {
                            onNavigate(item.page);
                          } else if (item.url) {
                            window.open(item.url, "_blank");
                          }
                        }}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                      >
                        {item.label}
                      </button>
                      {hasChildren && item.children?.map((child) => (
                        <div key={child.id} className="pl-4 mt-1">
                          <button
                            onClick={() => {
                              if (child.page) {
                                onNavigate(child.page);
                              } else if (child.url) {
                                window.open(child.url, "_blank");
                              }
                            }}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                          >
                            {child.label}
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })
              ) : (
                // Fallback to hardcoded links
                [
                  { label: "Home", page: "home" },
                  { label: "About Us", page: "about" },
                  { label: "Manufacturing", page: "manufacturing" },
                  { label: "Products", page: "products" },
                  { label: "Catalogue", page: "catalogue" },
                  { label: "Blog", page: "blog" },
                  { label: "Contact Us", page: "contact" },
                ].map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => onNavigate(link.page)}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                    >
                      {link.label}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Customer Service
            </h3>
            <ul className="space-y-2">
              {customerServiceLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => onNavigate(link.page, link.data)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Contact Info
            </h3>
            <ul className="space-y-3">
              {companyEmail && (
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <a
                    href={`mailto:${companyEmail}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {companyEmail}
                  </a>
                </li>
              )}
              {companyPhone && (
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <a
                    href={`tel:${companyPhone}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {companyPhone}
                  </a>
                </li>
              )}
              {companyAddress && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {companyAddress}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()}{" "}
            {settings?.site_name || "My Store"}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Crafted with care for quality shopping.
          </p>
        </div>
      </div>
    </footer>
  );
}
