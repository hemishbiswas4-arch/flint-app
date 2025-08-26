"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SpotlightPlace {
  name: string;
  description: string;
  category: string;
  rating?: number;
  lat: number;
  lng: number;
  placeId: string;
}

export default function Spotlight({
  location,
}: {
  location: { name: string; lat: number; lng: number } | null;
}) {
  const [places, setPlaces] = useState<SpotlightPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);

  // 🔄 Fetch spotlight data
  useEffect(() => {
    if (!location?.lat || !location?.lng) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/spotlight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location, radius: 15 }),
        });
        const data = await res.json();
        setPlaces(data.suggestions || []);
      } catch (err) {
        console.error("Failed to fetch spotlight:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location]);

  // ⏱ Auto-advance every 5s
  useEffect(() => {
    if (places.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % places.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [places]);

  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + places.length) % places.length);
  const nextSlide = () =>
    setCurrent((prev) => (prev + 1) % places.length);

  return (
    <section className="w-full max-w-2xl mx-auto py-8">
      <h2 className="text-xl font-bold text-center mb-6">🌟 Spotlight</h2>

      {loading ? (
        <p className="text-muted-foreground text-center">
          Finding trending spots…
        </p>
      ) : places.length === 0 ? (
        <p className="text-muted-foreground text-center">
          No spotlight places available right now.
        </p>
      ) : (
        <div className="relative">
          {/* Animate slide */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -50 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <Card className="overflow-hidden rounded-2xl shadow-lg">
                <CardContent className="p-0">
                  <div className="h-48 bg-gradient-to-br from-indigo-300 to-purple-400 flex items-center justify-center text-5xl text-white">
                    🌍
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-1">
                      {places[current].name}
                    </h3>
                    <Badge variant="secondary" className="mb-2">
                      {places[current].category}
                    </Badge>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
                      {places[current].description}
                    </p>
                    {places[current].rating && (
                      <p className="mt-1 text-xs font-medium">
                        ⭐ {places[current].rating.toFixed(1)}
                      </p>
                    )}
                    <Button
                      asChild
                      variant="link"
                      size="sm"
                      className="p-0 mt-2"
                    >
                      <a
                        href={`https://www.google.com/maps/place/?q=place_id:${places[current].placeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open in Maps
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="flex justify-center mt-3 gap-2">
            {places.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full cursor-pointer ${
                  i === current ? "bg-primary" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
