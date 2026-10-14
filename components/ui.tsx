import type { ReactNode } from "react";

/** Scoreboard-style section marker: amber dot-matrix number + label + hairline. */
export function SectionHead({ n, label, className = "" }: { n: string; label: string; className?: string }) {
  return (
    <div className={`fade-up flex items-end gap-4 ${className}`}>
      <span className="scoreboard scoreboard-dots tabular text-[3.25rem] md:text-[4.5rem]" aria-hidden="true">
        {n}
      </span>
      <span className="label pb-2 text-mute">{label}</span>
      <span className="hairline mb-3 flex-1" aria-hidden="true" />
    </div>
  );
}

/** Renders text, turning any [[PLACEHOLDER]] into a loud dashed chip. */
export function Txt({ children }: { children: string }) {
  const parts = children.split(/(\[\[[^\]]+\]\])/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("[[") ? (
          <span key={i} className="placeholder-chip">{p}</span>
        ) : (
          p
        ),
      )}
    </>
  );
}

/** Multi-line display headline revealed line by line from below. */
export function MaskedHeadline({
  lines,
  as: Tag = "h2",
  className = "",
}: {
  lines: readonly string[];
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <Tag className={`reveal-up display ${className}`}>
      {lines.map((l, i) => (
        <span key={i} className="mask-line">
          <span>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

export function ArrowLink({ children }: { children: ReactNode }) {
  return (
    <span className="group inline-flex items-center gap-3">
      <span className="u-link">{children}</span>
      <svg width="22" height="10" viewBox="0 0 22 10" fill="none" aria-hidden="true" className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">
        <path d="M0 5h20M16 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </span>
  );
}
