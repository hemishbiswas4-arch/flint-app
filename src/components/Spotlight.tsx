"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SpotlightPlace {
  name: string;
  description: string;
  category: string;
  rating?: number;
  lat: number;
  lng: number;
  placeId: string;
}

export default function Spotlight({ location }: { location: { name: string; lat: number; lng: number } | null }) {
  const [places, setPlaces] = useState<SpotlightPlace[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">🌟 Spotlight</h2>
        {places.length > 0 && (
          <Button variant="ghost" size="sm">See All</Button>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Finding trending spots…</p>
      ) : places.length === 0 ? (
        <p className="text-muted-foreground text-sm">No spotlight places available right now.</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:overflow-visible">
          {places.map((p, i) => (
            <Card
              key={i}
              className="relative min-w-[240px] sm:min-w-0 overflow-hidden group hover:shadow-md transition"
            >
              <CardContent className="p-0">
                <div className="h-36 bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center">
                  <span className="text-muted-foreground">🌍</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-base mb-1">{p.name}</h3>
                  <Badge variant="secondary" className="mb-2">{p.category}</Badge>
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                  {p.rating && (
                    <p className="mt-2 text-xs">⭐ {p.rating.toFixed(1)}</p>
                  )}
                  <Button asChild variant="link" size="sm" className="p-0 mt-1">
                    <a
                      href={`https://www.google.com/maps/place/?q=place_id:${p.placeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open in Maps
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
