import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FreeKundliCalculator from "../pages/FreeKundliCalculator";
import { KundliCalculator } from "../components/KundliCalculator";
import { TooltipProvider } from "@/components/ui/tooltip";

describe("FreeKundliCalculator Rendering", () => {
  it("renders FreeKundliCalculator without crashing", () => {
    const queryClient = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <FreeKundliCalculator />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );

    expect(container).toBeTruthy();
    expect(container.innerHTML).toContain("Janam");
  });

  it("renders KundliCalculator form component without crashing", () => {
    const queryClient = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <KundliCalculator />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );

    expect(container).toBeTruthy();
    expect(container.innerHTML).toContain("Kundli Calculator");
  });
});
