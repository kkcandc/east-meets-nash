import type { Reporter } from "@/lib/types";
import { ReporterAvatar } from "@/components/ReporterAvatar";

export function ReporterBadge({ reporter }: { reporter: Reporter }) {
  return (
    <article className="reporter-badge">
      <ReporterAvatar reporter={reporter} />
      <div>
        <strong>{reporter.name}</strong>
        <span>{reporter.tagline}</span>
      </div>
    </article>
  );
}
