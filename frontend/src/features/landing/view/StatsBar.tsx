import { SectionReveal } from "./SectionReveal";

const STATS = [
  { label: "Triage speed", value: "Under 2 seconds" },
  { label: "Per ticket", value: "Category · priority · draft reply" },
  { label: "Customer experience", value: "No account required" },
  { label: "Status tracking", value: "Magic link by email" },
] as const;

export function StatsBar() {
  return (
    <section className="stats-bar" aria-label="Product facts">
      <div className="page-container">
        <SectionReveal staggerChildren>
          <ul className="stats-bar__list">
            {STATS.map(({ label, value }) => (
              <li key={label} data-reveal className="stats-bar__item">
                <span className="stats-bar__value type-mono">{value}</span>
                <span className="stats-bar__label eyebrow">{label}</span>
              </li>
            ))}
          </ul>
        </SectionReveal>
      </div>
    </section>
  );
}
