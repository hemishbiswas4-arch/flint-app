// File: src/app/hooks/useDirections.ts
import { useState, useEffect } from 'react';
import { ItineraryStop } from '../community/plan/page';

export const useDirections = (stops: ItineraryStop[]) => {
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

    useEffect(() => {
        if (stops.length < 2) {
            setDirections(null);
            return;
        }

        const directionsService = new window.google.maps.DirectionsService();

        const waypoints = stops.slice(1, -1).map(stop => ({
            location: { lat: stop.lat, lng: stop.lng },
            stopover: true,
        }));

        directionsService.route(
            {
                origin: { lat: stops[0].lat, lng: stops[0].lng },
                destination: { lat: stops[stops.length - 1].lat, lng: stops[stops.length - 1].lng },
                waypoints: waypoints,
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                } else {
                    console.error('Directions request failed due to ' + status);
                    setDirections(null);
                }
            }
        );
    }, [stops]);

    return directions;
};