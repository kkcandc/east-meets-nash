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
  photoUrl?: string;
  photoAlt?: string;
  bio: string;
  backstory: string;
  homeBase: string;
  signatureColumn: string;
  defaultAngle: string;
  knownFor: string;
  favoriteComplaint: string;
  sourceDiet: string[];
  obsessions: string[];
  coverageNotes: string[];
  contactPrompt: string;
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
  heroImage?: string;
  heroAlt?: string;
  factBox?: Array<{ label: string; value: string }>;
  media?: Array<{
    label: string;
    title: string;
    description: string;
    url?: string;
    imageUrl?: string;
    imageAlt?: string;
    embedUrl?: string;
    credit?: string;
    provider?: string;
    sourceType?: string;
    sourceUrl?: string;
    license?: string;
    licenseUrl?: string;
    rightsNote?: string;
    placeId?: string;
    placeQuery?: string;
    relevance?: "exact" | "strong" | "contextual" | "receipt" | "fallback";
    relevanceScore?: number;
    approvalStatus?: "approved" | "needs_review" | "fallback" | "rejected";
    approvedBy?: string;
    approvedAt?: string;
    photoUnavailableReason?: string;
  }>;
  photoStatus?: "exact_photo_approved" | "contextual_photo_needs_upgrade" | "sensitive_map_only";
  photoNeeds?: string[];
  photoUnavailableReason?: string;
  sourceNote?: string;
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
  automation?: string;
  cadence?: string;
  verificationRule?: string;
  suggestedReporter: string;
  suggestedLabel: ConfidenceLabel;
  suggestedAngle: string;
  publishFormat: string;
}

export interface SourceStream {
  id: string;
  name: string;
  type: string;
  tier: "Anchor" | "Daily" | "Weekly" | "Later";
  status: string;
  url: string;
  cadence: string;
  zones: string[];
  beats: string[];
  automation: string;
  publishUse: string;
  caveat: string;
  nextStep: string;
}

export interface SourceAccessPlan {
  id: string;
  name: string;
  priority: string;
  status: string;
  accessMode: string;
  automationReadiness: string;
  sourceLabel: ConfidenceLabel;
  risk: "Low" | "Medium" | "High";
  currentReality: string;
  whatWeCanDoNow: string[];
  whatNeeds: string[];
  privateRules: string[];
  firstWorkflow: string;
  publishUse: string;
}

export interface DailySourceStage {
  time: string;
  name: string;
  goal: string;
  sourceIds: string[];
  output: string;
}

export interface DailyPublishQueueItem {
  sourceId: string;
  slot: string;
  decision: string;
  why: string;
}

export interface DailyAccessNeed {
  name: string;
  status: string;
  today: string;
  guardrail: string;
}

export interface DailySourcePass {
  date: string;
  title: string;
  summary: string;
  stages: DailySourceStage[];
  publishQueue: DailyPublishQueueItem[];
  accessNeeds: DailyAccessNeed[];
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
  sourceNote?: string;
  verificationNote?: string;
  internalNote?: string;
  risk?: "Low" | "Medium" | "High";
  visualTitle?: string;
  visualSummary?: string;
  visualItems?: string[];
  body: string;
}

export interface LocalDraft extends DraftInput {
  id: string;
  createdAt: string;
  status: "draft" | "ready" | "published";
}
