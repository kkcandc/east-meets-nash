import { SearchPanel } from "@/components/SearchPanel";
import { getStories } from "@/lib/content";

export const metadata = {
  title: "Search",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] : params.q;

  return (
    <main>
      <section className="topic-hero search-hero">
        <p className="eyebrow">Archive Search</p>
        <h1>Find the East Nashville thing you half-remember seeing.</h1>
        <p>Search stories by place, beat, corridor, venue, source, or neighborhood obsession.</p>
      </section>
      <section className="page-band">
        <SearchPanel stories={getStories()} initialQuery={query || ""} />
      </section>
    </main>
  );
}
