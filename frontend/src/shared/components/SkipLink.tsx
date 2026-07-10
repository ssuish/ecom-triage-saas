interface SkipLinkProps {
  target?: string;
}

export function SkipLink({ target = "#main-content" }: SkipLinkProps) {
  return (
    <a href={target} className="sr-only focus-visible:not-sr-only">
      Skip to main content
    </a>
  );
}
