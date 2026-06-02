import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
};

export const metadata: Metadata = {
  title: {
    default:
      "Purva Bites - Premium Roasted Makhana, Dry Fruits & Healthy Snacks",
    template: "%s | Purva Bites",
  },
  description:
    "Purva Bites is a premier manufacturer and dealer of high-quality roasted makhana, premium dry fruits, flavored khakhra, flavored bhakhri and healthy snacks.",
  keywords: [
    "Purva Bites",
    "roasted makhana",
    "premium dry fruits",
    "flavored khakhra",
    "flavored bhakhri",
    "healthy snacks",
    "snack manufacturer",
    "makhana",
    "khakhra",
    "bhakhri",
  ],
  authors: [{ name: "Purva Bites" }],
  creator: "Purva Bites",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com",
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Purva Bites - Premium Roasted Makhana, Dry Fruits & Healthy Snacks",
    description:
      "Purva Bites is a premier manufacturer and dealer of high-quality roasted makhana, premium dry fruits, flavored khakhra, flavored bhakhri and healthy snacks.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com",
    siteName: "Purva Bites",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Purva Bites - Premium Roasted Makhana, Dry Fruits & Healthy Snacks",
    description:
      "Purva Bites is a premier manufacturer and dealer of high-quality roasted makhana, premium dry fruits, flavored khakhra, flavored bhakhri and healthy snacks.",
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
        className={`${inter.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          // defaultTheme="system"
          // enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
