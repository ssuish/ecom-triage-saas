import type { ReactNode } from "react";
import { SkipLink } from "@/shared/components/SkipLink";
import { MarketingHeader } from "@/shared/components/MarketingHeader";

interface MarketingPageChromeProps {
  children: ReactNode;
  backTo?: string;
  backLabel?: string;
  showFooter?: boolean;
  mainClassName?: string;
}

export function MarketingPageChrome({
  children,
  backTo,
  backLabel,
  showFooter = true,
  mainClassName,
}: MarketingPageChromeProps) {
  return (
    <div className="marketing-shell page-shell">
      <div className="grain-overlay" aria-hidden="true" />
      <SkipLink />
      <MarketingHeader variant="slim" backTo={backTo} backLabel={backLabel} />
      <main id="main-content" className={mainClassName}>
        {children}
      </main>
      {showFooter ? (
        <footer className="marketing-footer">
          <div className="page-container type-small text-ink-faint">
            <p>Privacy — coming soon · Terms — coming soon</p>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
