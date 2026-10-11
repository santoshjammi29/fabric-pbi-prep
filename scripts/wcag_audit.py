#!/usr/bin/env python3
"""
WCAG 2.1 AA Programmatic Contrast Verification Engine.
Audits all 4 theme variants (Dark, Light, Grey, E-Ink) for contrast compliance (minimum 4.5:1 for normal text).
"""
import re
import sys

def parse_rgb(color_str):
    color_str = color_str.strip()
    if color_str.startswith("#"):
        hex_val = color_str.lstrip("#")
        if len(hex_val) == 3:
            hex_val = "".join([c*2 for c in hex_val])
        return tuple(int(hex_val[i:i+2], 16) / 255.0 for i in (0, 2, 4))
    m = re.match(r"rgba?\((\d+),\s*(\d+),\s*(\d+)", color_str)
    if m:
        return tuple(int(m.group(i)) / 255.0 for i in (1, 2, 3))
    return None

def srgb_to_linear(c):
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

def relative_luminance(rgb):
    r, g, b = [srgb_to_linear(c) for c in rgb]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast_ratio(color1, color2):
    rgb1 = parse_rgb(color1)
    rgb2 = parse_rgb(color2)
    if not rgb1 or not rgb2:
        return 0.0
    l1 = relative_luminance(rgb1)
    l2 = relative_luminance(rgb2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

# Color palettes extracted from globals.css
THEMES = {
    "Dark Theme (Default)": {
        "background": "#0A0A0B",
        "foreground": "#f0f0f5",
        "card": "#161618",
        "card_foreground": "#f0f0f5",
        "muted_foreground": "#9da4b4", # adjusted for high contrast
        "accent": "#3B82F6",
    },
    "Light Theme": {
        "background": "#f8f8fc",
        "foreground": "#1a1a2e",
        "card": "#ffffff",
        "card_foreground": "#1a1a2e",
        "muted_foreground": "#596172", # adjusted for AA 4.5:1
        "accent": "#7c3aed",
    },
    "Grey Theme (Graphite)": {
        "background": "#18191c",
        "foreground": "#e4e4e9",
        "card": "#202227",
        "card_foreground": "#e4e4e9",
        "muted_foreground": "#9ca3af",
        "accent": "#38bdf8",
    },
    "E-Ink Theme (Paper)": {
        "background": "#f7f6f2",
        "foreground": "#111111",
        "card": "#ffffff",
        "card_foreground": "#111111",
        "muted_foreground": "#555555",
        "accent": "#222222",
    },
}

def run_wcag_audit():
    print("=" * 65)
    print(" WCAG 2.1 AA PROGRAMMATIC CONTRAST AUDIT (4.5:1 NORMAL TEXT)")
    print("=" * 65)
    
    all_passed = True
    results = []

    for theme_name, tokens in THEMES.items():
        print(f"\nAUDITING: {theme_name}")
        bg = tokens["background"]
        card = tokens["card"]
        
        checks = [
            ("Foreground on Background", tokens["foreground"], bg, 4.5),
            ("Card Foreground on Card", tokens["card_foreground"], card, 4.5),
            ("Muted Text on Background", tokens["muted_foreground"], bg, 4.5),
            ("Muted Text on Card", tokens["muted_foreground"], card, 4.5),
        ]
        
        for label, fg_color, bg_color, req in checks:
            ratio = contrast_ratio(fg_color, bg_color)
            passed = ratio >= req
            status = "PASS" if passed else "FAIL"
            if not passed:
                all_passed = False
            print(f"  [{status}] {label:28} Ratio: {ratio:5.2f}:1 (Target: {req}:1) - {fg_color} on {bg_color}")
            results.append({
                "theme": theme_name,
                "check": label,
                "ratio": ratio,
                "passed": passed
            })

    print("\n" + "=" * 65)
    if all_passed:
        print("✓ ALL THEME VARIANTS PASS WCAG 2.1 AA ACCESSIBILITY CRITERIA")
    else:
        print("❌ SOME CONTRAST CHECKS FAILED - AUTO-CORRECTION REQUIRED")
    print("=" * 65)
    return all_passed

if __name__ == "__main__":
    success = run_wcag_audit()
    sys.exit(0 if success else 1)
