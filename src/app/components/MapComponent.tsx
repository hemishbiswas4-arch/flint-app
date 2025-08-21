// Location: src/app/components/MapComponent.tsx
'use client';
import React, { memo, useRef, useEffect } from 'react';
import styles from '@/app/Home.module.css';

// Define the Stop type here so the component is self-contained
type ItineraryStop = {
  lat: number;
  lng: number;
};

const MapComponent = memo(({ stops, selectedStopIndex, onMarkerClick }: { stops: ItineraryStop[], selectedStopIndex: number | null, onMarkerClick: (index: number) => void }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<(google.maps.Marker | null)[]>([]);
    const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

    useEffect(() => {
        if (mapRef.current && !googleMapRef.current) {
            googleMapRef.current = new window.google.maps.Map(mapRef.current, {
                center: { lat: 12.9716, lng: 77.5946 },
                zoom: 12,
                disableDefaultUI: true,
                styles: [ { "featureType": "all", "elementType": "labels.text.fill", "stylers": [ { "color": "#ffffff" } ] }, { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [ { "color": "#000000" }, { "lightness": 13 } ] }, { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [ { "color": "#000000" } ] }, { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [ { "color": "#144b53" }, { "lightness": 14 }, { "weight": 1.4 } ] }, { "featureType": "landscape", "elementType": "all", "stylers": [ { "color": "#08304b" } ] }, { "featureType": "poi", "elementType": "geometry", "stylers": [ { "color": "#0c4152" }, { "lightness": 5 } ] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [ { "color": "#000000" } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#0b434f" }, { "lightness": 25 } ] }, { "featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [ { "color": "#000000" } ] }, { "featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [ { "color": "#0b3d51" }, { "lightness": 16 } ] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [ { "color": "#000000" } ] }, { "featureType": "transit", "elementType": "all", "stylers": [ { "color": "#146474" } ] }, { "featureType": "water", "elementType": "all", "stylers": [ { "color": "#021019" } ] } ]
            });
        }
    }, []);

    useEffect(() => {
        if (!googleMapRef.current || !window.google?.maps?.DirectionsService || !stops) return;
        
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

export default MapComponent;