// src/app/components/PlannerWizard.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { Sparkles } from 'lucide-react';
import { FilterState, LocationState } from '../plan/page';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const LocationSearchInput = ({
  value,
  onLocationSelect,
  isMapsScriptLoaded,
}: {
  value: string;
  onLocationSelect: (location: LocationState) => void;
  isMapsScriptLoaded: boolean;
}) => {
  const [inputValue, setInputValue] = useState(value);
  const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (
      isMapsScriptLoaded &&
      window.google &&
      inputRef.current &&
      !autoCompleteRef.current
    ) {
      autoCompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current
      );
      autoCompleteRef.current.addListener('place_changed', () => {
        const place = autoCompleteRef.current?.getPlace();
        if (place?.geometry?.location && place.formatted_address) {
          onLocationSelect({
            name: place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
          setInputValue(place.formatted_address);
        }
      });
    }
  }, [isMapsScriptLoaded, onLocationSelect]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <Input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder={isMapsScriptLoaded ? 'Search a city...' : 'Loading Maps...'}
      disabled={!isMapsScriptLoaded}
    />
  );
};

type PlannerWizardProps = {
  isMapsScriptLoaded: boolean;
  user: User | null;
  onGenerate: (filters: FilterState) => void;
  onRequireSignIn: (filters: FilterState) => void;
  loading: boolean;
  error: string | null;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
};

export default function PlannerWizard({
  isMapsScriptLoaded,
  user,
  onGenerate,
  onRequireSignIn,
  loading,
  error,
  filters,
  setFilters,
}: PlannerWizardProps) {
  const setFilter = <T extends keyof FilterState>(
    key: T,
    value: FilterState[T]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateClick = () => {
    if (user) {
      onGenerate(filters);
    } else {
      onRequireSignIn(filters);
    }
  };

  const choiceCardClass = (isSelected: boolean) =>
    cn(
      'flex items-center justify-center text-center px-4 py-3 min-w-[110px] rounded-xl border cursor-pointer font-medium transition-all shadow-sm',
      isSelected
        ? 'bg-primary text-primary-foreground shadow-md scale-105'
        : 'bg-card text-foreground hover:bg-muted'
    );

  return (
    <div className="p-4 sm:p-6 w-full h-full flex flex-col">
      {/* Title */}
      <div className="text-center mb-8 flex-shrink-0">
        <h1 className="text-3xl font-bold">Your perfect trip, planned by AI</h1>
        <p className="text-muted-foreground mt-2">
          Tell us your preferences and we&apos;ll craft your itinerary.
        </p>
      </div>

      {/* Form Section */}
      <div className="space-y-6 flex-grow overflow-y-auto pr-2">
        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Where are you going?</Label>
          <LocationSearchInput
            value={filters.location.name}
            onLocationSelect={(loc) => setFilter('location', loc)}
            isMapsScriptLoaded={isMapsScriptLoaded}
          />
        </div>

        {/* Radius */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Search Radius</Label>
            <span>{filters.radius} km</span>
          </div>
          <Slider
            defaultValue={[15]}
            max={50}
            step={1}
            value={[filters.radius]}
            onValueChange={(value: number[]) => setFilter('radius', value[0])}
          />
        </div>

        {/* Group Type */}
        <div className="space-y-2">
          <Label>Who are you traveling with?</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['Date', 'Friends', 'Solo', 'Family'].map((type) => (
              <div
                key={type}
                onClick={() => setFilter('groupType', type)}
                className={choiceCardClass(filters.groupType === type)}
              >
                {type}
              </div>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="space-y-2">
          <Label>What&apos;s the vibe?</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              'Relaxing',
              'Active',
              'Creative',
              'Foodie',
              'Entertainment',
              'Romantic',
            ].map((theme) => (
              <div
                key={theme}
                onClick={() => setFilter('theme', theme)}
                className={choiceCardClass(filters.theme === theme)}
              >
                {theme}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-auto pt-6 border-t flex-shrink-0">
        <Button
          onClick={handleGenerateClick}
          disabled={loading || !isMapsScriptLoaded}
          size="lg"
          className="w-full rounded-xl text-lg font-semibold"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          {loading ? 'Sparking your itinerary...' : 'Spark Itinerary'}
        </Button>
        {error && (
          <p className="text-sm text-destructive mt-4 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
