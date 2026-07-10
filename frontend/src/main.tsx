import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@/index.css";
import { ClerkProvider } from "@clerk/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { clerkAppearance } from "@/shared/lib/clerk-appearance";
import { queryClient } from "@/shared/lib/query-client";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "";

if (!CLERK_KEY) {
  throw new Error(
    "Missing VITE_CLERK_PUBLISHABLE_KEY — set it in your environment before building/running the frontend.",
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={CLERK_KEY} appearance={clerkAppearance}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>
);
