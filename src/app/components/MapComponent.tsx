// File: src/app/components/MapComponent.tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useDirections } from '../hooks/useDirections';
import { ItineraryStop } from '../plan/page';

type MapComponentProps = {
    stops: ItineraryStop[];
    selectedStopIndex: number | null;
    onMarkerClick: (index: number) => void;
};

export default function MapComponent({ stops, selectedStopIndex, onMarkerClick }: MapComponentProps) {
    const mapRef = useRef<google.maps.Map | null>(null);
    const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
    const directionsResult = useDirections(stops);
    const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
    
    // Initialize map and directions renderer
    useEffect(() => {
        if (!mapRef.current && window.google) {
            mapRef.current = new window.google.maps.Map(document.getElementById('map') as HTMLElement, {
                center: { lat: 34.052235, lng: -118.243683 },
                zoom: 12,
                disableDefaultUI: true,
                styles: [ // Dark theme styles
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
                    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
                    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
                    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
                    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
                    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
                    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
                    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
                    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
                    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
                    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
                    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
                ],
            });

            directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
                suppressMarkers: true, // We will use our own custom markers
                polylineOptions: {
                    strokeColor: '#818cf8',
                    strokeWeight: 4,
                    strokeOpacity: 0.8,
                },
            });
            directionsRendererRef.current.setMap(mapRef.current);
        }
    }, []);

    // Update directions on the map
    useEffect(() => {
        if (directionsResult && directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(directionsResult);
        } else if (directionsRendererRef.current) {
            // This is the corrected line to clear the route
            directionsRendererRef.current.setDirections(null);
        }
    }, [directionsResult]);

    // Update markers and map bounds
    useEffect(() => {
        // Clear previous markers
        markers.forEach(marker => marker.setMap(null));
        const newMarkers: google.maps.Marker[] = [];

        if (mapRef.current && stops.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            
            stops.forEach((stop, index) => {
                const position = new window.google.maps.LatLng(stop.lat, stop.lng);
                bounds.extend(position);

                const isSelected = selectedStopIndex === index;

                const marker = new window.google.maps.Marker({
                    position,
                    map: mapRef.current,
                    label: {
                        text: `${index + 1}`,
                        color: isSelected ? '#ffffff' : '#111827',
                        fontWeight: 'bold',
                    },
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: isSelected ? 12 : 9,
                        fillColor: isSelected ? '#818cf8' : '#ffffff',
                        fillOpacity: 1,
                        strokeWeight: 1,
                        strokeColor: isSelected ? '#ffffff' : '#818cf8',
                    },
                    zIndex: isSelected ? 10 : 1,
                });
                
                marker.addListener('click', () => onMarkerClick(index));
                newMarkers.push(marker);
            });
            
            mapRef.current.fitBounds(bounds, 100); // 100px padding
            setMarkers(newMarkers);
        }
        
        // Cleanup function
        return () => {
            newMarkers.forEach(marker => marker.setMap(null));
        };
    }, [stops, selectedStopIndex, onMarkerClick]);


    return <div id="map" style={{ width: '100%', height: '100%', backgroundColor: '#111827' }} />;
}