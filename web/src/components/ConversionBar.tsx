"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SubscribeForm } from "@/components/SubscribeForm";

export function ConversionBar() {
  const pathname = usePathname();
  const isStory = pathname?.startsWith("/story/");
  const isCompact = Boolean(pathname && pathname !== "/");

  return (
    <section
      className={`conversion-bar ${isCompact ? "compact-conversion-bar" : ""} ${isStory ? "story-conversion-bar" : ""}`.trim()}
      id="join"
      aria-label="Join East Meets Nash"
    >
      <div>
        <p className="eyebrow">Free Morning Brief</p>
        <strong>
          {isStory
            ? "Get tomorrow's East Nashville brief."
            : isCompact
              ? "Get the East Nashville morning brief."
              : "Get the East Nashville briefing before the group chat starts yelling."}
        </strong>
        <span>
          {isStory
            ? "The useful, weird, civic, and worth-forwarding stuff."
            : isCompact
              ? "One fast email with the useful stuff."
            : "Daily email now. Account perks, classifieds, credits, and comments next."}
        </span>
      </div>
      <SubscribeForm
        surface="global_conversion_bar"
        label="Email"
        buttonLabel="Join free"
        placeholder="you@example.com"
        className="compact-signup-form"
      />
      <Link className="conversion-login-link" href="/feed">
        Create account
      </Link>
    </section>
  );
}
