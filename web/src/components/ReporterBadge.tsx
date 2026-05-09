import type { Reporter } from "@/lib/types";

export function ReporterBadge({ reporter }: { reporter: Reporter }) {
  const initials = reporter.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <article className="reporter-badge">
      <span className="avatar" style={{ backgroundColor: reporter.color }}>
        {initials}
      </span>
      <div>
        <strong>{reporter.name}</strong>
        <span>{reporter.tagline}</span>
      </div>
    </article>
  );
}
