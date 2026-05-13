import type { Reporter } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export function ReporterAvatar({ reporter, large = false }: { reporter: Reporter; large?: boolean }) {
  const className = `${large ? "reporter-avatar-large" : "avatar"}${reporter.photoUrl ? " has-photo" : ""}`;

  return (
    <span className={className} style={{ backgroundColor: reporter.color }}>
      {reporter.photoUrl ? (
        <img src={reporter.photoUrl} alt={reporter.photoAlt || `${reporter.name} portrait`} />
      ) : (
        initials(reporter.name)
      )}
    </span>
  );
}
