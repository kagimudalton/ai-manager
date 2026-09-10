type DiscoverCard = { id: string; type: string; tag: string; body: string };

async function safeFetch<T>(url: string, extract: (data: any) => string | null): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return extract(data);
  } catch {
    return null;
  }
}

export async function getRealDeck(): Promise<DiscoverCard[]> {
  const cards: DiscoverCard[] = [];

  const factPromises = Array.from({ length: 3 }, () =>
    safeFetch("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en", (d) => d?.text ?? null)
  );
  const advicePromises = Array.from({ length: 3 }, () =>
    safeFetch("https://api.adviceslip.com/advice", (d) => d?.slip?.advice ?? null)
  );
  const quotePromises = Array.from({ length: 2 }, () =>
    safeFetch("https://zenquotes.io/api/random", (d) => (d?.[0]?.q ? d[0].q + " - " + d[0].a : null))
  );

  const [facts, advice, quotes] = await Promise.all([
    Promise.all(factPromises),
    Promise.all(advicePromises),
    Promise.all(quotePromises),
  ]);

  facts.forEach((f, i) => f && cards.push({ id: "fact-" + i, type: "fact", tag: "Fact", body: f }));
  advice.forEach((a, i) => a && cards.push({ id: "advice-" + i, type: "lifehack", tag: "Life hack", body: a }));
  quotes.forEach((q, i) => q && cards.push({ id: "quote-" + i, type: "creativity", tag: "Inspiration", body: q }));

  return cards;
}