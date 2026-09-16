import "@testing-library/jest-dom";

// Browser-only shim. Server-side tests (e.g. PDF processing) opt into the node
// environment with `// @vitest-environment node`, where there is no window.
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });
}
