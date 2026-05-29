import Link from "next/link";
import { SubscribeForm } from "@/components/SubscribeForm";
import { StoryCard } from "@/components/StoryCard";
import { getDailySourcePass, getSourceItems, getStories } from "@/lib/content";
import type { SourceItem, Story } from "@/lib/types";

function storySection(stories: Story[], usedIds: Set<string>, predicate: (story: Story) => boolean, limit = 4): Story[] {
  const selected = stories.filter((story) => !usedIds.has(story.id) && predicate(story)).slice(0, limit);
  selected.forEach((story) => usedIds.add(story.id));
  return selected;
}

const todayPackageIds = [
  "may-29-source-pass-east-nashville",
  "eastpoint-flats-groundbreaking-follow-may-29-2026",
  "friday-east-nashville-music-calendar-may-29-2026",
  "east-branch-summer-reading-kickoff-may-29-2026",
  "metro-parks-friday-night-calendar-may-29-2026",
];

const recentPackageIds = [
  "may-28-source-pass-east-nashville",
  "winter-storm-response-hearing-may-28-2026",
  "metro-budget-work-session-three-may-28-2026",
  "housing-opportunities-committee-park-center-east-may-28-2026",
  "eastpoint-groundbreaking-day-may-28-2026",
  "thursday-east-nashville-calendar-may-28-2026",
  "may-27-source-pass-east-nashville",
  "metro-budget-work-session-two-may-27-2026",
  "emergency-preparedness-working-group-may-27-2026",
  "eastpoint-groundbreaking-weekend-may-27-2026",
  "wednesday-east-nashville-calendar-may-27-2026",
  "may-26-source-pass-east-nashville",
  "metro-budget-work-session-may-26-2026",
  "east-bank-homework-may-26-2026",
  "tuesday-night-east-nashville-calendar-may-26-2026",
  "facebook-capture-notebook-may-26-2026",
  "facebook-capture-pass-two-may-26-2026",
];

const communityDeskSourceIds = [
  "src-may26-facebook-plant-parenthood-bongo-java",
  "src-may26-facebook-rare-dreamburger-foster-foodies",
  "src-may26-facebook-61-fitness-east-high",
  "src-may26-facebook-cousin-girl-sandwich-shop",
  "src-may26-facebook-cleveland-park-green-water",
  "src-may26-facebook-bluebell-great-dane",
  "src-may26-facebook-st-kiddie-home-care-enrollment",
  "src-may26-facebook-housing-support-pattern",
  "src-may26-facebook-cumberland-hardware-health-hold",
];

function communityDeskTitle(item: SourceItem): string {
  if (item.id === "src-may26-facebook-cumberland-hardware-health-hold") {
    return "Local business family-health update";
  }

  if (item.id === "src-may26-facebook-housing-support-pattern") {
    return "Recurring housing-support asks";
  }

  return item.title;
}

function communityDeskAction(item: SourceItem): string {
  if (item.risk === "High") {
    return "Hold or anonymize before any public use.";
  }

  if (item.status.toLowerCase().includes("public")) {
    return "Find or attach a public link before upgrading.";
  }

  if (item.status.toLowerCase().includes("metro")) {
    return "Check Metro Parks or hubNashville before publishing claims.";
  }

  if (item.status.toLowerCase().includes("license")) {
    return "Verify public business and license details first.";
  }

  return "Needs editor check before promotion.";
}

function communityDeskBuckets(sourceItems: SourceItem[]) {
  const items = communityDeskSourceIds
    .map((id) => sourceItems.find((item) => item.id === id))
    .filter((item): item is SourceItem => Boolean(item));

  return [
    {
      title: "Ready For Calendar",
      eyebrow: "Cleanest Leads",
      className: "ready",
      items: items.filter((item) => item.risk === "Low"),
    },
    {
      title: "Needs A Check",
      eyebrow: "Verify Next",
      className: "verify",
      items: items.filter((item) => item.risk === "Medium"),
    },
    {
      title: "Held Or Anonymized",
      eyebrow: "Privacy Rules",
      className: "hold",
      items: items.filter((item) => item.risk === "High"),
    },
  ].filter((bucket) => bucket.items.length);
}

export default function HomePage() {
  const stories = getStories();
  const sourceItems = getSourceItems();
  const todaySourcePass = getDailySourcePass();
  const packageIds = [
    ...todayPackageIds,
    ...recentPackageIds,
    "may-25-source-pass-east-nashville",
    "east-park-woodland-gun-scare-facts-may-25-2026",
    "east-nashville-memorial-day-service-checklist-may-25-2026",
    "east-nashville-beer-works-cookout-weather-may-25-2026",
    "may-20-source-pass-east-nashville",
    "lower-broadway-super-bowl-celebration-east-bank-may-20-2026",
    "nashville-grocery-tax-vote-deferred-may-20-2026",
    "east-nashville-wednesday-night-plans-may-20-2026",
    "talk-nice-clothing-swap-listening-party-may-23-2026",
    "underdog-meltdown-south-carson-deans-may-20-2026",
    "east-side-floral-prototype-bouquets-may-19-2026",
    "facebook-new-posts-notebook-may-19-2026",
    "nashville-super-bowl-east-bank-2030-may-19-2026",
    "metro-council-gallatin-shelby-nes-may-19-2026",
    "nes-tree-trimming-moratorium-watch-may-19-2026",
    "east-nashville-farmers-market-rain-check-may-19-2026",
    "may-15-source-pass-east-nashville",
    "hawkers-main-street-reopens-may-15-2026",
    "eastside-rockin-rumble-may-15-2026",
    "party-fowl-five-points-opening",
    "gallatin-main-safety-project",
    "east-trinity-gallatin-pedestrian-death",
  ];
  const packageStories = packageIds
    .map((id) => stories.find((story) => story.id === id))
    .filter((story): story is (typeof stories)[number] => Boolean(story));
  const todayStories = todayPackageIds
    .map((id) => stories.find((story) => story.id === id))
    .filter((story): story is Story => Boolean(story));
  const fallbackStories = stories.filter((story) => !packageStories.includes(story));
  const topStories = [...packageStories, ...fallbackStories].slice(0, 3);
  const topStoryIds = new Set(topStories.map((story) => story.id));
  const sectionUsedIds = new Set(topStoryIds);
  const deskBuckets = communityDeskBuckets(sourceItems);
  const whatToDo = storySection(stories, sectionUsedIds, (story) => story.beat === "Events", 4);
  const civicWatch = storySection(
    stories,
    sectionUsedIds,
    (story) => ["Civic", "Development", "Safety", "Public Safety"].includes(story.beat),
    4,
  );
  const foodAndOpenings = storySection(
    stories,
    sectionUsedIds,
    (story) => ["Food", "Restaurants", "Local Commerce"].includes(story.beat),
    4,
  );
  const neighborhoodSignals = storySection(
    stories,
    sectionUsedIds,
    (story) => ["Group Chat Says", "Seen in the Wild", "Tip Line"].includes(story.label),
    4,
  );
  const keepGoing = stories.filter((story) => !sectionUsedIds.has(story.id)).slice(0, 8);
  const issueSections = [
    {
      title: "What To Do",
      eyebrow: "Tonight + Weekend",
      search: "Events",
      description: "Shows, swaps, runs, markets, and the useful little plans that make the neighborhood feel alive.",
      stories: whatToDo,
    },
    {
      title: "Civic Watch",
      eyebrow: "Council + Streets",
      search: "Civic",
      description: "The public-record stuff with real consequences: taxes, East Bank, streets, safety, and services.",
      stories: civicWatch,
    },
    {
      title: "Food + Openings",
      eyebrow: "Local Commerce",
      search: "Food",
      description: "Restaurants, makers, storefronts, and the small business signals worth catching early.",
      stories: foodAndOpenings,
    },
    {
      title: "Neighborhood Signals",
      eyebrow: "From The Feed",
      search: "Facebook",
      description: "Group-chat texture, tips, screenshots, and the source-backed things that start close to the ground.",
      stories: neighborhoodSignals,
    },
  ].filter((section) => section.stories.length);
  const lead = topStories[0];

  return (
    <main>
      <section className="front-layout home-front">
        <div>
          <div className="section-heading front-page-heading">
            <p className="eyebrow">East Nashville Today / May 29</p>
            <h1>Eastpoint Starts, Friday Music, And The Weekend Kid Plan</h1>
            <p>
              Today&apos;s issue leads with public sources: Eastpoint Flats construction receipts, tomorrow&apos;s official
              neighborhood kickoff, three East Nashville music listings, East Branch summer reading, and a citywide
              parks lane for anyone who needs outside air.
            </p>
          </div>
          <section className="front-package" aria-label="Top stories">
            {lead ? <StoryCard story={lead} lead showZone={false} /> : null}
            <div className="package-stack">
              {topStories.slice(1).map((story) => (
                <StoryCard key={story.id} story={story} variant="package" showZone={false} />
              ))}
            </div>
          </section>
          <section className="capture-panel front-capture">
            <div>
              <p className="eyebrow">Get Tomorrow&apos;s Brief</p>
              <h2>The useful stuff, the weird stuff, and what people are mad about.</h2>
              <p>One very East Nashville email. Free, fast, and only a little too interested in permits.</p>
            </div>
            <SubscribeForm
              surface="homepage_inline_capture"
              label="Your email"
              buttonLabel="Send me the brief"
              placeholder="neighbor@example.com"
            />
          </section>
          <section className="source-status-strip" aria-label="How East Meets Nash labels story confidence">
            <div className="source-status-copy">
              <p className="eyebrow">Source Status</p>
              <h2>Read The Label Before The Take</h2>
              <p>
                May 29 is a public-source issue: confirmed event and library listings, reported Eastpoint construction
                context, and private-platform material held until supervised capture exists.
              </p>
            </div>
            <div className="source-status-grid">
              <div className="source-status-key confirmed">
                <span>Confirmed</span>
                <p>Official or public source checked.</p>
              </div>
              <div className="source-status-key reported">
                <span>Reported</span>
                <p>Source trail attached, with context still moving.</p>
              </div>
              <div className="source-status-key group-chat">
                <span>Group Chat Says</span>
                <p>Supervised capture, summarized and redacted.</p>
              </div>
            </div>
          </section>
          <section className="community-desk-panel" aria-label="Community Desk">
            <div className="section-heading compact-heading">
              <div>
                <p className="eyebrow">Community Desk</p>
                <h2>What The Facebook Pass Became</h2>
                <p>
                  Public-facing leads only. The sensitive stuff stays private, and the useful stuff gets a next action.
                </p>
              </div>
              <Link href="/admin/sources">Open source desk</Link>
            </div>
            <div className="community-desk-grid">
              {deskBuckets.map((bucket) => (
                <section className={`community-desk-column ${bucket.className}`} key={bucket.title}>
                  <p className="eyebrow">{bucket.eyebrow}</p>
                  <h3>{bucket.title}</h3>
                  <ul>
                    {bucket.items.map((item) => (
                      <li key={item.id}>
                        <strong>{communityDeskTitle(item)}</strong>
                        <span>{communityDeskAction(item)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </section>
          <section className="issue-lanes" aria-label="Today's East Nashville issue sections">
            {issueSections.map((section) => (
              <section className="issue-lane" key={section.title}>
                <div className="section-heading compact-heading">
                  <div>
                    <p className="eyebrow">{section.eyebrow}</p>
                    <h2>{section.title}</h2>
                    <p>{section.description}</p>
                  </div>
                  <Link href={`/search?q=${encodeURIComponent(section.search)}`}>Search this lane</Link>
                </div>
                <div className="story-grid">
                  {section.stories.map((story) => (
                    <StoryCard key={story.id} story={story} showZone={false} />
                  ))}
                </div>
              </section>
            ))}
          </section>
          {keepGoing.length ? (
            <section className="news-river" aria-label="More East Nashville stories">
              <div className="section-heading compact-heading">
                <div>
                  <p className="eyebrow">Archive River</p>
                  <h2>Keep Going</h2>
                </div>
                <Link href="/search">Search everything</Link>
              </div>
              <div className="story-grid">
                {keepGoing.map((story) => (
                  <StoryCard key={story.id} story={story} showZone={false} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
        <aside className="side-rail">
          <section className="source-rail-panel">
            <p className="eyebrow">Today&apos;s Package</p>
            <h2>{todayStories.length} May 29 Stories Live</h2>
            <p>{todaySourcePass.summary}</p>
            <dl>
              <div>
                <dt>Public stories</dt>
                <dd>{todayStories.filter((story) => story.label !== "Group Chat Says").length}</dd>
              </div>
              <div>
                <dt>Community notebooks</dt>
                <dd>{todayStories.filter((story) => story.label === "Group Chat Says").length}</dd>
              </div>
              <div>
                <dt>Nextdoor</dt>
                <dd>Held</dd>
              </div>
            </dl>
          </section>
          <section className="brief-panel">
            <p className="eyebrow">Today&apos;s Brief</p>
            <h2>Seven Things Worth Knowing</h2>
            <ol>
              {stories.slice(0, 7).map((story) => (
                <li key={story.id}>
                  <Link href={`/story/${story.slug}`}>{story.title}</Link>
                  <span>
                    {story.zone} / {story.beat}
                  </span>
                </li>
              ))}
            </ol>
            <SubscribeForm surface="homepage_brief" />
            <Link className="big-link-button" href="/feed">
              Create Account
            </Link>
          </section>
          <section className="tip-panel">
            <p className="eyebrow">Tip Line</p>
            <h2>Know Something East Nashville Should Be Nosy About?</h2>
            <p>Send openings, closures, weird signs, permit drama, meeting notes, and gossip with receipts.</p>
            <Link className="big-link-button" href="/tips">
              Send A Tip
            </Link>
          </section>
        </aside>
      </section>
    </main>
  );
}
