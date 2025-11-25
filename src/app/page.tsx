// src/app/page.tsx
// Static landing page — masthead now includes a subtle dotted world map (CSS-only; no SVGs/images)

import Link from "next/link";

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
  // CSS string for the dotted "world" motif — many small radial-gradients positioned around the masthead.
  const dottedWorld = `
    radial-gradient(circle at 12% 35%, rgba(17,24,39,0.07) 0.6px, transparent 1.4px),
    radial-gradient(circle at 18% 42%, rgba(17,24,39,0.07) 0.6px, transparent 1.4px),
    radial-gradient(circle at 25% 38%, rgba(17,24,39,0.06) 0.6px, transparent 1.4px),
    radial-gradient(circle at 30% 45%, rgba(17,24,39,0.06) 0.6px, transparent 1.4px),
    radial-gradient(circle at 36% 32%, rgba(17,24,39,0.05) 0.6px, transparent 1.4px),

    radial-gradient(circle at 55% 28%, rgba(17,24,39,0.06) 0.6px, transparent 1.4px),
    radial-gradient(circle at 62% 34%, rgba(17,24,39,0.07) 0.6px, transparent 1.4px),
    radial-gradient(circle at 68% 24%, rgba(17,24,39,0.06) 0.6px, transparent 1.4px),

    radial-gradient(circle at 45% 60%, rgba(17,24,39,0.05) 0.6px, transparent 1.4px),
    radial-gradient(circle at 52% 66%, rgba(17,24,39,0.06) 0.6px, transparent 1.4px),
    radial-gradient(circle at 60% 58%, rgba(17,24,39,0.05) 0.6px, transparent 1.4px),

    radial-gradient(circle at 78% 50%, rgba(17,24,39,0.04) 0.6px, transparent 1.4px),
    radial-gradient(circle at 82% 60%, rgba(17,24,39,0.04) 0.6px, transparent 1.4px),

    radial-gradient(circle at 8% 68%, rgba(17,24,39,0.03) 0.6px, transparent 1.4px),
    radial-gradient(circle at 20% 72%, rgba(17,24,39,0.03) 0.6px, transparent 1.4px)
  `;

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 text-neutral-900 antialiased">
      {/* SLIM MASTHEAD with subtle dotted world-map background (CSS-only) */}
      <div
        className="w-full bg-white/85 backdrop-blur sticky top-0 z-50 border-b border-neutral-200"
        style={{
          // place the dotted motif inside a pseudo-layer via backgroundImage
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
            {/* Clean text CTA (no SVG/image) */}
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
        {/* subtle non-SVG background handled via CSS radial gradients */}
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
            {/* Left column: headline + copy */}
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

            {/* Right column: CSS-only map mock (no SVGs) */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md rounded-3xl bg-white/90 p-6 shadow-2xl border border-white/60">
                {/* CSS map canvas */}
                <div className="relative h-56 rounded-lg overflow-hidden bg-gradient-to-tr from-rose-100 via-indigo-100 to-sky-50">
                  {/* faint paths (using rotated divs) */}
                  <div className="absolute left-[-10%] top-[18%] w-[120%] h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-40 rounded-full transform rotate-6" />
                  <div className="absolute left-[-5%] top-[45%] w-[110%] h-1 bg-gradient-to-r from-transparent via-pink-300 to-transparent opacity-30 rounded-full transform -rotate-3" />
                  <div className="absolute left-0 top-[70%] w-[100%] h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-25 rounded-full transform rotate-2" />

                  {/* pins (pure divs) */}
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

      {/* MEMORY GRAPH */}
      <section id="learn-more" className="container mx-auto px-6 md:px-12 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">The Memory Graph</h2>
            <p className="text-neutral-600">
              A simple, humane flow that organises life’s fragments into a single coherent view.
            </p>

            <ol className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="flex-none w-10 h-10 rounded-xl bg-black text-white grid place-items-center font-semibold">1</div>
                <div>
                  <div className="font-semibold">Create Scrapbooks</div>
                  <div className="text-sm text-neutral-600">Moment pages with photos, captions and mood tags.</div>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-none w-10 h-10 rounded-xl bg-black text-white grid place-items-center font-semibold">2</div>
                <div>
                  <div className="font-semibold">Scrapbooks → Pins</div>
                  <div className="text-sm text-neutral-600">Auto-detected place, inferred vibe and timestamps.</div>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-none w-10 h-10 rounded-xl bg-black text-white grid place-items-center font-semibold">3</div>
                <div>
                  <div className="font-semibold">Pins → Map</div>
                  <div className="text-sm text-neutral-600">A living map that scales from neighbourhoods to continents.</div>
                </div>
              </li>
            </ol>
          </div>

          {/* Intelligence panel */}
          <aside className="rounded-2xl p-6 bg-white shadow-lg border border-neutral-100">
            <h3 className="font-semibold mb-2">Soft intelligence</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Gentle, local inference that organises memories without ever feeling intrusive.
            </p>

            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-sm bg-neutral-200 grid place-items-center text-xs">P</div>
                <div>
                  <div className="text-sm font-medium">Auto-place</div>
                  <div className="text-xs text-neutral-500">Reverse lookups & time context</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-sm bg-neutral-200 grid place-items-center text-xs">V</div>
                <div>
                  <div className="text-sm font-medium">Vibe tags</div>
                  <div className="text-xs text-neutral-500">Mood inferred from captions & visuals</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-sm bg-neutral-200 grid place-items-center text-xs">M</div>
                <div>
                  <div className="text-sm font-medium">Map-first</div>
                  <div className="text-xs text-neutral-500">Profiles that show where you’ve lived</div>
                </div>
              </div>
            </div>
          </aside>
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
