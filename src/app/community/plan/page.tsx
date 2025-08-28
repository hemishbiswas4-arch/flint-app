'use client';

import React, { useState, useEffect } from 'react';
import { getAuth, User } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';

import MapComponent from '@/app/components/MapComponent';
import PlannerWizard from '@/app/components/PlannerWizard';
import ItineraryPanel from '@/app/components/ItineraryPanel';
import SignInModal from '@/app/components/SignInModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ItineraryStop = {
  name: string;
  description: string;
  category: string;
  locked: boolean;
  lat: number;
  lng: number;
  placeId: string;
};

export type LocationState = {
  name: string;
  lat: number | null;
  lng: number | null;
};

export type FilterState = {
  location: LocationState;
  radius: number;
  groupType: string;
  duration: string;
  theme: string;
};

export default function PlanPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setAuthLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryStop[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMapsScriptLoaded, setMapsScriptLoaded] = useState(false);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);
  const [seenPlaces, setSeenPlaces] = useState<string[]>([]);
  const [filtersForModal, setFiltersForModal] = useState<FilterState | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    location: { name: '', lat: null, lng: null },
    radius: 15,
    groupType: 'Friends',
    duration: 'Half-day (~4 hrs)',
    theme: 'Relaxing',
  });

  const auth = getAuth(firebaseApp);

  // ✅ Load Google Maps Script
  useEffect(() => {
    const scriptId = 'google-maps-script';
    if (window.google?.maps) {
      setMapsScriptLoaded(true);
      return;
    }
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.addEventListener('load', () => setMapsScriptLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,directions`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  // ✅ Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  // ✅ Generate Itinerary
  const generateItinerary = async (currentFilters: FilterState, isReshuffle: boolean) => {
    if (!currentFilters.location.lat || !currentFilters.location.lng) {
      setError('Please select a valid location.');
      return;
    }
    setLoading(true);
    setError(null);
    setSelectedStopIndex(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentFilters,
          currentItinerary: isReshuffle ? itinerary : [],
          seenPlaces: isReshuffle ? seenPlaces : [],
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'AI generation failed');
      }
      const responseData = await response.json();

      const validStops: ItineraryStop[] = (responseData.stops as unknown[]).filter(
        (stop): stop is ItineraryStop =>
          typeof (stop as ItineraryStop).lat === 'number' &&
          typeof (stop as ItineraryStop).lng === 'number' &&
          typeof (stop as ItineraryStop).name === 'string' &&
          typeof (stop as ItineraryStop).description === 'string' &&
          typeof (stop as ItineraryStop).category === 'string' &&
          typeof (stop as ItineraryStop).locked === 'boolean' &&
          typeof (stop as ItineraryStop).placeId === 'string'
      );

      setItinerary(validStops);
      const newSeen = new Set(isReshuffle ? seenPlaces : []);
      validStops.forEach((stop) => newSeen.add(stop.name));
      setSeenPlaces(Array.from(newSeen));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setItinerary(null);
    setSeenPlaces([]);
    setError(null);
  };

  const handleRequireSignIn = (currentFilters: FilterState) => {
    setFiltersForModal(currentFilters);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 w-full">
        {/* 📱 Mobile: Tabs (switch between Itinerary + Map) */}
        <div className="block lg:hidden h-screen">
          <Tabs defaultValue="plan" className="h-full flex flex-col">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="plan">📋 Plan</TabsTrigger>
              <TabsTrigger value="map">🗺️ Map</TabsTrigger>
            </TabsList>
            <TabsContent value="plan" className="flex-1 overflow-y-auto p-4">
              {itinerary ? (
                <ItineraryPanel
                  itinerary={itinerary}
                  setItinerary={setItinerary}
                  selectedStopIndex={selectedStopIndex}
                  setSelectedStopIndex={setSelectedStopIndex}
                  onReshuffle={() => generateItinerary(filters, true)}
                  onStartOver={handleStartOver}
                  loading={loading}
                  filters={filters}
                />
              ) : (
                <PlannerWizard
                  isMapsScriptLoaded={isMapsScriptLoaded}
                  user={user}
                  onGenerate={(currentFilters) => generateItinerary(currentFilters, false)}
                  onRequireSignIn={handleRequireSignIn}
                  loading={loading}
                  error={error}
                  filters={filters}
                  setFilters={setFilters}
                />
              )}
            </TabsContent>
            <TabsContent value="map" className="flex-1">
              {isMapsScriptLoaded ? (
                <MapComponent
                  stops={itinerary || []}
                  selectedStopIndex={selectedStopIndex}
                  onMarkerClick={setSelectedStopIndex}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                  Loading Map...
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* 💻 Desktop: Side-by-side layout */}
        <div className="hidden lg:grid grid-cols-[40%_60%] xl:grid-cols-[30%_70%] h-screen">
          <div className="border-r overflow-y-auto p-4 space-y-6">
            {itinerary ? (
              <ItineraryPanel
                itinerary={itinerary}
                setItinerary={setItinerary}
                selectedStopIndex={selectedStopIndex}
                setSelectedStopIndex={setSelectedStopIndex}
                onReshuffle={() => generateItinerary(filters, true)}
                onStartOver={handleStartOver}
                loading={loading}
                filters={filters}
              />
            ) : (
              <PlannerWizard
                isMapsScriptLoaded={isMapsScriptLoaded}
                user={user}
                onGenerate={(currentFilters) => generateItinerary(currentFilters, false)}
                onRequireSignIn={handleRequireSignIn}
                loading={loading}
                error={error}
                filters={filters}
                setFilters={setFilters}
              />
            )}
          </div>
          <div>
            {isMapsScriptLoaded ? (
              <MapComponent
                stops={itinerary || []}
                selectedStopIndex={selectedStopIndex}
                onMarkerClick={setSelectedStopIndex}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                Loading Map...
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          if (filtersForModal) {
            generateItinerary(filtersForModal, false);
          }
        }}
      />
    </div>
  );
}
