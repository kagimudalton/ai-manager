import { Card } from "@/components/ui/card";

type GuardianArticle = {
  id: string;
  webTitle: string;
  webUrl: string;
  webPublicationDate: string;
  sectionName: string;
};

const CATEGORIES = [
  { label: "AI & Tech", section: "technology" },
  { label: "Career", section: "business" },
  { label: "Education", section: "education" },
  { label: "Science", section: "science" },
];

async function getSection(section: string): Promise<GuardianArticle[]> {
  const key = process.env.GUARDIAN_API_KEY;
  if (!key) return [];

  const url = "https://content.guardianapis.com/search?section=" + section + "&order-by=newest&page-size=4&api-key=" + key;
  const res = await fetch(url, { next: { revalidate: 900 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.response?.results ?? [];
}

export default async function NewsPage() {
  const results = await Promise.all(CATEGORIES.map((c) => getSection(c.section)));

  return (
    <main className="max-w-md sm:max-w-xl md:max-w-3xl mx-auto px-4 sm:px-6 pt-2 pb-24">
      <div className="relative rounded-3xl overflow-hidden h-32 sm:h-40 mb-5 animate-fadeInUp">
        <img src="https://picsum.photos/seed/news-desk/900/400" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.8) 100%)" }} />
        <div className="relative h-full flex flex-col justify-end p-5">
          <p className="text-white/70 text-xs font-mono uppercase tracking-widest">News</p>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Live from The Guardian</h1>
        </div>
      </div>

      {CATEGORIES.map((cat, ci) => (
        <div key={cat.section} className="mb-5">
          <p className="text-xs font-mono uppercase tracking-widest text-muted mb-2">{cat.label}</p>
          <div className="space-y-2">
            {results[ci] && results[ci].length > 0 ? (
              results[ci].map((article, i) => (
                <Card key={article.id} className="animate-fadeInUp" style={{ animationDelay: (i * 60) + "ms" }}>
                  <a href={article.webUrl} target="_blank" rel="noopener noreferrer">
                    <p className="font-medium text-text text-sm leading-snug">{article.webTitle}</p>
                  </a>
                  <p className="text-xs text-muted mt-1">{new Date(article.webPublicationDate).toLocaleDateString()}</p>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted">No stories available right now.</p>
            )}
          </div>
        </div>
      ))}

      <p className="text-xs font-mono mt-4 text-center text-muted">Live data from The Guardian Open Platform</p>
    </main>
  );
}