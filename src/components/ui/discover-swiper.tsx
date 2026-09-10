"use client";

import { useState } from "react";
import { Bookmark, SkipForward, Sparkles, Zap, Palette, PartyPopper } from "lucide-react";

type DiscoverCard = { id: string; type: string; tag: string; body: string };

const TYPE_STYLE: Record<string, { icon: typeof Sparkles; color: string; soft: string }> = {
  fact: { icon: Sparkles, color: "var(--accent)", soft: "var(--accent-soft)" },
  lifehack: { icon: Zap, color: "var(--brass)", soft: "var(--brass-soft)" },
  creativity: { icon: Palette, color: "var(--teal)", soft: "var(--teal-soft)" },
};
const DEFAULT_STYLE = { icon: Sparkles, color: "var(--accent)", soft: "var(--accent-soft)" };

export function DiscoverSwiper({ deck }: { deck: DiscoverCard[] }) {
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);

  const card = deck[index];
  const style = card ? (TYPE_STYLE[card.type] ?? DEFAULT_STYLE) : DEFAULT_STYLE;
  const Icon = style.icon;

  function toggleSave(id: string) {
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  if (deck.length === 0) {
    return <p className="text-sm text-muted text-center py-12">Couldn't load fresh content right now - try refreshing the page.</p>;
  }

  return (
    <div>
      {card && (
        <div className="flex gap-1.5 mb-3">
          {deck.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
              <div className="h-full rounded-full" style={{ backgroundColor: "var(--accent)", width: i <= index ? "100%" : "0%" }} />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center" style={{ minHeight: "50vh" }}>
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
            <p className="text-sm mb-6 text-muted">{deck.length} real items, {saved.length} saved this session. Refresh the page for a new batch.</p>
          </div>
        )}
      </div>
    </div>
  );
}