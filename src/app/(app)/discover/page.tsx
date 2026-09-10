import { getRealDeck } from "@/lib/services/discover-service";
import { DiscoverSwiper } from "@/components/ui/discover-swiper";

export default async function DiscoverPage() {
  const deck = await getRealDeck();

  return (
    <main className="max-w-md sm:max-w-xl mx-auto px-4 sm:px-6 pt-2 pb-24">
      <div className="relative rounded-3xl overflow-hidden h-32 sm:h-40 mb-5 animate-fadeInUp">
        <img src="https://picsum.photos/seed/discover-spark/900/400" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.8) 100%)" }} />
        <div className="relative h-full flex flex-col justify-end p-5">
          <p className="text-white/70 text-xs font-mono uppercase tracking-widest">Discover</p>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Real facts, advice, and quotes</h1>
        </div>
      </div>

      <DiscoverSwiper deck={deck} />

      <p className="text-xs font-mono text-center mt-6 text-muted">
        Pulled live from three free public APIs - refresh the page for a new batch.
      </p>
    </main>
  );
}