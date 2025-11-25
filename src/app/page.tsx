// src/app/page.tsx
// Static marketing landing — blends Warm Traveler Aesthetic (B) with Futuristic Memory Graph (C)
// Source / reference: uploaded core structure PDF at local path:
// /mnt/data/CORE STRUCTURE (How the App is Built) (1).pdf

import Link from "next/link";
import { Compass, MapPin, Users, Sparkles, Clock, Globe } from "lucide-react";

export const metadata = {
  title: "Outplann — Scrapbooks, Maps, Memories",
  description:
    "Outplann turns your photos, notes and moods into living scrapbooks and a personal world map. Download on the App Store.",
};

const gradients = [
  "from-rose-400 via-pink-500 to-indigo-600",
  "from-amber-400 via-orange-500 to-rose-500",
  "from-teal-400 via-emerald-500 to-sky-600",
  "from-sky-400 via-indigo-500 to-purple-600",
];

const features = [
  {
    title: "Scrapbooks with soul",
    desc: "Design photo-forward pages with custom layouts, stickers and mood tags — your memories, curated.",
    icon: (props: any) => <Sparkles {...props} />,
  },
  {
    title: "Auto pins & smart tags",
    desc: "Photos become pins—auto-tagged by place, date and vibe. Minimal taps, maximum context.",
    icon: (props: any) => <MapPin {...props} />,
  },
  {
    title: "A map that remembers",
    desc: "Zoom the globe to see your life at a glance. Your map grows with every memory.",
    icon: (props: any) => <Globe {...props} />,
  },
  {
    title: "Discovery, reimagined",
    desc: "Browse journeys by mood, place or season. Follow maps — not feeds.",
    icon: (props: any) => <Users {...props} />,
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 text-neutral-900">
      {/* HERO */}
      <section className="w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28 relative">
          {/* subtle orbital accent */}
          <div
            aria-hidden
            className="absolute right-4 top-8 w-60 h-60 rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-indigo-400 to-pink-400 animate-[spin_40s_linear_infinite] hidden md:block"
            style={{ mixBlendMode: "screen" }}
          />
          <div className="relative z-10 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mx-auto md:mx-0">
              Your life. <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-500">mapped beautifully.</span>
            </h1>
            <p className="mt-4 max-w-3xl mx-auto md:mx-0 text-neutral-700 text-lg md:text-xl">
              Outplann turns photos, notes and moods into living scrapbooks that automatically build your personal world map — gentle, private, and endlessly rediscoverable.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
              <a
                href="https://apps.apple.com/in/app/outplann/id6753912652"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white text-black font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition"
                aria-label="Download Outplann on the App Store (opens in new tab)"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M19.6 3.8c-.7.8-1.6 1.6-2.6 1.6-.6 0-1.5-.4-2.5-.4-1.2 0-2.4.6-3.2.6-.8 0-1.9-.6-3.1-.6C6.3 5 4.6 6.9 4.6 9.9c0 2.1.8 4.3 1.8 5.8.8 1.2 1.8 2.5 3.1 2.5.9 0 1.5-.6 3.1-.6 1.6 0 2.2.6 3.1.6 1.3 0 2.5-1.2 3.3-2.5.5-.8.8-1.4 1.1-2.3.1-.3.2-.6.2-.9.1-3.9-2.9-6.8-6.2-6.8z" />
                </svg>
                Get the app
              </a>

              <a
                href="#how-it-works"
                className="text-sm text-neutral-700 underline underline-offset-2"
              >
                Learn how it works
              </a>
            </div>

            {/* micro trust / quick stats */}
            <div className="mt-6 flex flex-wrap gap-4 items-center justify-center md:justify-start text-sm text-neutral-600">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400" /> Save time tagging
              </span>
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-neutral-400" /> Map-forward profiles
              </span>
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-neutral-400" /> Private by design
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SUB-HERO / ONE-LINER */}
      <section className="container max-w-5xl mx-auto px-6 md:px-12 py-8 text-center">
        <p className="text-neutral-700 text-lg">
          Every moment becomes a pin. Every pin becomes a story. Outplann is for people who keep meaning, not metrics.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="container mx-auto px-6 md:px-12 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">How the Memory Graph flows</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left: Steps */}
          <div className="space-y-5">
            {[
              {
                num: "1",
                title: "Create Scrapbooks",
                desc: "Moment pages with photos, captions, stickers, mood tags and flexible layouts — intentionally private or shareable.",
                icon: <Sparkles className="w-6 h-6" aria-hidden />,
              },
              {
                num: "2",
                title: "Scrapbooks → Pins",
                desc: "Each page becomes a geo-pin (auto-detected place + inferred tags) so memories are contextualised to location and time.",
                icon: <MapPin className="w-6 h-6" aria-hidden />,
              },
              {
                num: "3",
                title: "Pins build the Map",
                desc: "A living map aggregates your pins so you can zoom across countries, cities, and moments.",
                icon: <Globe className="w-6 h-6" aria-hidden />,
              },
              {
                num: "4",
                title: "Map becomes Profile",
                desc: "Your profile is now a map-first portrait — crafted by the places that shaped you.",
                icon: <Users className="w-6 h-6" aria-hidden />,
              },
            ].map((s) => (
              <div key={s.title} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-700 text-white flex items-center justify-center shadow-md">
                  <span className="font-semibold">{s.num}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-neutral-600 mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Visual / Intelligence panel */}
          <aside className="rounded-2xl p-6 bg-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-8 -top-10 w-48 h-48 rounded-full bg-gradient-to-tr from-indigo-300 to-rose-300 opacity-30 blur-2xl" />
            <h4 className="font-semibold text-lg mb-2">Soft AI • Memory Graph</h4>
            <p className="text-sm text-neutral-600 mb-4">
              Outplann lightly infers tags (place, vibe, season) to keep your memories organised without asking you to micro-manage. It’s intelligence that respects privacy.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-lg border text-sm">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Auto-place</div>
                <div className="text-xs text-neutral-500 mt-1">Geolocation + reverse lookups</div>
              </div>
              <div className="p-3 rounded-lg border text-sm">
                <div className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Vibe tags</div>
                <div className="text-xs text-neutral-500 mt-1">Mood inference from captions & visuals</div>
              </div>
              <div className="p-3 rounded-lg border text-sm">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Timeline</div>
                <div className="text-xs text-neutral-500 mt-1">Automatic chronological ordering</div>
              </div>
              <div className="p-3 rounded-lg border text-sm">
                <div className="flex items-center gap-2"><Compass className="w-4 h-4" /> Map-first</div>
                <div className="text-xs text-neutral-500 mt-1">Profiles that show where you’ve lived</div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="container mx-auto px-6 md:px-12 py-10">
        <h2 className="text-2xl font-bold mb-6 text-center">Features</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <article
              key={f.title}
              className={`rounded-2xl p-6 bg-gradient-to-br ${gradients[i % gradients.length]} text-white shadow-lg transform hover:-translate-y-1 transition`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/10 grid place-items-center">
                  {f.icon({ className: "w-6 h-6" })}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{f.title}</h3>
                  <p className="mt-2 text-sm text-white/90">{f.desc}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CORE STRUCTURE EXCERPT */}
      <section className="container mx-auto px-6 md:px-12 py-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-2">Core structure (excerpt)</h3>
          <p className="text-sm text-neutral-700">
            The platform is organised around a simple flow: <strong>Moment → Scrapbook → Pin → Map → Profile → Discovery</strong>.
            This “Memory Graph” approach makes memories discoverable and meaningful while keeping the UX calm and intuitive.
          </p>

          <p className="mt-3 text-xs text-neutral-500">
            (Source document uploaded to the project repository — team reference available internally.)
          </p>
        </div>
      </section>

      {/* FINAL CTA / FOOTER */}
      <footer className="py-12">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <div className="inline-block rounded-3xl p-6 bg-gradient-to-r from-indigo-600 to-rose-500 text-white shadow-xl">
            <h4 className="text-xl font-bold">Start mapping your world</h4>
            <p className="text-sm text-white/90 mt-2 mb-4">
              Create your first scrapbook and see your life in maps. Outplann is on the App Store.
            </p>
            <a
              href="https://apps.apple.com/in/app/outplann/id6753912652"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-5 py-3 bg-white text-black rounded-lg font-semibold hover:bg-neutral-100 transition"
              aria-label="Open Outplann in the App Store"
            >
              Download (App Store)
            </a>
          </div>

          <p className="mt-6 text-xs text-neutral-500">© {new Date().getFullYear()} Outplann — All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
