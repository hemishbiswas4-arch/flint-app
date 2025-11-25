// src/app/page.tsx
// Clean, production-ready static landing page for Outplann
// No stray tokens, no SVGs, no runtime errors (TypeScript-friendly)

export const metadata = {
  title: "Outplann — Scrapbooks · Maps · Memory",
  description:
    "Outplann turns photos, notes and moods into elegant scrapbooks and a personal world map. Download the app on the App Store.",
};

const features = [
  {
    title: "Scrapbooks, elevated",
    desc: "Design beautiful moment pages with photos, captions and mood tags — curated, not cluttered.",
    badge: "✦",
  },
  {
    title: "Pins with context",
    desc: "Automatic place, date and mood tags so every memory sits where it belongs.",
    badge: "📍",
  },
  {
    title: "Your life, as a map",
    desc: "Zoom across cities and seasons — a living map that reveals the story of you.",
    badge: "🗺️",
  },
];

export default function LandingPage() {
  // dotted world motif (CSS string) applied to masthead via inline style
  const dottedWorld = [
    "radial-gradient(circle at 12% 35%, rgba(17,24,39,0.07) 0.6px, transparent 1.4px)",
    "radial-gradient(circle at 62% 34%, rgba(17,24,39,0.07) 0.6px, transparent 1.4px)",
  ].join(", ");

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 text-neutral-900 antialiased">
      {/* Masthead with subtle dotted motif */}
      <div
        className="w-full bg-white/85 backdrop-blur sticky top-0 z-50 border-b border-neutral-200"
        style={{
          backgroundImage: dottedWorld,
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-lg font-bold tracking-tight leading-none">Outplann</div>
            <div className="hidden sm:flex items-center text-sm text-neutral-500 h-5">
              <span className="leading-5">Scrapbooks · Maps · Memory</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://apps.apple.com/in/app/outplann/id6753912652"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Outplann in the App Store"
              className="inline-flex items-center rounded-md bg-black text-white px-4 py-2 text-sm font-semibold shadow hover:shadow-lg transition"
            >
              Get the app
            </a>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(600px 300px at 12% 12%, rgba(236,72,153,0.04), transparent), radial-gradient(500px 260px at 88% 82%, rgba(99,102,241,0.03), transparent)",
          }}
        />

        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                Map the life you want to remember.
              </h1>

              <p className="mt-6 text-lg text-neutral-600 leading-relaxed max-w-xl">
                Outplann turns photos, notes and moods into elegant scrapbooks that build a living, private world map — intentionally quiet, beautifully organised.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
                <a
                  href="https://apps.apple.com/in/app/outplann/id6753912652"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download Outplann on the App Store"
                  className="inline-flex items-center rounded-md bg-black text-white px-5 py-3 text-sm font-semibold shadow hover:shadow-lg transition"
                >
                  Get the app
                </a>

                <a href="#learn-more" className="text-sm text-neutral-600 underline underline-offset-2">
                  Learn how it works
                </a>
              </div>

              <div className="mt-6 flex flex-wrap gap-6 text-sm text-neutral-500">
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-neutral-300" /> Map-first profiles
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-neutral-300" /> Private by design
                </span>
              </div>
            </div>

            {/* CSS-only map mock */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md rounded-3xl bg-white/90 p-6 shadow-2xl border border-white/60">
                <div className="relative h-56 rounded-lg overflow-hidden bg-gradient-to-tr from-rose-100 via-indigo-100 to-sky-50">
                  <div className="absolute left-[-10%] top-[18%] w-[120%] h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-40 rounded-full transform rotate-6" />
                  <div className="absolute left-[-5%] top-[45%] w-[110%] h-1 bg-gradient-to-r from-transparent via-pink-300 to-transparent opacity-30 rounded-full transform -rotate-3" />
                  <div className="absolute left-0 top-[70%] w-[100%] h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-25 rounded-full transform rotate-2" />

                  <div className="absolute w-10 h-10 rounded-full bg-white left-[72%] top-[20%] grid place-items-center">
                    <div className="w-4 h-4 rounded-full bg-violet-600 shadow-[0_6px_18px_rgba(124,58,237,0.25)]" />
                  </div>
                  <div className="absolute w-10 h-10 rounded-full bg-white left-[37%] top-[12%] grid place-items-center">
                    <div className="w-4 h-4 rounded-full bg-rose-500 shadow-[0_6px_18px_rgba(251,113,133,0.18)]" />
                  </div>
                  <div className="absolute w-10 h-10 rounded-full bg-white left-[58%] top-[65%] grid place-items-center">
                    <div className="w-4 h-4 rounded-full bg-cyan-500 shadow-[0_6px_18px_rgba(6,182,212,0.18)]" />
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold">Lisbon • April</h4>
                  <p className="text-xs text-neutral-500">A quiet evening at the café — pinned automatically.</p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-neutral-600">
                  <div className="p-2 rounded-lg bg-neutral-50 text-center">Pins</div>
                  <div className="p-2 rounded-lg bg-neutral-50 text-center">Map</div>
                  <div className="p-2 rounded-lg bg-neutral-50 text-center">Share</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ONE-LINER */}
      <section className="container mx-auto px-6 md:px-12 py-8 text-center">
        <p className="mx-auto max-w-3xl text-neutral-600 text-lg">
          Every moment becomes a pin. Every pin becomes a story. Outplann is for people who prefer meaning over metrics.
        </p>
      </section>

      {/* MEMORY GRAPH + HORIZONTAL 'INTELLIGENCE' CAPSULES */}
      <section id="learn-more" className="container mx-auto px-6 md:px-12 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">The Memory Graph</h2>
              <p className="text-neutral-600">
                A simple, humane flow that organises life’s fragments into a single coherent view.
              </p>
            </div>

            <aside className="rounded-2xl p-6 bg-white shadow-lg border border-neutral-100">
              <h3 className="font-semibold mb-2">Outplann Intelligence</h3>
              <p className="text-sm text-neutral-600 mb-3">
                Lightweight AI that organises scrapbooks into pins, categories and map-driven discovery — working quietly in the background.
              </p>
              <div className="text-xs text-neutral-500">Swipe to explore →</div>
            </aside>
          </div>

          <div className="overflow-x-auto no-scrollbar scroll-pl-6 -mx-6 px-6" aria-label="Outplann Intelligence features">
            <div className="flex gap-4 pb-4" role="list">
              <article role="listitem" className="min-w-[280px] flex-shrink-0 rounded-2xl p-6 bg-white shadow-md border border-neutral-100">
                <h4 className="font-semibold mb-2">Smart place detection</h4>
                <p className="text-sm text-neutral-600 mb-3">
                  Automatically identifies cities, restaurants, cafés, hotels and landmarks from your scrapbook — every place becomes a pin.
                </p>
                <ul className="text-xs text-neutral-500 space-y-1">
                  <li>Auto pin creation from scrapbook locations</li>
                  <li>Reverse lookup to fill place meta</li>
                </ul>
              </article>

              <article role="listitem" className="min-w-[280px] flex-shrink-0 rounded-2xl p-6 bg-white shadow-md border border-neutral-100">
                <h4 className="font-semibold mb-2">Vibe & category understanding</h4>
                <p className="text-sm text-neutral-600 mb-3">
                  Infers mood and category (food, cafés, nightlife, nature, culture, stays) so your profile categories and filters are auto-populated.
                </p>
                <div className="text-xs text-neutral-500">Helps surface relevant scrapbooks in discovery and search.</div>
              </article>

              <article role="listitem" className="min-w-[280px] flex-shrink-0 rounded-2xl p-6 bg-white shadow-md border border-neutral-100">
                <h4 className="font-semibold mb-2">Auto-organised scrapbooks</h4>
                <p className="text-sm text-neutral-600 mb-3">
                  Photos, captions and mood tags are used to sort scrapbooks into profile sections, map layers and discovery feeds — minimal manual tagging required.
                </p>
                <div className="text-xs text-neutral-500">Cleaner profiles, smarter maps.</div>
              </article>

              <article role="listitem" className="min-w-[280px] flex-shrink-0 rounded-2xl p-6 bg-white shadow-md border border-neutral-100">
                <h4 className="font-semibold mb-2">Pin intelligence (Geo-memory)</h4>
                <p className="text-sm text-neutral-600 mb-3">
                  Each pin stores photos, text memory, mood, date/time and optional weather — turning locations into rich memory objects.
                </p>
                <div className="text-xs text-neutral-500">View memories by place, not only by time.</div>
              </article>

              <article role="listitem" className="min-w-[280px] flex-shrink-0 rounded-2xl p-6 bg-white shadow-md border border-neutral-100">
                <h4 className="font-semibold mb-2">Discovery & suggestions</h4>
                <p className="text-sm text-neutral-600 mb-3">
                  Based on pins and user maps, Outplann suggests similar places, journeys and community scrapbooks that align with your map patterns.
                </p>
                <div className="text-xs text-neutral-500">Personalised, map-driven discovery.</div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto px-6 md:px-12 py-12">
        <h3 className="text-lg font-medium text-center text-neutral-700 mb-6">Select features</h3>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <article key={f.title} className="rounded-2xl p-6 bg-white shadow-lg border border-neutral-100 transform transition hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg grid place-items-center ${["bg-rose-100","bg-amber-100","bg-cyan-100"][i]}`}>
                  <span className="text-sm">{f.badge}</span>
                </div>
                <div>
                  <h4 className="font-semibold">{f.title}</h4>
                  <p className="text-sm text-neutral-600 mt-1">{f.desc}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <footer className="py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <div className="rounded-3xl px-8 py-8 bg-gradient-to-r from-neutral-900 to-indigo-900 text-white shadow-2xl">
            <h4 className="text-2xl font-bold">Start mapping your world</h4>
            <p className="mt-2 text-neutral-200">Download Outplann and build your first scrapbook today.</p>

            <div className="mt-6 flex items-center justify-center gap-4">
              <a
                href="https://apps.apple.com/in/app/outplann/id6753912652"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md bg-white/95 px-5 py-3 text-neutral-900 font-semibold shadow"
                aria-label="Download Outplann on the App Store"
              >
                Get the app
              </a>
            </div>
          </div>

          <p className="mt-6 text-xs text-neutral-500">© {new Date().getFullYear()} Outplann — All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
