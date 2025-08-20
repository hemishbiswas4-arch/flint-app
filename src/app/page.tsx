// Location: src/app/page.tsx
"use client";

import React, { useState, useEffect, useRef, memo } from 'react';
import { Lock, Unlock, MapPin, IndianRupee, Sparkles, ExternalLink, ArrowLeft } from 'lucide-react';
import styles from './Home.module.css';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

// --- TYPES ---
type ItineraryStop = { name: string; description: string; category: string; locked: boolean; lat: number; lng: number; placeId: string; };
type LocationState = { name: string; lat: number | null; lng: number | null; };

// --- NEW LOGIN BUTTONS COMPONENT ---
function AuthButtons() {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <div className={styles.authContainer}>
        {session.user.image && (
          <Image 
            src={session.user.image} 
            alt={session.user.name || "User"} 
            width={32} 
            height={32} 
            className={styles.avatar}
          />
        )}
        <span className={styles.authText}>Signed in as {session.user.name}</span>
        <button onClick={() => signOut()} className={styles.authButton}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <button onClick={() => signIn('google')} className={styles.authButton}>
        Sign in with Google
      </button>
    </div>
  );
}

// --- MAP & LOCATION COMPONENTS (No Changes) ---
const MapComponent = memo(({ stops, selectedStopIndex, onMarkerClick }: { stops: ItineraryStop[], selectedStopIndex: number | null, onMarkerClick: (index: number) => void }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<(google.maps.Marker | null)[]>([]);
    const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

    useEffect(() => {
        if (mapRef.current && !googleMapRef.current) {
            googleMapRef.current = new window.google.maps.Map(mapRef.current, {
                center: { lat: 12.9716, lng: 77.5946 }, zoom: 12, disableDefaultUI: true,
                styles: [ { "featureType": "all", "elementType": "labels.text.fill", "stylers": [ { "color": "#ffffff" } ] }, { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [ { "color": "#000000" }, { "lightness": 13 } ] }, { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [ { "color": "#000000" } ] }, { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [ { "color": "#144b53" }, { "lightness": 14 }, { "weight": 1.4 } ] }, { "featureType": "landscape", "elementType": "all", "stylers": [ { "color": "#08304b" } ] }, { "featureType": "poi", "elementType": "geometry", "stylers": [ { "color": "#0c4152" }, { "lightness": 5 } ] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [ { "color": "#000000" } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#0b434f" }, { "lightness": 25 } ] }, { "featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [ { "color": "#000000" } ] }, { "featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [ { "color": "#0b3d51" }, { "lightness": 16 } ] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [ { "color": "#000000" } ] }, { "featureType": "transit", "elementType": "all", "stylers": [ { "color": "#146474" } ] }, { "featureType": "water", "elementType": "all", "stylers": [ { "color": "#021019" } ] } ]
            });
        }
    }, []);

    useEffect(() => {
        if (!googleMapRef.current || !window.google?.maps?.DirectionsService) return;
        markersRef.current.forEach(marker => marker?.setMap(null));
        markersRef.current = [];
        if (directionsRendererRef.current) { directionsRendererRef.current.setMap(null); }
        if (stops.length === 0) return;

        const bounds = new window.google.maps.LatLngBounds();
        markersRef.current = stops.map((stop, index) => {
            const position = { lat: stop.lat, lng: stop.lng };
            bounds.extend(position);
            const isSelected = index === selectedStopIndex;
            const marker = new window.google.maps.Marker({ position, map: googleMapRef.current, label: { text: `${index + 1}`, color: isSelected ? '#111827' : '#f9fafb' }, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 15, fillColor: isSelected ? '#ffffff' : '#4f46e5', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2 }, });
            marker.addListener('click', () => onMarkerClick(index));
            return marker;
        });
        googleMapRef.current.fitBounds(bounds, 100);

        if (stops.length > 1) {
            const directionsService = new window.google.maps.DirectionsService();
            directionsRendererRef.current = new window.google.maps.DirectionsRenderer({ map: googleMapRef.current, suppressMarkers: true, polylineOptions: { strokeColor: '#c7d2fe', strokeOpacity: 0.9, strokeWeight: 5 } });
            const origin = { lat: stops[0].lat, lng: stops[0].lng };
            const destination = { lat: stops[stops.length - 1].lat, lng: stops[stops.length - 1].lng };
            const waypoints = stops.slice(1, -1).map(stop => ({ location: { lat: stop.lat, lng: stop.lng }, stopover: true }));
            directionsService.route({ origin, destination, waypoints, travelMode: google.maps.TravelMode.DRIVING }, (result, status) => { if (status === 'OK' && directionsRendererRef.current) { directionsRendererRef.current.setDirections(result); } });
        }
    }, [stops, selectedStopIndex, onMarkerClick]);
    return <div ref={mapRef} className={styles.map} />;
});
MapComponent.displayName = 'MapComponent';

const LocationSearchInput = ({ value, onLocationSelect, isScriptLoaded }: { value: string, onLocationSelect: (location: LocationState) => void, isScriptLoaded: boolean }) => {
  const [inputValue, setInputValue] = useState(value);
  const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isScriptLoaded && window.google && inputRef.current && !autoCompleteRef.current) {
      autoCompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, { types: ["(cities)"], componentRestrictions: { country: "in" } });
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
  const [location, setLocation] = useState<LocationState>({ name: 'Indiranagar, Bengaluru', lat: 12.9719, lng: 77.6412 });
  const [radius, setRadius] = useState(5);
  const [groupType, setGroupType] = useState('Friends');
  const [duration, setDuration] = useState('Half-day (~4 hrs)');
  const [budget, setBudget] = useState('3000');
  const [theme, setTheme] = useState('Cozy');
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
  }, [location, radius, theme, groupType, duration, budget]);

  const handleLockToggle = (indexToToggle: number) => {
    if (!itinerary) return;
    const updatedStops = itinerary.map((stop, index) => index === indexToToggle ? { ...stop, locked: !stop.locked } : stop);
    setItinerary(updatedStops);
  };

  const generateItinerary = async () => {
    if (!location.lat || !location.lng) { setError("Please select a valid location."); return; }
    setLoading(true); setError(null); setSelectedStopIndex(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, radius, groupType, duration, budget, theme, currentItinerary: itinerary || [], seenPlaces: seenPlaces }),
      });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'AI generation failed'); }
      const responseData = await response.json();
      const validStops: ItineraryStop[] = responseData.stops.filter((stop: { lat: number; lng: number; }) => typeof stop.lat === 'number' && typeof stop.lng === 'number');
      setItinerary(validStops);
      const newSeen = new Set(seenPlaces);
      validStops.forEach(stop => newSeen.add(stop.name));
      setSeenPlaces(Array.from(newSeen));
      setView('itinerary');
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

  return (
    <main className={styles.page}>
      <div className={styles.mapContainer}>
        {isMapsScriptLoaded ? <MapComponent stops={itinerary || []} selectedStopIndex={selectedStopIndex} onMarkerClick={setSelectedStopIndex} /> : <div className={styles.mapLoading}>Loading Map...</div>}
      </div>
      <div className={styles.authHeader}>
        <AuthButtons />
      </div>

      <div className={styles.panel}>
        {/* Controls View */}
        <div className={`${styles.view} ${view === 'controls' ? styles.viewActive : ''}`}>
          <div className={styles.header}>
            <h1 className={styles.title}>Flint</h1>
            <p className={styles.subtitle}>Spark your next adventure.</p>
          </div>
          <div className={styles.controlsGrid}>
            <div className="col-span-2">
              <label className={styles.label}>Location</label>
              <LocationSearchInput value={location.name} onLocationSelect={setLocation} isScriptLoaded={isMapsScriptLoaded} />
            </div>
            <div className="col-span-2">
              <label htmlFor="radius" className={styles.label}>Search Radius: <strong>{radius} km</strong></label>
              <input id="radius" type="range" min="1" max="25" value={radius} onChange={(e) => setRadius(Number(e.target.value))} className={styles.slider} />
            </div>
            <div>
              <label className={styles.label}>Group</label>
              <select value={groupType} onChange={e => setGroupType(e.target.value)} className={styles.filterSelect}><option>Date</option><option>Family</option><option>Friends</option><option>Solo</option></select>
            </div>
            <div>
              <label className={styles.label}>Time</label>
              <select value={duration} onChange={e => setDuration(e.target.value)} className={styles.filterSelect}><option>Quick (~2 hrs)</option><option>Half-day (~4 hrs)</option><option>All day</option></select>
            </div>
            <div>
              <label className={styles.label}>Budget (₹)</label>
              <div className={styles.inputWrapper}><IndianRupee size={18} className={styles.inputIcon} /><input type="number" step="500" value={budget} onChange={e => setBudget(e.target.value)} className={styles.filterInput} /></div>
            </div>
            <div>
              <label className={styles.label}>Theme</label>
              <select value={theme} onChange={e => setTheme(e.target.value)} className={styles.filterSelect}><option>Sporty</option><option>Picnic</option><option>Cozy</option><option>Artsy</option><option>Luxe</option><option>Coffee Crawl</option></select>
            </div>
          </div>
          <button onClick={() => generateItinerary()} disabled={loading || !isMapsScriptLoaded} className={styles.sparkButton}>
            <Sparkles size={20} /> {loading ? 'Sparking...' : 'Spark Itinerary'}
          </button>
          {error && <p className={styles.errorText}>{error}</p>}
        </div>

        {/* Itinerary View */}
        <div className={`${styles.view} ${view === 'itinerary' ? styles.viewActive : ''}`}>
          <div className={styles.itineraryHeader}>
              <button onClick={() => setView('controls')} className={styles.backButton}><ArrowLeft size={18} /> Back</button>
              <h2 className={styles.itineraryTitle}>Your Path</h2>
              <button onClick={() => generateItinerary()} disabled={loading} className={styles.reshuffleButton}>{loading ? '...' : 'Reshuffle'}</button>
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