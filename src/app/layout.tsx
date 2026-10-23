import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TextSizeProvider } from "@/components/providers/text-size-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { AllPagesNav } from "@/components/layout/all-pages-nav";
import { AllPagesFooter } from "@/components/layout/all-pages-footer";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ScrollProgressBar } from "@/components/layout/scroll-progress-bar";
import { ScrollBackToTop } from "@/components/layout/scroll-back-to-top";
import { CommandPalette } from "@/components/command-palette";
import { Toaster } from "sonner";
import { Inter, JetBrains_Mono } from "next/font/google";
import { LazyMotion, domAnimation } from "framer-motion";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
});

const CANONICAL_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://moderndataengineer.uk";

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_SITE_URL),
  title: {
    default: "Lakehouse Architect | Modern Lakehouse Architecture & Systems Guide",
    template: "%s | Lakehouse Architect",
  },
  description:
    "The definitive enterprise reference platform for Lakehouse Architecture. Master Medallion Architecture, Microsoft Fabric OneLake, Databricks Delta Lake, Apache Iceberg, and Apache Spark 4.0 with 10,700+ verified scenarios.",
  keywords: [
    "Lakehouse",
    "Lakehouse Architecture",
    "Lakehouse Architect",
    "Data Lakehouse",
    "Medallion Architecture",
    "What is a Lakehouse",
    "Lakehouse vs Data Warehouse",
    "Delta Lake",
    "Apache Iceberg",
    "Microsoft Fabric OneLake",
    "Azure Databricks",
    "Unity Catalog",
    "Apache Spark 4.0",
    "DP-600 Exam Prep",
    "DP-203 Exam Prep",
    "Direct Lake Power BI",
    "Data Platform Architecture",
    "Data Engineering Interview",
    "System Design",
    "dbt",
    "Apache Airflow",
  ],
  authors: [{ name: "Santosh Jammi", url: CANONICAL_SITE_URL }],
  creator: "Santosh Jammi",
  publisher: "Lakehouse Architect",
  category: "technology",
  classification: "Data Platform Engineering & Lakehouse Architecture Portal",
  alternates: {
    canonical: CANONICAL_SITE_URL,
  },
  openGraph: {
    title: "Lakehouse Architect | Modern Lakehouse Architecture & Systems Guide",
    description:
      "The definitive enterprise reference platform for Lakehouse Architecture. Master Medallion Architecture, Microsoft Fabric OneLake, Databricks Delta Lake, Apache Iceberg, and Apache Spark 4.0 with 10,700+ verified scenarios.",
    url: CANONICAL_SITE_URL,
    siteName: "Lakehouse Architect",
    images: [
      {
        url: "/diagrams/fabric_onelake_architecture.webp",
        width: 1200,
        height: 675,
        alt: "Lakehouse Architect - Modern Lakehouse Architecture & Systems Guide",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lakehouse Architect | Modern Lakehouse Architecture & Systems Guide",
    description:
      "The definitive enterprise reference platform for Lakehouse Architecture. Master Medallion Architecture, Microsoft Fabric OneLake, Databricks Delta Lake, Apache Iceberg, and Apache Spark 4.0 with 10,700+ verified scenarios.",
    site: "@lakehouse_arch",
    creator: "@lakehouse_arch",
    images: ["/diagrams/fabric_onelake_architecture.webp"],
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
  icons: {
    icon: [
      { url: "/favicon.svg?v=3", type: "image/svg+xml" },
      { url: "/icon-512.png?v=3", sizes: "512x512", type: "image/png" },
      { url: "/icon-192.png?v=3", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico?v=3", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=3", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=3",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lakehouse",
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "8umVlTGBWPcEsCNwh0nMyrl_ZThusWOd561vhZEluzU",
    yandex: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0B" },
    { media: "(prefers-color-scheme: light)", color: "#f8f8fc" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} dark antialiased bg-[var(--background)] text-[var(--foreground)]`}
    >
      <head>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              prefetch: [
                {
                  where: { href_matches: "/*" },
                  eagerness: "conservative",
                },
              ],
            }),
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: `
          body { background-color: var(--background, #0A0A0B); color: var(--foreground, #f0f0f5); }
        `}} />
      </head>
      <body className="min-h-dvh overflow-x-clip bg-[var(--background)] text-[var(--foreground)]">

        <AuthProvider>
        <ThemeProvider>
          <TextSizeProvider>
          <LazyMotion features={domAnimation}>
          {/* Top scroll progress indicator across all interfaces */}
          <ScrollProgressBar />

          {/* Skip link for accessibility */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          {/* Aurora ambient background */}
          <div className="aurora-bg" aria-hidden="true">
            <div className="aurora-orb aurora-orb-1" />
            <div className="aurora-orb aurora-orb-2" />
            <div className="aurora-orb aurora-orb-3" />
          </div>

          {/* App shell */}
          <div className="relative z-10 flex min-h-dvh">
            {/* Desktop sidebar */}
            <Sidebar />

            {/* Main content area */}
            <div className="flex flex-1 flex-col min-w-0">
              {/* Mobile header */}
              <MobileHeader />

              {/* Top Announcement Bar (SitePoint/Noupe style) */}
              <AnnouncementBar />

              {/* Always-Visible Navigation Bar for All Pages & Subpages */}
              <AllPagesNav />

              {/* Page content */}
              <main
                id="main-content"
                className="flex-1 px-4 pt-4 pb-20 sm:px-6 lg:px-8 lg:pt-6 lg:pb-10"
                tabIndex={-1}
              >
                <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px]">
                  <Breadcrumbs />
                  {children}
                </div>
              </main>

              {/* Comprehensive All Pages & Subpages Site Footer */}
              <AllPagesFooter />

              {/* Mobile bottom nav */}
              <MobileNav />

              {/* Floating Scroll Back to Top button */}
              <ScrollBackToTop />
            </div>
          </div>

          {/* Global Command Palette */}
          <CommandPalette />

          {/* Toast notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "glass-card",
              style: {
                background: "var(--card)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              },
            }}
          />
          </LazyMotion>
          {/* Global WebSite & Organization Structured Data for Google Rich Snippets */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "WebSite",
                    "@id": `${CANONICAL_SITE_URL}/#website`,
                    "url": CANONICAL_SITE_URL,
                    "name": "Lakehouse Architect",
                    "description": "Enterprise Data Platform & Lakehouse Systems Architecture Encyclopedia and Interview Preparation Platform",
                    "publisher": {
                      "@id": `${CANONICAL_SITE_URL}/#organization`,
                    },
                    "potentialAction": {
                      "@type": "SearchAction",
                      "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": `${CANONICAL_SITE_URL}/concepts?search={search_term_string}`,
                      },
                      "query-input": "required name=search_term_string",
                    },
                    "inLanguage": "en-US",
                  },
                  {
                    "@type": "Organization",
                    "@id": `${CANONICAL_SITE_URL}/#organization`,
                    "name": "Lakehouse Architect",
                    "url": CANONICAL_SITE_URL,
                    "description": "Enterprise authority on Lakehouse Architecture, Medallion Architecture, Delta Lake, Apache Iceberg, and Cloud Data Platforms.",
                    "logo": {
                      "@type": "ImageObject",
                      "url": `${CANONICAL_SITE_URL}/icon-512.png`,
                      "width": 512,
                      "height": 512,
                    },
                    "sameAs": [
                      "https://github.com/santoshjammi29/fabric-pbi-prep",
                    ],
                    "knowsAbout": [
                      "Lakehouse",
                      "Lakehouse Architecture",
                      "Data Lakehouse",
                      "Medallion Architecture",
                      "Delta Lake",
                      "Apache Iceberg",
                      "Apache Spark",
                      "Microsoft Fabric OneLake",
                      "Databricks Unity Catalog",
                      "Data Engineering Systems",
                    ],
                  },
                ],
              }),
            }}
          />
          </TextSizeProvider>
        </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
