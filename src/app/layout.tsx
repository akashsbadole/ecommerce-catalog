import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "StyleStore - Premium Products",
    template: "%s | StyleStore",
  },
  description:
    "Discover premium products at StyleStore. Browse our curated catalogue of high-quality items with competitive pricing and excellent customer service.",
  keywords: [
    "StyleStore",
    "premium products",
    "online catalogue",
    "e-commerce",
    "B2B",
    "wholesale",
  ],
  authors: [{ name: "StyleStore Team" }],
  creator: "StyleStore",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "StyleStore - Premium Products",
    description:
      "Discover premium products at StyleStore. Browse our curated catalogue of high-quality items.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com",
    siteName: "StyleStore",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "StyleStore - Premium Products",
    description:
      "Discover premium products at StyleStore. Browse our curated catalogue of high-quality items.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=yes" />
        <meta name="format-detection" content="email=yes" />
        <meta name="format-detection" content="address=yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
