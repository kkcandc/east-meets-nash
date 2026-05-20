import type { Story } from "@/lib/types";

export interface StoryCardImage {
  src: string;
  alt: string;
}

const issueCoverPalettes = [
  {
    background: "#f5d35f",
    secondary: "#88b7c9",
    accent: "#ef4d37",
    ink: "#1f1b18",
    paper: "#fffaf0",
  },
  {
    background: "#88b7c9",
    secondary: "#f5d35f",
    accent: "#4d8b57",
    ink: "#1f1b18",
    paper: "#fffaf0",
  },
  {
    background: "#ef4d37",
    secondary: "#f5d35f",
    accent: "#88b7c9",
    ink: "#1f1b18",
    paper: "#fffaf0",
  },
  {
    background: "#4d8b57",
    secondary: "#fffaf0",
    accent: "#f5d35f",
    ink: "#1f1b18",
    paper: "#fffaf0",
  },
];

function hashString(value: string) {
  return Array.from(value).reduce((hash, character) => {
    return (hash * 31 + character.charCodeAt(0)) >>> 0;
  }, 7);
}

function escapeSvg(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function titleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function truncate(value: string, maxLength: number) {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trim()}...`;
}

function coverTitle(story: Story) {
  if (/source[-_\s]?pass/i.test(`${story.id} ${story.slug} ${story.title}`)) return "Daily Source Pass";
  if (/notebook/i.test(story.title)) return "Neighborhood Notebook";
  if (/roundup/i.test(story.title)) return "Local Roundup";
  return `${story.beat} Roundup`;
}

function coverTopics(story: Story) {
  const afterColon = story.title.includes(":") ? story.title.split(":").slice(1).join(":") : "";
  const candidates = afterColon || story.deck;

  return candidates
    .split(/,| and | And |\.|;|:/)
    .map((topic) => titleCase(topic.replace(/\bthe\b/gi, "").trim()))
    .filter((topic) => topic.length >= 3)
    .slice(0, 5)
    .map((topic) => truncate(topic, 20));
}

function issueCoverMedia(story: Story): StoryCardImage | undefined {
  const media = story.media?.find((item) => {
    const label = `${item.label} ${item.title}`;

    return (
      item.imageUrl &&
      (item.provider === "generated_cover" ||
        item.sourceType === "generated_cover" ||
        (item.displayRole === "hero" && /issue cover|source pass cover|roundup cover/i.test(label)))
    );
  });

  if (!media?.imageUrl) return undefined;

  return {
    src: media.imageUrl,
    alt: media.imageAlt || media.title || `Issue cover for ${story.title}`,
  };
}

export function isRoundupStory(story: Story) {
  const marker = `${story.id} ${story.slug} ${story.title}`.toLowerCase();
  return /source[-_\s]?pass|roundup|notebook/.test(marker);
}

export function featuredImage(story: Story): StoryCardImage {
  return {
    src: story.heroImage || `/assets/stories/fallback-${story.imageStyle || "street"}.svg`,
    alt: story.heroAlt || `${story.beat} featured image for ${story.title}`,
  };
}

export function renderIssueCoverSvg(story: Story) {
  const palette = issueCoverPalettes[hashString(story.id) % issueCoverPalettes.length];
  const topics = coverTopics(story);
  const chips = [...topics, story.zone, story.beat].slice(0, 5);
  const chipSvg = chips
    .map((topic, index) => {
      const x = 118 + (index % 3) * 360;
      const y = 500 + Math.floor(index / 3) * 132;
      const fill = index % 2 === 0 ? palette.secondary : palette.accent;
      const textFill = fill === "#4d8b57" || fill === palette.ink ? palette.paper : palette.ink;

      return `
        <g transform="translate(${x} ${y})">
          <rect width="300" height="92" rx="18" fill="${fill}" stroke="${palette.ink}" stroke-width="6"/>
          <circle cx="44" cy="46" r="18" fill="${palette.paper}" stroke="${palette.ink}" stroke-width="5"/>
          <text x="78" y="56" fill="${textFill}" font-family="Arial, sans-serif" font-size="28" font-weight="900">${escapeSvg(
            topic,
          )}</text>
        </g>
      `;
    })
    .join("");
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img" aria-label="${escapeSvg(
      `Issue cover for ${story.title}`,
    )}">
      <rect width="1600" height="900" fill="${palette.background}"/>
      <path d="M0 0H1600V900H0z" fill="none"/>
      <g opacity="0.14" stroke="${palette.ink}" stroke-width="3">
        ${Array.from({ length: 22 }, (_, index) => `<path d="M${index * 78} 0V900"/>`).join("")}
        ${Array.from({ length: 13 }, (_, index) => `<path d="M0 ${index * 78}H1600"/>`).join("")}
      </g>
      <rect x="74" y="82" width="1452" height="736" rx="32" fill="${palette.paper}" stroke="${palette.ink}" stroke-width="12"/>
      <rect x="74" y="82" width="1452" height="130" rx="32" fill="${palette.ink}"/>
      <rect x="74" y="162" width="1452" height="70" fill="${palette.ink}"/>
      <text x="128" y="160" fill="${palette.background}" font-family="Arial, sans-serif" font-size="42" font-weight="900">EAST MEETS NASH</text>
      <text x="1230" y="160" fill="${palette.paper}" font-family="Arial, sans-serif" font-size="34" font-weight="900" text-anchor="end">${escapeSvg(
        story.time,
      )}</text>
      <text x="128" y="338" fill="${palette.ink}" font-family="Georgia, serif" font-size="112" font-weight="900">${escapeSvg(
        coverTitle(story),
      )}</text>
      <text x="132" y="414" fill="#403830" font-family="Arial, sans-serif" font-size="38" font-weight="900">${escapeSvg(
        truncate(story.deck, 76),
      )}</text>
      ${chipSvg}
      <rect x="118" y="720" width="1364" height="72" rx="14" fill="${palette.ink}"/>
      <text x="154" y="767" fill="${palette.paper}" font-family="Arial, sans-serif" font-size="30" font-weight="900">ROUNDUP COVER + PHOTO DESK GUARDRAIL</text>
      <circle cx="1392" cy="756" r="24" fill="${palette.accent}"/>
      <circle cx="1452" cy="756" r="24" fill="${palette.secondary}"/>
    </svg>
  `;
}

export function issueCoverImage(story: Story): StoryCardImage {
  const approvedCover = issueCoverMedia(story);
  if (approvedCover) return approvedCover;

  return {
    src: `/api/media/issue-cover?id=${encodeURIComponent(story.id)}`,
    alt: `Issue cover for ${story.title}`,
  };
}

export function storyCardImage(story: Story): StoryCardImage {
  if (isRoundupStory(story)) return issueCoverImage(story);
  return featuredImage(story);
}
