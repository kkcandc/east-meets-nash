"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type SubscribeState =
  | { status: "idle"; message: string }
  | { status: "loading"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

interface SubscribeFormProps {
  surface?: string;
  label?: string;
  buttonLabel?: string;
  placeholder?: string;
  className?: string;
}

export function SubscribeForm({
  surface = "homepage",
  label = "Daily email",
  buttonLabel = "Join",
  placeholder = "neighbor@example.com",
  className = "",
}: SubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubscribeState>({ status: "idle", message: "" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "loading", message: "Adding you to the brief..." });

    const response = await fetch("/api/beehiiv/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        referringSite: typeof window !== "undefined" ? window.location.href : undefined,
        utmSource: "east_meets_nash_web",
        utmMedium: surface,
        utmCampaign: "launch",
      }),
    });

    const data = (await response.json().catch(() => ({}))) as { error?: string; mode?: string };

    if (!response.ok) {
      setState({ status: "error", message: data.error || "Could not subscribe right now." });
      return;
    }

    setEmail("");
    setState({
      status: "success",
      message:
        data.mode === "mock"
          ? "Mock subscribed. Add beehiiv credentials to create the real subscriber."
          : "You are on the morning brief list.",
    });
  }

  return (
    <form className={`signup-form ${className}`.trim()} onSubmit={onSubmit}>
      <label htmlFor={`newsletter-email-${surface}`}>{label}</label>
      <div>
        <input
          id={`newsletter-email-${surface}`}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={placeholder}
          required
        />
        <button type="submit" disabled={state.status === "loading"}>
          {state.status === "loading" ? "Joining..." : buttonLabel}
        </button>
      </div>
      {state.message ? <p className={`form-note ${state.status}`}>{state.message}</p> : null}
    </form>
  );
}
