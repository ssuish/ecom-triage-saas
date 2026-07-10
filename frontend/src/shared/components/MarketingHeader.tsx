import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/shared/components/ui/button";

export const MARKETING_NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#for-operators", label: "For operators" },
  { href: "#roadmap", label: "Roadmap" },
  { href: "#feedback", label: "Feedback" },
] as const;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface MarketingHeaderProps {
  variant?: "landing" | "slim";
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
}

export function MarketingHeader({
  variant = "landing",
  backTo,
  backLabel,
  actions,
}: MarketingHeaderProps) {
  const isLanding = variant === "landing";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const trigger = triggerRef.current;

    const focusableElements = (): HTMLElement[] =>
      overlayRef.current
        ? Array.from(overlayRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        : [];

    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }
      if (event.key === "Tab") {
        const items = focusableElements();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement as HTMLElement | null;
        const withinOverlay = overlayRef.current?.contains(active) ?? false;
        if (event.shiftKey) {
          if (active === first || !withinOverlay) {
            event.preventDefault();
            last.focus();
          }
        } else if (active === last || !withinOverlay) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");

    const onViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) closeMenu();
    };

    if (desktopQuery.matches) closeMenu();

    desktopQuery.addEventListener("change", onViewportChange);
    return () => desktopQuery.removeEventListener("change", onViewportChange);
  }, [closeMenu]);

  return (
    <div className="marketing-header-group">
      <header className="marketing-header">
        <div className="page-container marketing-header__inner">
          <Link
            to="/"
            aria-label="Triage home"
            className="marketing-header__wordmark"
            translate="no"
          >
            Triage
          </Link>

          {isLanding ? (
            <>
              <nav aria-label="Primary" className="marketing-header__desktop-nav">
                {MARKETING_NAV_LINKS.map(({ href, label }) => (
                  <a key={href} href={href} className="marketing-nav-link">
                    {label}
                  </a>
                ))}
                <Link to="/submit" className="marketing-nav-link">
                  Preview submit
                </Link>
              </nav>
              {actions ? (
                <div className="marketing-header__actions marketing-header__actions--desktop">
                  {actions}
                </div>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                ref={triggerRef}
                className="marketing-header__menu-btn md:hidden"
                aria-expanded={menuOpen}
                aria-controls={menuId}
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
                <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
              </Button>
            </>
          ) : backLabel && backTo ? (
            <Link to={backTo} className="marketing-nav-link marketing-nav-link--back">
              <span className="marketing-nav-link__short">Back</span>
              <span className="marketing-nav-link__full">{backLabel}</span>
            </Link>
          ) : null}
        </div>
      </header>

      {isLanding && menuOpen ? (
        <div
          ref={overlayRef}
          className="marketing-menu-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className="marketing-menu-overlay__header">
            <p className="marketing-header__wordmark" translate="no">
              Triage
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              ref={closeRef}
              className="marketing-header__menu-btn marketing-header__menu-btn--overlay"
              onClick={closeMenu}
            >
              <X aria-hidden="true" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>

          <nav id={menuId} aria-label="Section links" className="marketing-menu-overlay__nav">
            {MARKETING_NAV_LINKS.map(({ href, label }) => (
              <a key={href} href={href} className="marketing-menu-link" onClick={closeMenu}>
                {label}
              </a>
            ))}
            <Link to="/submit" className="marketing-menu-link" onClick={closeMenu}>
              Preview submit flow
            </Link>
          </nav>

          {actions ? <div className="marketing-menu-overlay__actions">{actions}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
