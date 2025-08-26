'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SpotlightPlace = {
  name: string;
  description: string;
  category: string;
  rating?: number;
  lat: number;
  lng: number;
  placeId: string;
};

export default function SpotlightPage() {
  const [places, setPlaces] = useState<SpotlightPlace[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSpotlight = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/spotlight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: { name: 'Delhi', lat: 28.61, lng: 77.23 },
          radius: 15
        })
      });

      const data = await res.json();
      setPlaces(data.suggestions || []);
    } catch (err) {
      console.error("Failed to load spotlight:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpotlight();
    const interval = setInterval(fetchSpotlight, 30 * 60 * 1000); // refresh every 30 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">✨ Spotlight</h1>
        <Button onClick={fetchSpotlight} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {loading && <p className="text-muted-foreground">Loading spotlight picks...</p>}

      {!loading && places.length === 0 && (
        <p className="text-muted-foreground">No spotlight places available right now.</p>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {places.map((place) => (
          <Card key={place.placeId} className="rounded-2xl shadow-md hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>{place.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{place.category}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{place.description}</p>
              {place.rating && (
                <p className="mt-2 text-sm font-medium">⭐ {place.rating.toFixed(1)}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
