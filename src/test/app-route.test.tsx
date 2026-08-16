import { describe, it, expect, beforeAll } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import App from "../App";

beforeAll(() => {
  window.scrollTo = () => {};
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

describe("Full App Route Rendering", () => {
  it("renders /free-kundli without crashing", () => {
    window.history.pushState({}, "Free Kundli", "/free-kundli");
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it("renders / without crashing", () => {
    window.history.pushState({}, "Home", "/");
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
