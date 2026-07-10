import { Show, SignIn } from "@clerk/react";
import { createFileRoute } from "@tanstack/react-router";
import { OperatorConsole, defaultOperatorSearch, validateOperatorSearch } from "@/features/operator";
import { SkipLink } from "@/shared/components/SkipLink";
import { clerkAppearance } from "@/shared/lib/clerk-appearance";

export { defaultOperatorSearch, validateOperatorSearch };

export const Route = createFileRoute("/operator")({
  validateSearch: validateOperatorSearch,
  component: OperatorRoute,
});

function OperatorRoute() {
  return (
    <div className="page-shell bg-canvas">
      <SkipLink />
      <Show when="signed-out">
        <main
          id="main-content"
          className="density-compact page-container flex min-h-[50vh] items-center justify-center py-10"
        >
          <SignIn routing="hash" appearance={clerkAppearance} />
        </main>
      </Show>
      <Show when="signed-in">
        <OperatorConsole />
      </Show>
    </div>
  );
}
