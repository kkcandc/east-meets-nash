"use client";

import { useEffect, useMemo, useState } from "react";

const accountSessionKey = "east-meets-nash:account-session";
const storyReactionKey = "east-meets-nash:story-reactions";

interface ReactionPanelProps {
  reactions: Record<string, number>;
  storyId: string;
}

function formatReactionLabel(name: string) {
  if (name === "Love") return "❤️";
  if (name === "Side-Eye") return "👀";
  return name;
}

function readReactionStore(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(storyReactionKey) || "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

export function ReactionPanel({ reactions, storyId }: ReactionPanelProps) {
  const [hydrated, setHydrated] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const sessionActive = localStorage.getItem(accountSessionKey) === "true";
    const storedReaction = readReactionStore()[storyId] || null;
    setLoggedIn(sessionActive);
    setSelected(storedReaction);
    setHydrated(true);
  }, [storyId]);

  const reactionEntries = useMemo(
    () =>
      Object.entries(reactions).map(([name, count]) => ({
        count: count + (selected === name ? 1 : 0),
        name,
      })),
    [reactions, selected],
  );

  function handleLogin() {
    localStorage.setItem(accountSessionKey, "true");
    setLoggedIn(true);
  }

  function handleReaction(name: string) {
    if (!loggedIn) {
      return;
    }

    if (selected === name) {
      return;
    }

    const store = readReactionStore();
    store[storyId] = name;
    localStorage.setItem(storyReactionKey, JSON.stringify(store));
    setSelected(name);
  }

  return (
    <section className="rail-card reaction-card">
      <p className="eyebrow">React</p>
      <div className="reaction-row" aria-label="Story reactions">
        {reactionEntries.map(({ name, count }) => (
          <button
            aria-pressed={selected === name}
            className={`reaction-button${selected === name ? " selected" : ""}`}
            disabled={!hydrated}
            key={name}
            onClick={() => handleReaction(name)}
            type="button"
          >
            {formatReactionLabel(name)} <strong>{count}</strong>
          </button>
        ))}
      </div>
      {hydrated && !loggedIn ? (
        <button className="reaction-login-button" onClick={handleLogin} type="button">
          Login
        </button>
      ) : null}
    </section>
  );
}
