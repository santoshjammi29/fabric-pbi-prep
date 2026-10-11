import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  THEME_OPTIONS,
  ThemeSwitcher,
  ThemeSegmentedPills,
  ThemeCycleButton,
} from "@/components/ui/theme-switcher";

// Mock next-themes
const mockSetTheme = vi.fn();
let currentTheme = "dark";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: currentTheme,
    setTheme: mockSetTheme,
    themes: ["dark", "light", "grey", "e-ink"],
  }),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe("Theme System & Switcher Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentTheme = "dark";
  });

  describe("THEME_OPTIONS definitions", () => {
    it("defines exactly 4 themes: dark, light, grey, e-ink", () => {
      const ids = THEME_OPTIONS.map((t) => t.id);
      expect(ids).toEqual(["dark", "light", "grey", "e-ink"]);
    });

    it("has required metadata for each theme", () => {
      THEME_OPTIONS.forEach((opt) => {
        expect(opt.id).toBeTruthy();
        expect(opt.label).toBeTruthy();
        expect(opt.tagline).toBeTruthy();
        expect(opt.dotColor).toBeTruthy();
        expect(opt.badge).toBeTruthy();
        expect(opt.icon).toBeDefined();
      });
    });

    it("includes Grey and E-Ink Reader specifically", () => {
      const grey = THEME_OPTIONS.find((t) => t.id === "grey");
      expect(grey).toBeDefined();
      expect(grey?.label).toBe("Grey");
      expect(grey?.badge).toBe("Balanced");

      const eink = THEME_OPTIONS.find((t) => t.id === "e-ink");
      expect(eink).toBeDefined();
      expect(eink?.label).toBe("E-Ink Reader");
      expect(eink?.badge).toBe("Eye Care");
    });
  });

  describe("ThemeSwitcher (Dropdown / Popover)", () => {
    it("renders trigger button with current theme label", () => {
      render(<ThemeSwitcher />);
      expect(screen.getByRole("button", { name: /current theme/i })).toBeDefined();
      expect(screen.getByText("Dark Theme")).toBeDefined();
    });

    it("opens menu when trigger is clicked and displays all 4 themes", () => {
      render(<ThemeSwitcher />);
      const trigger = screen.getByRole("button", { name: /current theme/i });
      fireEvent.click(trigger);

      expect(screen.getByRole("listbox")).toBeDefined();
      expect(screen.getByText("E-Ink Reader")).toBeDefined();
      expect(screen.getByText("Grey")).toBeDefined();
      expect(screen.getByText("Dark")).toBeDefined();
      expect(screen.getByText("Light")).toBeDefined();
    });

    it("calls setTheme with 'grey' when Grey theme option is selected", () => {
      render(<ThemeSwitcher />);
      const trigger = screen.getByRole("button", { name: /current theme/i });
      fireEvent.click(trigger);

      const greyOption = screen.getByRole("option", { name: /grey/i });
      fireEvent.click(greyOption);

      expect(mockSetTheme).toHaveBeenCalledWith("grey");
    });

    it("calls setTheme with 'e-ink' when E-Ink Reader option is selected", () => {
      render(<ThemeSwitcher />);
      const trigger = screen.getByRole("button", { name: /current theme/i });
      fireEvent.click(trigger);

      const einkOption = screen.getByRole("option", { name: /e-ink reader/i });
      fireEvent.click(einkOption);

      expect(mockSetTheme).toHaveBeenCalledWith("e-ink");
    });
  });

  describe("ThemeSegmentedPills (Mobile Drawer 4-way selector)", () => {
    it("renders all 4 theme radio options", () => {
      render(<ThemeSegmentedPills />);
      const radios = screen.getAllByRole("radio");
      expect(radios.length).toBe(4);
      expect(screen.getByRole("radio", { name: /grey/i })).toBeDefined();
      expect(screen.getByRole("radio", { name: /e-ink reader/i })).toBeDefined();
    });

    it("calls setTheme when clicking on a segmented pill", () => {
      render(<ThemeSegmentedPills />);
      const einkPill = screen.getByRole("radio", { name: /e-ink reader/i });
      fireEvent.click(einkPill);
      expect(mockSetTheme).toHaveBeenCalledWith("e-ink");

      const greyPill = screen.getByRole("radio", { name: /grey/i });
      fireEvent.click(greyPill);
      expect(mockSetTheme).toHaveBeenCalledWith("grey");
    });
  });

  describe("ThemeCycleButton (1-tap Mobile Header Cycle)", () => {
    it("cycles through dark -> light -> grey -> e-ink -> dark", () => {
      currentTheme = "dark";
      const { rerender } = render(<ThemeCycleButton />);
      const button = screen.getByRole("button", { name: /cycle to next theme/i });

      // dark -> light
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith("light");

      // light -> grey
      currentTheme = "light";
      rerender(<ThemeCycleButton />);
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith("grey");

      // grey -> e-ink
      currentTheme = "grey";
      rerender(<ThemeCycleButton />);
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith("e-ink");

      // e-ink -> dark
      currentTheme = "e-ink";
      rerender(<ThemeCycleButton />);
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith("dark");
    });
  });
});
