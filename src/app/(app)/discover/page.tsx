"use client";

import { useState } from "react";
import { Bookmark, SkipForward, RefreshCw, Sparkles, Zap, Palette, GraduationCap, Clock3, Wind, PartyPopper } from "lucide-react";

type DiscoverCard = { id: string; type: string; tag: string; body: string };

const DECK_A: DiscoverCard[] = [
  { id: "d1", type: "fact", tag: "STEM", body: "A single bolt of lightning contains enough energy to toast about 100,000 slices of bread." },
  { id: "d2", type: "lifehack", tag: "Life hack", body: "Can't fall asleep? Try the 4-7-8 breath: inhale 4 seconds, hold 7, exhale 8. Repeat four times." },
  { id: "d3", type: "creativity", tag: "Creativity", body: "Stuck on a drawing? Flip it upside down - your brain stops seeing 'a face' and starts seeing actual shapes." },
  { id: "d4", type: "stem", tag: "Physics", body: "You're moving right now - Earth spins at about 1,670 km/h at the equator. You just don't feel it." },
  { id: "d5", type: "nostalgia", tag: "Nostalgia", body: "The first text message ever sent was 'Merry Christmas,' in 1992 - from a computer to a phone." },
  { id: "d6", type: "lifehack", tag: "Life hack", body: "Write tomorrow's first task down tonight. Starting a day already knowing your first move removes most of the friction." },
  { id: "d7", type: "fact", tag: "Language", body: "In Spanish, 'esperar' means both 'to hope' and 'to wait' - the same word for two things that often go together." },
];

const DECK_B: DiscoverCard[] = [
  { id: "e1", type: "stem", tag: "Chemistry", body: "Bananas are slightly radioactive - they contain potassium-40. You'd need to eat about 10 million at once for it to matter." },
  { id: "e2", type: "creativity", tag: "Creativity", body: "Most sketch artists spend more time looking at the subject than the paper. Try a 70/30 split." },
  { id: "e3", type: "lifehack", tag: "Life hack", body: "The 2-minute rule: if a task takes under 2 minutes, do it immediately instead of adding it to a list." },
  { id: "e4", type: "nostalgia", tag: "Nostalgia", body: "Dial-up internet sounds were actually two modems negotiating connection speed - not random noise." },
  { id: "e5", type: "fact", tag: "Math", body: "Zero was independently invented at least three times in history: Mesopotamia, the Maya civilization, and India." },
  { id: "e6", type: "relax", tag: "Relax", body: "Box breathing - 4 seconds in, 4 hold, 4 out, 4 hold - is the same technique Navy SEALs use to stay calm under pressure." },
];

const TYPE_STYLE: Record<string, { icon: typeof Sparkles; color: string; soft: string }> = {
  fact: { icon: Sparkles, color: "var(--accent)", soft: "var(--accent-soft)" },
  lifehack: { icon: Zap, color: "var(--brass)", soft: "var(--brass-soft)" },
  creativity: { icon: Palette, color: "var(--accent)", soft: "var(--accent-soft)" },
  stem: { icon: GraduationCap, color: "var(--teal)", soft: "var(--teal-soft)" },
  nostalgia: { icon: Clock3, color: "var(--brass)", soft: "var(--brass-soft)" },
  relax: { icon: Wind, color: "var(--teal)", soft: "var(--teal-soft)" },
};
const DEFAULT_STYLE = { icon: Sparkles, color: "var(--accent)", soft: "var(--accent-soft)" };

export default function DiscoverPage() {
  const [deck, setDeck] = useState(DECK_A);
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);
  const [usedB, setUsedB] = useState(false);

  const card = deck[index];
  const style = card ? (TYPE_STYLE[card.type] ?? DEFAULT_STYLE) : DEFAULT_STYLE;
  const Icon = style.icon;

  function refresh() {
    setDeck(usedB ? DECK_A : DECK_B);
    setUsedB((u) => !u);
    setIndex(0);
  }

  function toggleSave(id: string) {
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <main className="max-w-md sm:max-w-xl mx-auto px-4 sm:px-6 pt-2 pb-24 flex flex-col" style={{ minHeight: "70vh" }}>
      <div className="relative rounded-3xl overflow-hidden h-32 sm:h-40 mb-5 animate-fadeInUp">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://picsum.photos/seed/discover-spark/900/400" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.8) 100%)" }} />
        <div className="relative h-full flex flex-col justify-end p-5">
          <p className="text-white/70 text-xs font-mono uppercase tracking-widest">Discover</p>
          <h1 className="text-xl sm:text-2xl font-bold text-white">A few minutes, well spent</h1>
        </div>
      </div>

      {card && (
        <div className="flex gap-1.5 mb-3">
          {deck.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
              <div className="h-full rounded-full" style={{ backgroundColor: "var(--accent)", width: i <= index ? "100%" : "0%" }} />
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 flex items-center justify-center">
        {card ? (
          <div key={card.id} className="w-full animate-fadeInUp">
            <div className="rounded-3xl p-6 border text-center" style={{ backgroundColor: style.soft, borderColor: "var(--border)" }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "var(--surface)" }}>
                <Icon size={20} style={{ color: style.color }} />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest" style={{ color: style.color }}>{card.tag}</span>
              <p className="text-lg font-semibold leading-snug mt-3 text-text">{card.body}</p>
            </div>

            <div className="flex items-center justify-center gap-4 mt-6">
              <button onClick={() => toggleSave(card.id)} className="w-11 h-11 rounded-full border flex items-center justify-center" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
                <Bookmark size={17} style={saved.includes(card.id) ? { color: "var(--brass)", fill: "var(--brass)" } : { color: "var(--muted)" }} />
              </button>
              <button onClick={() => setIndex((i) => i + 1)} className="flex items-center gap-2 rounded-full px-6 py-3 font-medium text-sm" style={{ backgroundColor: "var(--ink)", color: "var(--ink-text)" }}>
                Next <SkipForward size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center animate-fadeInUp">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "var(--teal-soft)" }}>
              <PartyPopper size={26} style={{ color: "var(--teal)" }} />
            </div>
            <p className="text-lg font-bold mb-1 text-text">You're caught up</p>
            <p className="text-sm mb-6 text-muted">{deck.length} cards, {saved.length} saved this session.</p>
            <button onClick={refresh} className="flex items-center gap-2 rounded-full px-6 py-3 font-medium text-sm mx-auto" style={{ backgroundColor: "var(--accent)", color: "var(--ink-text)" }}>
              <RefreshCw size={15} /> Refresh for more
            </button>
          </div>
        )}
      </div>

      <p className="text-xs font-mono text-center mt-6 text-muted">
        A fixed batch on purpose - no endless scroll. Saved items reset on refresh for now.
      </p>
    </main>
  );
}