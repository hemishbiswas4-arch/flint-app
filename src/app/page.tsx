// src/app/page.tsx
// Beautiful, polished static landing page for Outplann
// (No public excerpts or links to internal docs included)
// Internal upload path (tooling only, not shown on site):
// /mnt/data/CORE STRUCTURE (How the App is Built) (1).pdf

import Link from "next/link";
import { Compass, MapPin, Users, Sparkles, Globe } from "lucide-react";

export const metadata = {
  title: "Outplann — Scrapbooks · Maps · Memory",
  description:
    "Outplann turns photos, notes and moods into living scrapbooks and a personal world map. Download the app on the App Store.",
};

const features = [
  {
    title: "Scrapbooks, elevated",
    desc: "Design beautiful moment pages with photos, captions and mood tags — curated, not cluttered.",
    icon: (p: any) => <Sparkles {...p} />,
  },
  {
    title: "Pins with context",
    desc: "Automatic place, date and mood tags so every memory sits where it belongs.",
    icon: (p: any) => <MapPin {...p} />,
  },
  {
    title: "Your life, as a map",
    desc: "Zoom across cities and seasons — a living map that reveals the story of you.",
    icon: (p: any) => <Globe {...p} />,
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 text-neutral-900 antialiased">
      {/* SLIM MASTHEAD */}
      <div className="w-full bg-white/70 backdrop-blur sticky top-0 z-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-lg font-bold tracking-tight">Outplann</div>
            <div className="hidden sm:block text-sm text-neutral-500">Scrapbooks · Maps · Memory</div>
          </div>

          <div className="flex items-center gap-4">
            {/* Official-looking App Store badge (SVG, compact) */}
            <a
              href="https://apps.apple.com/in/app/outplann/id6753912652"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Outplann in the App Store"
              className="inline-flex items-center"
            >
              <svg
                width="140"
                height="40"
                viewBox="0 0 140 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-hidden
              >
                <rect width="140" height="40" rx="8" fill="#111827" />
                <g transform="translate(12,8)" fill="#fff">
                  {/* Apple glyph */}
                  <path d="M6.1 0C8.6 0 10.4 1.8 11 3.1c-1 0-2.6-.6-3.5-.6-1 0-2.6.6-3.5.6.5-1.4 2.1-3.1 5-3.1z" opacity="0.95" />
                  {/* text */}
                  <text x="26" y="12" fontSize="10" fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', Roboto" fontWeight="700">
                    Download on the App Store
                  </text>
                </g>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* layered soft gradients for richness */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(600px 300px at 12% 12%, rgba(236,72,153,0.06), transparent), radial-gradient(500px 260px at 88% 82%, rgba(99,102,241,0.05), transparent)",
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
                  {/* Apple logo + text */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-3" aria-hidden>
                    <path d="M16.365 1.43c0 1.02-.39 2.01-1.09 2.73-.75.78-1.87 1.37-3.05 1.16-.14-.02-.3-.03-.44-.03-.96 0-2.04.52-2.92 1.4-.88.88-1.45 1.93-1.45 3.08 0 1.16.6 2.42 1.46 3.32.8.85 1.92 1.52 3.12 1.52.13 0 .26 0 .38-.01.14-.01.28-.01.41-.01 1.18 0 2.33.6 3.08 1.38.82.86 1.31 1.91 1.31 3.06 0 1.46-.68 2.77-1.73 3.74-1.1 1.02-2.49 1.63-3.95 1.63-1.12 0-2.23-.27-3.13-.8-.88-.52-1.64-1.28-2.21-2.18-1.22-1.76-1.86-3.84-1.86-6 0-1.73.7-3.41 1.97-4.73C5.8 6.79 7.9 5.9 10 5.9c.14 0 .27 0 .41.01.14.01.29.02.43.03 1.21.15 2.36-.32 3.2-1.34.56-.7.89-1.58.89-2.52 0-.01 0-.03 0-.04z" fill="currentColor" />
                  </svg>
                  Get the app
                </a>

                <a
                  href="#learn-more"
                  className="text-sm text-neutral-600 underline underline-offset-2"
                >
                  Learn how it works
                </a>
              </div>

              <div className="mt-6 flex flex-wrap gap-6 text-sm text-neutral-500">
                <span className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-neutral-400" /> Map-first profiles
                </span>
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-neutral-400" /> Private by design
                </span>
              </div>
            </div>

            {/* Right column: map visual */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md rounded-3xl bg-white/90 p-6 shadow-2xl border border-white/60">
                {/* stylized static map SVG (pins + routes) */}
                <svg viewBox="0 0 420 280" className="w-full h-56 rounded-lg overflow-hidden" role="img" aria-label="Stylized map illustration">
                  <defs>
                    <linearGradient id="g1" x1="0" x2="1">
                      <stop offset="0" stopColor="#FBCFE8" />
                      <stop offset="1" stopColor="#C7B8FF" />
                    </linearGradient>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* background land / shapes */}
                  <rect x="0" y="0" width="420" height="280" fill="#F8FAFC" />
                  <g opacity="0.9">
                    <path d="M40 70c40-30 120-20 170 10s90 60 140 40" fill="none" stroke="#E6E9F2" strokeWidth="14" strokeLinecap="round" />
                    <path d="M30 130c50 10 100-10 160 30s80 60 140 30" fill="none" stroke="#EEF2FF" strokeWidth="12" strokeLinecap="round" />
                  </g>

                  {/* routes */}
                  <path d="M80 90 C140 40, 220 30, 300 80" stroke="url(#g1)" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M60 150 C140 120, 220 140, 340 180" stroke="#A78BFA" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                  {/* pins */}
                  <g transform="translate(300,82)">
                    <circle cx="0" cy="0" r="8" fill="#fff" />
                    <circle cx="0" cy="0" r="6" fill="#7C3AED" filter="url(#glow)" />
                  </g>
                  <g transform="translate(160,55)">
                    <circle cx="0" cy="0" r="8" fill="#fff" />
                    <circle cx="0" cy="0" r="6" fill="#FB7185" filter="url(#glow)" />
                  </g>
                  <g transform="translate(220,165)">
                    <circle cx="0" cy="0" r="8" fill="#fff" />
                    <circle cx="0" cy="0" r="6" fill="#06B6D4" filter="url(#glow)" />
                  </g>

                  {/* subtle grid */}
                  <g opacity="0.03" stroke="#000" strokeWidth="1">
                    <path d="M0 0 L420 0" transform="translate(0,0)"/>
                  </g>
                </svg>

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
                <MapPin className="w-5 h-5 text-neutral-400" />
                <div>
                  <div className="text-sm font-medium">Auto-place</div>
                  <div className="text-xs text-neutral-500">Reverse lookups & time context</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-neutral-400" />
                <div>
                  <div className="text-sm font-medium">Vibe tags</div>
                  <div className="text-xs text-neutral-500">Mood inferred from captions & visuals</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Compass className="w-5 h-5 text-neutral-400" />
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
                <div className={`w-12 h-12 rounded-lg grid place-items-center ${["bg-gradient-to-br from-rose-200 to-indigo-200","bg-gradient-to-br from-amber-200 to-rose-200","bg-gradient-to-br from-teal-200 to-sky-200"][i]} `}>
                  {f.icon({ className: "w-6 h-6 text-neutral-700" })}
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
