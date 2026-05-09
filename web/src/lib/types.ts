export type ConfidenceLabel =
  | "Confirmed"
  | "Reported"
  | "Group Chat Says"
  | "Seen in the Wild"
  | "Allegedly"
  | "Tip Line"
  | "Correction"
  | "Seed Item";

export interface SourceLink {
  name: string;
  url: string;
  type: string;
}

export interface Reporter {
  id: string;
  name: string;
  beat: string;
  tagline: string;
  look: string;
  voice: string;
  color: string;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  deck: string;
  body: string;
  zone: string;
  beat: string;
  label: ConfidenceLabel;
  confidence: string;
  reporterId: string;
  time: string;
  priority: number;
  imageStyle: string;
  sources: SourceLink[];
  reactions: Record<string, number>;
  comments: Array<{ author: string; text: string }>;
  social: {
    x: string;
    instagram: string;
    video: string;
  };
}

export interface SourceItem {
  id: string;
  title: string;
  source: string;
  url: string;
  zone: string;
  beat: string;
  confidence: string;
  risk: "Low" | "Medium" | "High";
  score: number;
  status: string;
  suggestedReporter: string;
  suggestedLabel: ConfidenceLabel;
  suggestedAngle: string;
  publishFormat: string;
}

export interface SponsorProduct {
  id: string;
  name: string;
  price: number;
  inventory: number;
  deliverables: string[];
  checkoutCopy: string;
}

export interface LaunchIssueSlot {
  id: string;
  name: string;
  description: string;
  status: "Ready" | "Needs source" | "Sponsor open" | "Drafting";
  storyId?: string;
  sourceItemId?: string;
  sponsorProductId?: string;
  note: string;
}

export interface LaunchTask {
  id: string;
  title: string;
  owner: string;
  status: "Ready" | "Blocked" | "Next" | "Live";
  detail: string;
}

export interface DraftInput {
  title: string;
  deck: string;
  zone: string;
  beat: string;
  confidence: ConfidenceLabel;
  sourceUrl?: string;
  body: string;
}

export interface LocalDraft extends DraftInput {
  id: string;
  createdAt: string;
  status: "draft" | "ready" | "published";
}
