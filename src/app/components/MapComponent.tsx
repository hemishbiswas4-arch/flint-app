// src/app/components/MapComponent.tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useDirections } from '../hooks/useDirections';
import { ItineraryStop } from '../community/plan/page';

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

  // Initialize map
  useEffect(() => {
    if (!mapRef.current && window.google) {
      mapRef.current = new window.google.maps.Map(
        document.getElementById('map') as HTMLElement,
        {
          center: { lat: 34.052235, lng: -118.243683 },
          zoom: 12,
          disableDefaultUI: true,
          styles: [ /* dark theme style JSON */ ],
        }
      );

      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: { strokeColor: '#818cf8', strokeWeight: 4, strokeOpacity: 0.8 },
      });
      directionsRendererRef.current.setMap(mapRef.current);
    }
  }, []);

  // Update directions
  useEffect(() => {
    if (directionsResult && directionsRendererRef.current) {
      directionsRendererRef.current.setDirections(directionsResult);
    } else {
      directionsRendererRef.current?.setDirections({
        routes: [],
        request: {
          origin: { placeId: '' },
          destination: { placeId: '' },
          travelMode: google.maps.TravelMode.DRIVING
        }
      });
    }
  }, [directionsResult]);

  // Update markers
  useEffect(() => {
    // Clean up previous markers
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

      mapRef.current.fitBounds(bounds, 100);
      setMarkers(newMarkers);
    }

    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [stops, selectedStopIndex, onMarkerClick, markers]);

  return <div id="map" style={{ width: '100%', height: '100%', backgroundColor: '#111827' }} />;
}