// src/app/components/ItineraryPanel.tsx
'use client';

import React from 'react';
import { Lock, Unlock, RefreshCcw, ArrowLeft, ExternalLink } from 'lucide-react';
import { ItineraryStop, FilterState } from '../plan/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";

type ItineraryPanelProps = {
    itinerary: ItineraryStop[];
    setItinerary: React.Dispatch<React.SetStateAction<ItineraryStop[] | null>>;
    selectedStopIndex: number | null;
    setSelectedStopIndex: React.Dispatch<React.SetStateAction<number | null>>;
    onReshuffle: (filters: FilterState) => void;
    onStartOver: () => void;
    loading: boolean;
    filters: FilterState;
};

export default function ItineraryPanel({ itinerary, setItinerary, selectedStopIndex, setSelectedStopIndex, onReshuffle, onStartOver, loading, filters }: ItineraryPanelProps) {

    const handleLockToggle = (indexToToggle: number) => {
        const updatedStops = itinerary.map((stop, index) =>
            index === indexToToggle ? { ...stop, locked: !stop.locked } : stop
        );
        setItinerary(updatedStops);
    };

    return (
        <div className="p-4 sm:p-6 w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Your Path</h2>
                    <p className="text-muted-foreground">Here is your generated itinerary.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={onStartOver}>
                        <ArrowLeft size={16} className="mr-2" /> Start Over
                    </Button>
                    <Button onClick={() => onReshuffle(filters)} disabled={loading}>
                        <RefreshCcw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Reshuffling...' : 'Reshuffle'}
                    </Button>
                </div>
            </div>

            {/* Itinerary List */}
            <div className="flex-grow overflow-y-auto py-6 pr-2">
                <div className="relative pl-6">
                    {/* The vertical connector line */}
                    <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border -z-10" />

                    <div className="space-y-8">
                        {itinerary.map((stop, index) => (
                            <div key={`${stop.placeId}-${index}`} className="relative flex items-start gap-4">
                                <div className="bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center font-bold z-10 flex-shrink-0 mt-1">
                                    {index + 1}
                                </div>
                                <Card 
                                    className={`w-full cursor-pointer transition-all ${selectedStopIndex === index ? 'border-primary shadow-lg' : 'hover:border-foreground/30'}`}
                                    onClick={() => setSelectedStopIndex(index)}
                                >
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle>{stop.name}</CardTitle>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary">{stop.category}</Badge>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={(e) => { e.stopPropagation(); handleLockToggle(index); }}
                                                    className="h-8 w-8 text-muted-foreground"
                                                >
                                                    {stop.locked ? <Lock size={16} /> : <Unlock size={16} />}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{stop.description}</p>
                                    </CardContent>
                                    <CardFooter>
                                        <a 
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.name)}&query_place_id=${stop.placeId}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            onClick={(e) => e.stopPropagation()} 
                                            className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline"
                                        >
                                            Open in Maps <ExternalLink size={14} />
                                        </a>
                                    </CardFooter>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}