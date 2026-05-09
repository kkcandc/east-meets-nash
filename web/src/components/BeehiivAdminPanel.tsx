"use client";

import { useEffect, useState } from "react";

interface StatusResponse {
  mode: string;
  config: {
    configured: boolean;
    hasApiKey: boolean;
    hasPublicationId: boolean;
    publicationId?: string;
    publicationUrl?: string;
    postStatus: string;
    sendWelcomeEmail: boolean;
  };
  publication?: {
    id: string;
    name: string;
  };
  publications?: Array<{
    id: string;
    name: string;
  }>;
  note?: string;
  error?: string;
}

export function BeehiivAdminPanel() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [message, setMessage] = useState("Checking beehiiv...");
  const [creating, setCreating] = useState(false);

  async function loadStatus() {
    const response = await fetch("/api/beehiiv/status");
    const data = (await response.json()) as StatusResponse;
    setStatus(data);
    setMessage(data.error || data.note || (data.config?.configured ? "beehiiv is configured." : "beehiiv is in mock mode."));
  }

  async function createDraft() {
    setCreating(true);
    setMessage("Creating beehiiv draft...");
    const response = await fetch("/api/beehiiv/create-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyCount: 5, status: "draft" }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string; mode?: string; post?: { id?: string } };
    setCreating(false);
    if (!response.ok) {
      setMessage(data.error || "Could not create beehiiv draft.");
      return;
    }
    setMessage(data.mode === "mock" ? "Mock draft generated. Add credentials for live beehiiv." : `beehiiv draft created: ${data.post?.id}`);
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  return (
    <section className="desk-panel">
      <p className="eyebrow">beehiiv</p>
      <h2>Integration Status</h2>
      <p>{message}</p>
      {status ? (
        <dl>
          <div>
            <dt>Mode</dt>
            <dd>{status.mode}</dd>
          </div>
          <div>
            <dt>API key</dt>
            <dd>{status.config.hasApiKey ? "present" : "missing"}</dd>
          </div>
          <div>
            <dt>Publication</dt>
            <dd>{status.publication?.name || status.config.publicationId || "missing"}</dd>
          </div>
          <div>
            <dt>Post status</dt>
            <dd>{status.config.postStatus}</dd>
          </div>
        </dl>
      ) : null}
      {status?.publications?.length ? (
        <div className="mini-list">
          <strong>Available publications</strong>
          {status.publications.map((publication) => (
            <span key={publication.id}>
              {publication.name}: {publication.id}
            </span>
          ))}
        </div>
      ) : null}
      <div className="button-row">
        <button type="button" onClick={loadStatus}>
          Refresh Status
        </button>
        <button type="button" onClick={createDraft} disabled={creating}>
          Create Draft Post
        </button>
      </div>
    </section>
  );
}
