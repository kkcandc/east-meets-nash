import { readFile } from "node:fs/promises";

const siteUrl = new URL(process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL || "https://eastmeetsnash.com");
const stories = JSON.parse(await readFile(new URL("../data/stories.json", import.meta.url), "utf8"));
const latestStory = stories.slice().sort((a, b) => b.priority - a.priority)[0];

if (!latestStory) {
  throw new Error("No stories found in data/stories.json.");
}

function pageUrl(pathname) {
  const url = new URL(pathname, siteUrl);
  url.searchParams.set("publish-check", String(Date.now()));
  return url;
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

async function fetchText(url) {
  const response = await fetch(url, { cache: "no-store" });
  const text = await response.text();
  return { response, text: decodeHtml(text) };
}

const homepage = await fetchText(pageUrl("/"));
if (!homepage.response.ok) {
  throw new Error(`Homepage check failed: ${homepage.response.status} ${homepage.response.statusText}`);
}

if (!homepage.text.includes(latestStory.slug)) {
  throw new Error(
    [
      "Live homepage is stale.",
      `Expected latest local story slug: ${latestStory.slug}`,
      `Site checked: ${siteUrl.origin}`,
      "Push to the production branch and wait for Render to finish deploying, then run npm run verify:live again.",
    ].join("\n"),
  );
}

const storyPath = `/story/${latestStory.slug}`;
const storyPage = await fetchText(pageUrl(storyPath));
if (!storyPage.response.ok) {
  throw new Error(`Latest story page failed: ${storyPath} returned ${storyPage.response.status}`);
}

if (!storyPage.text.includes(latestStory.title)) {
  throw new Error(
    [
      "Latest story route loaded, but its title was not found in the HTML.",
      `Expected title: ${latestStory.title}`,
      `Story URL: ${new URL(storyPath, siteUrl).toString()}`,
    ].join("\n"),
  );
}

console.log(`Live publish verified: ${latestStory.title}`);
console.log(`Homepage: ${siteUrl.origin}/`);
console.log(`Story: ${new URL(storyPath, siteUrl).toString()}`);
