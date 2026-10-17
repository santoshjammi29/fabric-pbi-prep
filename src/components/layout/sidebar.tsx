"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { TextSizeController } from "@/components/ui/text-size-controller";
import { ChevronLeft, Columns2 } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { NAV_GROUPS, isSubHrefActive, NavItem } from "@/data/navigation-data";

const pillVariants: Record<string, string> = {
  easy: "bg-green-500/10 text-green-400 border-green-500/20",
  medium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  hard: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  architect: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  new: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const DEFAULT_WIDTH = 285;
const MIN_WIDTH = 220;
const MAX_WIDTH = 520;

function SidebarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const [showWidthMenu, setShowWidthMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedCollapsed = localStorage.getItem("sidebar-collapsed");
    if (savedCollapsed === "true") setCollapsed(true);

    const savedWidth = localStorage.getItem("sidebar-width");
    if (savedWidth) {
      const num = parseInt(savedWidth, 10);
      if (!isNaN(num) && num >= MIN_WIDTH && num <= MAX_WIDTH) {
        setWidth(num);
      }
    }
  }, []);

  // Close width menu on outside click
  useEffect(() => {
    if (!showWidthMenu) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowWidthMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showWidthMenu]);

  // Handle Drag Resizing
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Persist width changes
  useEffect(() => {
    if (width >= MIN_WIDTH && width <= MAX_WIDTH) {
      localStorage.setItem("sidebar-width", String(width));
    }
  }, [width]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const setPresetWidth = (newWidth: number) => {
    setWidth(newWidth);
    setShowWidthMenu(false);
  };

  const isItemActive = (item: NavItem) => {
    if (!pathname) return false;
    if (item.href === "/") return pathname === "/";
    if (item.subItems && item.subItems.some((sub) => isSubHrefActive(pathname, searchParams, sub.href))) {
      return true;
    }
    if (item.href.includes("?")) {
      if (isSubHrefActive(pathname, searchParams, item.href)) return true;
      if (item.matches && item.matches.some((m) => isSubHrefActive(pathname, searchParams, m))) return true;
      return false;
    }
    const isSpecialPillarActive = NAV_GROUPS.flatMap((g) => g.items).some((other) => {
      if (other.href === item.href) return false;
      return other.href.includes("?") && isSubHrefActive(pathname, searchParams, other.href);
    });
    if (isSpecialPillarActive) return false;

    if (pathname.startsWith(item.href)) return true;
    if (item.matches && item.matches.some((m) => pathname.startsWith(m.split("?")[0]))) return true;
    return false;
  };

  const isSubActive = (subHref: string) => {
    return isSubHrefActive(pathname, searchParams, subHref);
  };

  return (
    <aside
      style={{ width: collapsed ? 72 : width }}
      className={cn(
        "hidden lg:flex flex-col h-dvh sticky top-0 border-r relative",
        "bg-[var(--surface-1)] border-[var(--border)]",
        isDragging ? "transition-none select-none" : "transition-[width] duration-200 ease-in-out"
      )}
    >
      {/* Brand & Resize Controls */}
      <div
        className={cn(
          "flex items-center h-16 px-3 sm:px-4 border-b border-[var(--border)] shrink-0",
          collapsed ? "flex-col justify-center gap-1 py-2 h-auto" : "justify-between"
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 sm:gap-3 min-w-0 group"
          title="DataPlatform Architect - Home"
        >
          <BrandLogo
            size={collapsed ? 28 : 32}
            className="transition-transform duration-200 group-hover:scale-105 shrink-0"
          />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold text-[var(--foreground)] tracking-tight break-words leading-tight group-hover:text-blue-400 transition-colors">
                DataPlatform
              </h1>
              <span className="text-[10px] font-medium text-[var(--muted-foreground)] block -mt-0.5">
                Architect Prep
              </span>
            </div>
          )}
        </Link>

        {/* Action Controls: Width Preset Menu & Collapse Button */}
        <div className={cn("flex items-center gap-1", collapsed && "flex-col")}>
          {!collapsed && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowWidthMenu(!showWidthMenu)}
                className={cn(
                  "p-1.5 rounded-lg hover:bg-[var(--surface-3)] transition-colors cursor-pointer text-xs flex items-center gap-1",
                  showWidthMenu
                    ? "bg-[var(--surface-3)] text-blue-400 font-semibold"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
                title="Adjust nav bar width (Presets & Custom Drag)"
                aria-label="Adjust nav bar width"
                aria-haspopup="dialog"
                aria-expanded={showWidthMenu}
              >
                <Columns2 size={14} />
                <span className="text-[10px] font-mono hidden xl:inline">{width}px</span>
              </button>

              {showWidthMenu && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  role="dialog"
                  aria-label="Nav Bar Width Presets"
                >
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] border-b border-[var(--border)] mb-1">
                    Nav Bar Width
                  </div>
                  {[
                    { label: "Compact", val: 240 },
                    { label: "Default", val: 285 },
                    { label: "Comfortable", val: 340 },
                    { label: "Wide View", val: 420 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      onClick={() => setPresetWidth(preset.val)}
                      className={cn(
                        "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left",
                        width === preset.val
                          ? "bg-blue-500/10 text-blue-400 font-semibold"
                          : "text-[var(--foreground)] hover:bg-[var(--surface-3)]"
                      )}
                    >
                      <span>{preset.label}</span>
                      <span className="text-[10px] font-mono text-[var(--muted-foreground)]">{preset.val}px</span>
                    </button>
                  ))}
                  <div className="mt-1.5 pt-1.5 border-t border-[var(--border)] px-1 text-[10px] text-[var(--muted-foreground)]">
                    Tip: Drag right border to freely resize
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={toggleCollapsed}
            className={cn(
              "p-1.5 rounded-lg hover:bg-[var(--surface-3)] transition-colors cursor-pointer",
              "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
              collapsed && "mt-1"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              size={16}
              className={cn(
                "transition-transform duration-300",
                collapsed && "rotate-180"
              )}
            />
          </button>
        </div>
      </div>

      {/* Navigation Tree — Always Visible on All Layouts with Full Word Wrap */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-none">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={cn(gi > 0 && "mt-3.5")}>
            {group.title && !collapsed && (
              <div className="px-3 mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)] break-words whitespace-normal leading-tight">
                {group.title}
              </div>
            )}
            {group.title && collapsed && gi > 0 && (
              <div className="mx-3 mb-2 border-t border-[var(--border)]" />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isItemActive(item);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-start gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                        "hover:bg-[var(--surface-3)]",
                        active
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold shadow-[inset_2px_0_0_rgb(59,130,246)]"
                          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                        collapsed && "justify-center px-0 items-center"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={18} className="shrink-0 mt-0.5" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 break-words whitespace-normal leading-snug text-left">
                            {item.label}
                          </span>
                          {item.pill && (
                            <span
                              className={cn(
                                "text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 leading-tight mt-0.5",
                                pillVariants[item.pill.variant]
                              )}
                            >
                              {item.pill.text}
                            </span>
                          )}
                        </>
                      )}
                    </Link>

                    {/* All sub-navigation items ALWAYS visible with Full Word Wrap */}
                    {!collapsed && item.subItems && (
                      <ul className="ml-5 my-1 space-y-0.5 border-l-2 border-[var(--border)] pl-3">
                        {item.subItems.map((sub) => {
                          const subActive = isSubActive(sub.href);
                          return (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                className={cn(
                                  "flex items-start gap-2 px-2 py-1.5 text-xs rounded-lg transition-all",
                                  subActive
                                    ? "text-blue-600 dark:text-blue-400 bg-blue-500/10 font-bold shadow-xs"
                                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]"
                                )}
                              >
                                <span
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 transition-all",
                                    subActive
                                      ? "bg-blue-500 scale-125 shadow-[0_0_6px_rgba(59,130,246,0.8)]"
                                      : "bg-[var(--muted-foreground)]/30"
                                  )}
                                />
                                <span className="flex-1 break-words whitespace-normal leading-snug text-left">
                                  {sub.label}
                                </span>
                                {sub.badge && (
                                  <span
                                    className={cn(
                                      "text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0 mt-0.5",
                                      subActive
                                        ? "bg-blue-600/20 text-blue-600 dark:text-blue-300"
                                        : "bg-[var(--surface-2)] text-[var(--muted-foreground)]"
                                    )}
                                  >
                                    {sub.badge}
                                  </span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer — Text Size & Theme switchers */}
      <div className={cn("p-3 border-t border-[var(--border)] shrink-0", collapsed ? "space-y-2" : "space-y-2.5")}>
        <TextSizeController collapsed={collapsed} direction="up" align="start" />
        <ThemeSwitcher collapsed={collapsed} direction="up" align="start" />
      </div>

      {/* Interactive Draggable Resize Handle */}
      {!collapsed && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize nav bar width"
          title="Drag to resize nav bar width · Double-click to reset (285px)"
          onMouseDown={handleMouseDown}
          onDoubleClick={() => setWidth(DEFAULT_WIDTH)}
          className={cn(
            "absolute top-0 -right-1 w-2.5 h-full cursor-col-resize z-40 select-none",
            "hover:bg-blue-500/25 active:bg-blue-500/40 transition-colors group flex items-center justify-center",
            isDragging && "bg-blue-500/35"
          )}
        >
          <div
            className={cn(
              "w-0.5 h-8 rounded-full bg-[var(--border)] group-hover:bg-blue-400 group-hover:h-12 transition-all opacity-40 group-hover:opacity-100",
              isDragging && "bg-blue-400 h-16 opacity-100 ring-2 ring-blue-500/30"
            )}
          />
        </div>
      )}
    </aside>
  );
}

export function Sidebar() {
  return (
    <Suspense
      fallback={
        <aside
          className="hidden lg:flex flex-col h-dvh sticky top-0 border-r w-[285px] bg-[var(--surface-1)] border-[var(--border)]"
          aria-hidden="true"
        />
      }
    >
      <SidebarInner />
    </Suspense>
  );
}
