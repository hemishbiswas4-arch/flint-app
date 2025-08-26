// src/app/components/PathBuilder.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ItineraryStop } from '../plan/page';
import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export type PathPlace = Omit<ItineraryStop, 'locked' | 'description' | 'category'> & {
    googlePlaceId: string;
};

interface PathBuilderProps {
  onPathChange: (path: PathPlace[]) => void;
  isMapsScriptLoaded: boolean;
}

export default function PathBuilder({ onPathChange, isMapsScriptLoaded }: PathBuilderProps) {
  const [path, setPath] = useState<PathPlace[]>([]);
  const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    onPathChange(path);
  }, [path, onPathChange]);

  // FIX: handlePlaceSelect is wrapped in useCallback to prevent stale state.
  const handlePlaceSelect = useCallback(() => {
    const place = autoCompleteRef.current?.getPlace();
    if (place?.geometry?.location && place.name && place.place_id) {
        const newPlace: PathPlace = {
            name: place.name,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            placeId: place.place_id,
            googlePlaceId: place.place_id,
        };
        
        // This `prevPath => ...` syntax ensures we always have the latest version of the path.
        setPath(prevPath => [...prevPath, newPlace]);

        if (inputRef.current) inputRef.current.value = "";
    }
  }, []); // No dependencies needed here due to the functional update above.

  useEffect(() => {
    if (isMapsScriptLoaded && inputRef.current && !autoCompleteRef.current) {
      autoCompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ['place_id', 'name', 'geometry.location'],
      });
      // The listener is set up once and calls the stable useCallback function.
      autoCompleteRef.current.addListener("place_changed", handlePlaceSelect);
    }
  }, [isMapsScriptLoaded, handlePlaceSelect]);

  const removePlace = (index: number) => {
    setPath(prevPath => prevPath.filter((_, i) => i !== index));
  };

  return (
    <Card className="bg-secondary/50">
      <CardContent className="pt-6">
        <div className="space-y-2">
          <Label>Where did you go?</Label>
          <Input
            ref={inputRef}
            type="text"
            placeholder={isMapsScriptLoaded ? "Search for and add places..." : "Loading maps..."}
            disabled={!isMapsScriptLoaded}
          />
        </div>

        {path.length > 0 && (
          <div className="mt-6 relative">
            {/* The vertical connector line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border -z-10" />
            <ul className="space-y-2">
              {path.map((place, index) => (
                <li key={`${place.googlePlaceId}-${index}`} className="flex items-center gap-4">
                  <div className="bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center font-bold z-10 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-grow p-3 bg-background rounded-md border flex items-center justify-between">
                    <span className="font-medium">{place.name}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removePlace(index)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}