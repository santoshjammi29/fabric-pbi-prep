import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { CommandPalette } from "@/components/command-palette";
import { Toaster } from "sonner";
import "./globals.css";

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
    { media: "(prefers-color-scheme: dark)", color: "#0a0a14" },
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
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-dvh">

        <ThemeProvider>
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
                className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
                tabIndex={-1}
              >
                <div className="mx-auto max-w-7xl">{children}</div>
              </main>

              {/* Mobile bottom nav */}
              <MobileNav />
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
        </ThemeProvider>
      </body>
    </html>
  );
}
