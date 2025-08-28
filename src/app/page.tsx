
// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  Users,
  Coffee,
  Utensils,
  Landmark,
  Trees,
  Music,
  MapPin,
} from "lucide-react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";

interface SpotlightPlace {
  name: string;
  description: string;
  category: string;
  placeId: string;
}

const categoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "restaurant":
      return <Utensils className="w-7 h-7 text-white" />;
    case "cafe":
      return <Coffee className="w-7 h-7 text-white" />;
    case "museum":
      return <Landmark className="w-7 h-7 text-white" />;
    case "park":
      return <Trees className="w-7 h-7 text-white" />;
    case "nightlife":
      return <Music className="w-7 h-7 text-white" />;
    default:
      return <MapPin className="w-7 h-7 text-white" />;
  }
};

const gradients = [
  "from-indigo-500 to-purple-600",
  "from-pink-500 to-rose-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
];

export default function HomePage() {
  const [places, setPlaces] = useState<SpotlightPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (err) {
      console.error("❌ Google Sign-In failed:", err);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch("/api/spotlight", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: { lat: latitude, lng: longitude },
              radius: 15,
            }),
          });
          const data = await res.json();
          setPlaces(data.suggestions || []);
        } catch (err) {
          console.error("Failed to fetch spotlight:", err);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLocationDenied(true);
        setLoading(false);
      }
    );
  }, []);

  return (
    <div className="w-full">
      {/* ✅ Desktop Hero */}
      <div className="hidden md:flex flex-col items-center justify-center text-center py-20 bg-neutral-900 text-white">
        <h1 className="text-5xl font-bold mb-4">
          Travel Together. Share Journeys.
        </h1>
        <p className="max-w-2xl text-lg text-neutral-300">
          Outplann is your AI-powered travel companion – discover curated
          itineraries, connect with travelers, and explore smarter through
          community spotlights.
        </p>
        <Link
          href="/plan"
          className="mt-6 px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-neutral-200"
        >
          Start Planning
        </Link>
      </div>

      {/* ✅ Mobile Spotlight */}
      <div className="md:hidden p-4">
        <h2 className="text-lg font-bold mb-4">Spotlight</h2>

        {loading && (
          <div className="flex gap-4 overflow-x-auto pb-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="min-w-[220px] h-[180px] rounded-2xl bg-neutral-200 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && locationDenied && (
          <p className="text-sm text-neutral-500">
            Please allow location to see nearby spotlights.
          </p>
        )}

        {!loading && !locationDenied && places.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-10 scrollbar-hide">
            {places.map((p, i) => (
              <a
                key={i}
                href={`https://www.google.com/maps/place/?q=place_id:${p.placeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative min-w-[220px] h-[180px] rounded-2xl bg-gradient-to-br ${
                  gradients[i % gradients.length]
                } text-white p-5 flex flex-col justify-between shadow-lg`}
              >
                <div className="flex items-center gap-2">
                  {categoryIcon(p.category)}
                  <h3 className="font-semibold text-base line-clamp-2">
                    {p.name}
                  </h3>
                </div>
                <p className="text-sm opacity-90 line-clamp-2">
                  {p.description}
                </p>
              </a>
            ))}
          </div>
        )}

        {/* ✅ Mobile Marketing Banner w/ Sign-In (only if not signed in) */}
        {!user && (
          <div className="mt-8 mb-14 p-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg text-center">
            <h3 className="text-xl font-bold mb-2">What is Outplann?</h3>
            <p className="text-sm text-white/90 mb-4">
              Your AI-powered travel companion — build itineraries, join a global
              travel community, and explore smarter together.
            </p>
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-3 bg-white text-black rounded-lg font-semibold hover:bg-neutral-200 transition"
            >
              Sign in with Google
            </button>
          </div>
        )}
      </div>

      {/* ✅ Mobile bottom nav (only visible after sign-in, 2 icons only) */}
      {user && (
        <div className="md:hidden px-8 py-16 flex justify-around bg-white border-t">
          <Link href="/plan" className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border flex items-center justify-center mb-2">
              <Compass size={24} />
            </div>
            <span className="text-sm">Plan</span>
          </Link>
          <Link href="/community" className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border flex items-center justify-center mb-2">
              <Users size={24} />
            </div>
            <span className="text-sm">Community</span>
          </Link>
        </div>
      )}

      {/* ✅ Desktop Spotlight */}
      <div className="hidden md:block container py-16">
        <h2 className="text-2xl font-bold mb-6">Spotlight Picks</h2>
        {loading ? (
          <p className="text-neutral-500">Loading...</p>
        ) : locationDenied ? (
          <p className="text-neutral-500">
            Please allow location to see nearby spotlights.
          </p>
        ) : places.length === 0 ? (
          <p className="text-neutral-500">No spotlight available.</p>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {places.map((p, i) => (
              <a
                key={i}
                href={`https://www.google.com/maps/place/?q=place_id:${p.placeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl shadow-md border hover:shadow-lg transition bg-white"
              >
                <div className="flex items-center gap-2 mb-2">
                  {categoryIcon(p.category)}
                  <h3 className="font-semibold">{p.name}</h3>
                </div>
                <p className="text-sm text-neutral-600 line-clamp-2">
                  {p.description}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
