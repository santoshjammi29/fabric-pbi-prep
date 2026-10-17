import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  TextSizeProvider,
  useTextSize,
  TEXT_SIZE_OPTIONS,
} from "@/components/providers/text-size-provider";
import {
  TextSizeController,
  TextSizeSegmentedPills,
  TextSizeQuickToggle,
} from "@/components/ui/text-size-controller";

// Helper test consumer
function TestConsumer() {
  const {
    textSize,
    currentOption,
    setTextSize,
    increaseTextSize,
    decreaseTextSize,
    resetTextSize,
    canIncrease,
    canDecrease,
  } = useTextSize();

  return (
    <div>
      <span data-testid="current-size">{textSize}</span>
      <span data-testid="current-percent">{currentOption.scaleLabel}</span>
      <span data-testid="can-increase">{String(canIncrease)}</span>
      <span data-testid="can-decrease">{String(canDecrease)}</span>
      <button onClick={() => setTextSize("lg", false)}>Set Large</button>
      <button onClick={() => increaseTextSize(false)}>Increase</button>
      <button onClick={() => decreaseTextSize(false)}>Decrease</button>
      <button onClick={() => resetTextSize(false)}>Reset</button>
    </div>
  );
}

describe("Text Size System", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.style.removeProperty("--text-scale");
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.style.removeProperty("--text-scale");
  });

  it("initializes with default 'base' (100%) and updates DOM", () => {
    render(
      <TextSizeProvider>
        <TestConsumer />
      </TextSizeProvider>
    );

    expect(screen.getByTestId("current-size").textContent).toBe("base");
    expect(screen.getByTestId("current-percent").textContent).toBe("100%");
    expect(document.documentElement.classList.contains("text-size-base")).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--text-scale")).toBe("100%");
  });

  it("restores previously saved size from localStorage", () => {
    localStorage.setItem("fabric_text_size", "xl");

    render(
      <TextSizeProvider>
        <TestConsumer />
      </TextSizeProvider>
    );

    expect(screen.getByTestId("current-size").textContent).toBe("xl");
    expect(screen.getByTestId("current-percent").textContent).toBe("120%");
    expect(document.documentElement.classList.contains("text-size-xl")).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--text-scale")).toBe("120%");
  });

  it("changes size directly with setTextSize", () => {
    render(
      <TextSizeProvider>
        <TestConsumer />
      </TextSizeProvider>
    );

    fireEvent.click(screen.getByText("Set Large"));

    expect(screen.getByTestId("current-size").textContent).toBe("lg");
    expect(screen.getByTestId("current-percent").textContent).toBe("110%");
    expect(document.documentElement.classList.contains("text-size-lg")).toBe(true);
    expect(document.documentElement.classList.contains("text-size-base")).toBe(false);
    expect(localStorage.getItem("fabric_text_size")).toBe("lg");
  });

  it("increases text size sequentially up to maximum (160%)", () => {
    render(
      <TextSizeProvider>
        <TestConsumer />
      </TextSizeProvider>
    );

    // Initial: base (100%)
    expect(screen.getByTestId("current-size").textContent).toBe("base");

    // base -> lg (110%)
    fireEvent.click(screen.getByText("Increase"));
    expect(screen.getByTestId("current-size").textContent).toBe("lg");

    // lg -> xl (120%)
    fireEvent.click(screen.getByText("Increase"));
    expect(screen.getByTestId("current-size").textContent).toBe("xl");

    // xl -> 2xl (130%)
    fireEvent.click(screen.getByText("Increase"));
    expect(screen.getByTestId("current-size").textContent).toBe("2xl");

    // 2xl -> 3xl (140%)
    fireEvent.click(screen.getByText("Increase"));
    expect(screen.getByTestId("current-size").textContent).toBe("3xl");

    // 3xl -> 4xl (150%)
    fireEvent.click(screen.getByText("Increase"));
    expect(screen.getByTestId("current-size").textContent).toBe("4xl");

    // 4xl -> 5xl (160%)
    fireEvent.click(screen.getByText("Increase"));
    expect(screen.getByTestId("current-size").textContent).toBe("5xl");
    expect(screen.getByTestId("can-increase").textContent).toBe("false");

    // Attempting to increase past maximum stays at 5xl
    fireEvent.click(screen.getByText("Increase"));
    expect(screen.getByTestId("current-size").textContent).toBe("5xl");
  });

  it("decreases text size sequentially down to minimum (75%)", () => {
    render(
      <TextSizeProvider>
        <TestConsumer />
      </TextSizeProvider>
    );

    // Initial: base (100%)
    expect(screen.getByTestId("current-size").textContent).toBe("base");

    // base -> md (95%)
    fireEvent.click(screen.getByText("Decrease"));
    expect(screen.getByTestId("current-size").textContent).toBe("md");

    // md -> sm (90%)
    fireEvent.click(screen.getByText("Decrease"));
    expect(screen.getByTestId("current-size").textContent).toBe("sm");

    // sm -> xs (85%)
    fireEvent.click(screen.getByText("Decrease"));
    expect(screen.getByTestId("current-size").textContent).toBe("xs");

    // xs -> 2xs (80%)
    fireEvent.click(screen.getByText("Decrease"));
    expect(screen.getByTestId("current-size").textContent).toBe("2xs");

    // 2xs -> 3xs (75%)
    fireEvent.click(screen.getByText("Decrease"));
    expect(screen.getByTestId("current-size").textContent).toBe("3xs");
    expect(screen.getByTestId("can-decrease").textContent).toBe("false");

    // Attempting to decrease past minimum stays at 3xs
    fireEvent.click(screen.getByText("Decrease"));
    expect(screen.getByTestId("current-size").textContent).toBe("3xs");
  });

  it("resets text size back to default 100%", () => {
    render(
      <TextSizeProvider>
        <TestConsumer />
      </TextSizeProvider>
    );

    fireEvent.click(screen.getByText("Set Large"));
    expect(screen.getByTestId("current-size").textContent).toBe("lg");

    fireEvent.click(screen.getByText("Reset"));
    expect(screen.getByTestId("current-size").textContent).toBe("base");
    expect(screen.getByTestId("current-percent").textContent).toBe("100%");
  });

  it("responds to Alt + Plus, Alt + Minus, and Alt + 0 keyboard shortcuts", () => {
    render(
      <TextSizeProvider>
        <TestConsumer />
      </TextSizeProvider>
    );

    // Alt + Plus -> increase
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "+", altKey: true, bubbles: true })
      );
    });
    expect(screen.getByTestId("current-size").textContent).toBe("lg");

    // Alt + 0 -> reset
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "0", altKey: true, bubbles: true })
      );
    });
    expect(screen.getByTestId("current-size").textContent).toBe("base");

    // Alt + Minus -> decrease
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "-", altKey: true, bubbles: true })
      );
    });
    expect(screen.getByTestId("current-size").textContent).toBe("md");
  });

  it("renders TextSizeController in expanded mode and handles stepper clicks", () => {
    render(
      <TextSizeProvider>
        <TextSizeController collapsed={false} />
      </TextSizeProvider>
    );

    expect(screen.getByText("Text Size")).toBeDefined();
    expect(screen.getByText("100%")).toBeDefined();

    // Click A+ button
    const plusBtn = screen.getByLabelText("Increase text size");
    fireEvent.click(plusBtn);

    expect(screen.getByText("110%")).toBeDefined();

    // Click A- button
    const minusBtn = screen.getByLabelText("Decrease text size");
    fireEvent.click(minusBtn);

    expect(screen.getByText("100%")).toBeDefined();
  });

  it("renders TextSizeSegmentedPills with all scale presets", () => {
    render(
      <TextSizeProvider>
        <TextSizeSegmentedPills />
      </TextSizeProvider>
    );

    TEXT_SIZE_OPTIONS.forEach((opt) => {
      expect(screen.getByRole("radio", { name: new RegExp(opt.scaleLabel) })).toBeDefined();
    });

    // Select 120%
    const btn120 = screen.getByRole("radio", { name: /120%/ });
    fireEvent.click(btn120);

    expect(document.documentElement.classList.contains("text-size-xl")).toBe(true);
  });

  it("renders TextSizeQuickToggle for mobile header", () => {
    render(
      <TextSizeProvider>
        <TextSizeQuickToggle />
      </TextSizeProvider>
    );

    const toggle = screen.getByRole("button", { name: /Current text scale/i });
    expect(toggle).toBeDefined();

    // Open menu
    fireEvent.click(toggle);
    expect(screen.getByText("Text Size")).toBeDefined();
    expect(screen.getByText("Default")).toBeDefined();
  });
});
