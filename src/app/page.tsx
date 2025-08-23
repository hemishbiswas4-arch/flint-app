// Location: src/app/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Unlock, MapPin, Sparkles, ExternalLink, ArrowLeft, Crosshair } from 'lucide-react';
import styles from './Home.module.css';
import Image from 'next/image';
import MapComponent from './components/MapComponent';

// --- TYPES ---
type ItineraryStop = { name: string; description: string; category: string; locked: boolean; lat: number; lng: number; placeId: string; };
type LocationState = { name: string; lat: number | null; lng: number | null; };


// --- NEW SIGN-OUT BUTTON COMPONENT ---
function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    // Call the API route to clear the session cookie
    await fetch('/api/auth/session-logout', { method: 'POST' });
    // Redirect the user to the sign-in page
    router.push('/signin');
  };

  return (
    <button onClick={handleSignOut} className={styles.authButton}>
      Sign Out
    </button>
  );
}


// --- LOCATION SEARCH COMPONENT (No changes needed) ---
const LocationSearchInput = ({ value, onLocationSelect, isScriptLoaded }: { value: string, onLocationSelect: (location: LocationState) => void, isScriptLoaded: boolean }) => {
  const [inputValue, setInputValue] = useState(value);
  const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isScriptLoaded && window.google && inputRef.current && !autoCompleteRef.current) {
      autoCompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current);
      autoCompleteRef.current.addListener("place_changed", () => {
        const place = autoCompleteRef.current?.getPlace();
        if (place?.geometry?.location && place.formatted_address) { onLocationSelect({ name: place.formatted_address, lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }); setInputValue(place.formatted_address); }
      });
    }
  }, [isScriptLoaded, onLocationSelect]);
  useEffect(() => { setInputValue(value); }, [value]);

  return <div className={styles.inputWrapper}><MapPin size={18} className={styles.inputIcon} /><input ref={inputRef} type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} className={styles.filterInput} placeholder={isScriptLoaded ? "Search a city..." : "Loading Maps..."} disabled={!isScriptLoaded} /></div>;
};


// --- MAIN HOME COMPONENT ---
export default function Home() {
const [location, setLocation] = useState<LocationState>({ name: '', lat: null, lng: null }); // CHANGED THIS LINE
  const [radius, setRadius] = useState(5);
  const [groupType, setGroupType] = useState('Friends');
  const [duration, setDuration] = useState('Half-day (~4 hrs)');
  const [theme, setTheme] = useState('Relaxing');
  const [itinerary, setItinerary] = useState<ItineraryStop[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMapsScriptLoaded, setMapsScriptLoaded] = useState(false);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);
  const [seenPlaces, setSeenPlaces] = useState<string[]>([]);
  const [view, setView] = useState<'controls' | 'itinerary'>('controls');

  useEffect(() => {
    const scriptId = "google-maps-script";
    if (window.google?.maps) { setMapsScriptLoaded(true); return; }
    if (document.getElementById(scriptId)) { return; }
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,directions`;
    script.async = true; script.defer = true;
    script.onload = () => setMapsScriptLoaded(true);
    script.onerror = () => setError("Failed to load Google Maps.");
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
      setItinerary(null); setSeenPlaces([]); setView('controls');
  }, [location, radius, theme, groupType, duration]);

  const handleLockToggle = (indexToToggle: number) => {
    if (!itinerary) return;
    const updatedStops = itinerary.map((stop, index) => index === indexToToggle ? { ...stop, locked: !stop.locked } : stop);
    setItinerary(updatedStops);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
            try {
                const response = await fetch(geocodeUrl);
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    const address = data.results[0].formatted_address;
                    setLocation({ name: address, lat: latitude, lng: longitude });
                } else {
                    setLocation({ name: "Current Location", lat: latitude, lng: longitude });
                }
            } catch (error) {
                console.error("Error reverse geocoding:", error);
                setError("Could not fetch location name.");
            }
        }, (error) => {
            setError("Unable to retrieve your location. Please grant permission.");
            console.error("Geolocation error:", error);
        });
    } else {
        setError("Geolocation is not supported by this browser.");
    }
  };

  const generateItinerary = async () => {
    if (!location.lat || !location.lng) { setError("Please select a valid location."); return; }
    setLoading(true); setError(null); setSelectedStopIndex(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, radius, groupType, duration, theme, currentItinerary: itinerary || [], seenPlaces: seenPlaces }),
      });
      if (!response.ok) { 
        const errorData = await response.json(); 
        throw new Error(errorData.message || 'AI generation failed'); 
      }
      const responseData = await response.json();
      const validStops: ItineraryStop[] = responseData.stops.filter((stop: { lat: number; lng: number; }) => typeof stop.lat === 'number' && typeof stop.lng === 'number');
      setItinerary(validStops);
      const newSeen = new Set(seenPlaces);
      validStops.forEach(stop => newSeen.add(stop.name));
      setSeenPlaces(Array.from(newSeen));
      setView('itinerary');
    } catch (err) {
      if (err instanceof Error) { setError(err.message); } 
      else { setError("An unknown error occurred."); }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.mapContainer}>
        {isMapsScriptLoaded ? <MapComponent stops={itinerary || []} selectedStopIndex={selectedStopIndex} onMarkerClick={setSelectedStopIndex} /> : <div className={styles.mapLoading}>Loading Map...</div>}
      </div>
      <div className={styles.authHeader}>
        {/* REPLACED with the new SignOutButton */}
        <SignOutButton />
      </div>
      <div className={styles.panel}>
        <div className={`${styles.view} ${view === 'controls' ? styles.viewActive : ''}`}>
          <div className={styles.header}>
            <h1 className={styles.title}>Outplann</h1>
            <p className={styles.subtitle}>Spark your next adventure.</p>
          </div>
          
          <div className={styles.locationGrid}>
            <div className={styles.locationSearch}>
                <label className={styles.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Location</span>
                    <button onClick={handleGetCurrentLocation} className={styles.locationButton}>
                        <Crosshair size={14} /> Use Current
                    </button>
                </label>
                <LocationSearchInput value={location.name} onLocationSelect={setLocation} isScriptLoaded={isMapsScriptLoaded} />
            </div>
            <div className={styles.locationRadius}>
                <label htmlFor="radius" className={styles.label}>Search Radius: <strong>{radius} km</strong></label>
                <input id="radius" type="range" min="1" max="25" value={radius} onChange={(e) => setRadius(Number(e.target.value))} className={styles.slider} />
            </div>
          </div>

          <div className={styles.controlsGrid}>
            <div>
              <label className={styles.label}>Group</label>
              <select value={groupType} onChange={e => setGroupType(e.target.value)} className={styles.filterSelect}>
                <option>Date</option> <option>Friends</option> <option>Solo</option> <option>Family</option>
              </select>
            </div>
            <div>
              <label className={styles.label}>Time</label>
              <select value={duration} onChange={e => setDuration(e.target.value)} className={styles.filterSelect}>
                <option>Quick (~2 hrs)</option> <option>Half-day (~4 hrs)</option> <option>All day</option>
              </select>
            </div>
            <div>
              <label className={styles.label}>Theme</label>
              <select value={theme} onChange={e => setTheme(e.target.value)} className={styles.filterSelect}>
                <option>Relaxing</option> <option>Active</option> <option>Creative</option>
                <option>Foodie</option> <option>Entertainment</option> <option>Romantic</option>
              </select>
            </div>
          </div>

          <button onClick={() => generateItinerary()} disabled={loading || !isMapsScriptLoaded} className={styles.sparkButton}>
            <Sparkles size={20} /> {loading ? 'Sparking...' : 'Spark Itinerary'}
          </button>
          {error && <p className={styles.errorText}>{error}</p>}
        </div>
        <div className={`${styles.view} ${view === 'itinerary' ? styles.viewActive : ''}`}>
          <div className={styles.itineraryHeader}>
            <button onClick={() => setView('controls')} className={styles.backButton}><ArrowLeft size={18} /> Back</button>
            <h2 className={styles.itineraryTitle}>Your Path</h2>
            <button onClick={() => generateItinerary()} disabled={loading} className={styles.reshuffleButton}>
              {loading ? 'Reshuffling...' : 'Reshuffle'}
            </button>
          </div>
          <div className={styles.palette}>
            {itinerary?.map((stop, index) => (
              <div key={`${stop.name}-${index}`} className={`${styles.paletteStop} ${selectedStopIndex === index ? styles.selectedStop : ''}`} onClick={() => setSelectedStopIndex(index)}>
                <div className={styles.stopHeader}>
                  <h3 className={styles.stopName}>{index+1}. {stop.name}</h3>
                  <div className={styles.headerActions}>
                    <span className={styles.categoryTag}>{stop.category}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleLockToggle(index); }} className={styles.lockButton}>{stop.locked ? <Lock size={16} /> : <Unlock size={16} />}</button>
                  </div>
                </div>
                <p className={styles.stopDescription}>{stop.description}</p>
                <div className={styles.stopFooter}>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.name)}&query_place_id=${stop.placeId}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className={styles.mapLink}>Open in Maps <ExternalLink size={14} /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}