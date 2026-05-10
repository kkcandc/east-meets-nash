import Link from "next/link";
import { SubscribeForm } from "@/components/SubscribeForm";

export function ConversionBar() {
  return (
    <section className="conversion-bar" id="join" aria-label="Join East Meets Nash">
      <div>
        <p className="eyebrow">Free Morning Brief</p>
        <strong>Get the East Nashville briefing before the group chat starts yelling.</strong>
        <span>Daily email now. Account perks, classifieds, credits, and comments next.</span>
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
