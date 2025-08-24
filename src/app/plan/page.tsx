'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { getAuth, User } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';

import MapComponent from '@/app/components/MapComponent';
import PlannerWizard from '@/app/components/PlannerWizard';
import ItineraryPanel from '@/app/components/ItineraryPanel';
import SignInModal from '@/app/components/SignInModal';
import { UserDisplay } from '@/app/components/AuthButtons';
import Header from '@/components/header';

// --- TYPES ---
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
    theme: 'Relaxing'
  });
  
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const scriptId = "google-maps-script";
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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const generateItinerary = async (currentFilters: FilterState, isReshuffle: boolean) => {
    if (!currentFilters.location.lat || !currentFilters.location.lng) {
      setError("Please select a valid location.");
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
      
      // FIX: Cast the responseData.stops to an array of ItineraryStop to resolve 'any' type error
      const validStops: ItineraryStop[] = (responseData.stops as any[]).filter(
        (stop: any) => typeof stop.lat === 'number' && typeof stop.lng === 'number'
      );
      
      setItinerary(validStops);
      const newSeen = new Set(isReshuffle ? seenPlaces : []);
      validStops.forEach(stop => newSeen.add(stop.name));
      setSeenPlaces(Array.from(newSeen));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
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
    <div className="flex flex-col h-screen">
      <Header user={user} isAuthLoading={isAuthLoading} />

      <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-[40%_60%] xl:grid-cols-[30%_70%]">
        {/* Left Panel: Controls */}
        <div className="border-r h-[calc(100vh-3.5rem)] overflow-y-auto">
          {itinerary ? (
            <ItineraryPanel 
              itinerary={itinerary} 
              setItinerary={setItinerary} 
              selectedStopIndex={selectedStopIndex} 
              setSelectedStopIndex={setSelectedStopIndex} 
              onReshuffle={(currentFilters) => generateItinerary(currentFilters, true)} 
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

        {/* Right Panel: Map (hidden on mobile) */}
        <div className="h-[calc(100vh-3.5rem)] hidden lg:block">
          {isMapsScriptLoaded ? (
            <MapComponent 
              stops={itinerary || []} 
              selectedStopIndex={selectedStopIndex} 
              onMarkerClick={setSelectedStopIndex} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">Loading Map...</div>
          )}
        </div>
      </main>

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