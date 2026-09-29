import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
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

export const metadata: Metadata = {
  title: {
    default: "Microsoft Data Platform Architect Prep",
    template: "%s | MS Data Platform Prep",
  },
  description:
    "Technical interview preparation portal for Microsoft Fabric, Power BI, Databricks, and Modern Data Engineering. Study structured concepts and practice with challenging Q&As.",
  openGraph: {
    title: "Microsoft Data Platform Architect Prep",
    description:
      "2,600+ architect-level Q&As across Fabric, Power BI, ADF, SQL Server, Data Lake and Spark. Master the concepts that matter.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0B" },
    { media: "(prefers-color-scheme: light)", color: "#f8f8fc" },
  ],
  width: "device-width",
  initialScale: 1,
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
      style={{ colorScheme: "dark", backgroundColor: "#0A0A0B" }}
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased bg-[#0A0A0B] text-[#f0f0f5]`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');document.documentElement.style.colorScheme='light';document.documentElement.style.backgroundColor='#f8f8fc';}else{document.documentElement.classList.add('dark');document.documentElement.classList.remove('light');document.documentElement.style.colorScheme='dark';document.documentElement.style.backgroundColor='#0A0A0B';}}catch(e){}})();`,
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: `
          body { background-color: var(--background, #0A0A0B); color: var(--foreground, #f0f0f5); }
          html, body { scrollbar-gutter: stable; }
        `}} />
      </head>
      <body className="min-h-dvh bg-[#0A0A0B] text-[#f0f0f5]">

        <ThemeProvider>
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

              {/* Page content */}
              <main
                id="main-content"
                className="flex-1 px-4 pt-6 pb-24 sm:px-6 lg:px-8 lg:pt-8 lg:pb-10"
                tabIndex={-1}
              >
                <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px]">
                  <Breadcrumbs />
                  {children}
                </div>
              </main>

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
          <Script 
            id="speculation-rules" 
            type="speculationrules" 
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `{"prefetch": [{"where": {"href_matches": "/*"}, "eagerness": "moderate"}], "prerender": [{"urls": ["/concepts", "/qa-prep", "/guided-learning", "/architecture"]}]}`
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
