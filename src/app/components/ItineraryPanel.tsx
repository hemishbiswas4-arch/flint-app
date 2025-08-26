'use client';

import React from 'react';
import { Lock, Unlock, RefreshCcw, ArrowLeft, ExternalLink } from 'lucide-react';
import { ItineraryStop, FilterState } from '../plan/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function ItineraryPanel({
  itinerary,
  setItinerary,
  selectedStopIndex,
  setSelectedStopIndex,
  onReshuffle,
  onStartOver,
  loading,
  filters
}: ItineraryPanelProps) {
  const handleLockToggle = (indexToToggle: number) => {
    const updatedStops = itinerary.map((stop, index) =>
      index === indexToToggle ? { ...stop, locked: !stop.locked } : stop
    );
    setItinerary(updatedStops);
  };

  return (
    <div className="p-3 sm:p-6 w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Your Path</h2>
          <p className="text-sm text-muted-foreground">Here is your generated itinerary.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={onStartOver}
            className="w-full sm:w-auto"
          >
            <ArrowLeft size={16} className="mr-2" /> Start Over
          </Button>
          <Button
            onClick={() => onReshuffle(filters)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <RefreshCcw
              size={16}
              className={`mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            {loading ? 'Reshuffling...' : 'Reshuffle'}
          </Button>
        </div>
      </div>

      {/* Itinerary List */}
      <div className="flex-grow overflow-y-auto py-4 sm:py-6 pr-1 sm:pr-2">
        <div className="relative sm:pl-6">
          {/* Timeline line (desktop only) */}
          <div className="hidden sm:block absolute left-6 top-6 bottom-6 w-0.5 bg-border -z-10" />

          <div className="space-y-6 sm:space-y-8">
            {itinerary.map((stop, index) => (
              <div
                key={`${stop.placeId}-${index}`}
                className="relative flex items-start gap-3 sm:gap-4"
              >
                {/* Step indicator (desktop only) */}
                <div className="hidden sm:flex bg-primary text-primary-foreground h-8 w-8 rounded-full items-center justify-center font-bold z-10 flex-shrink-0 mt-1">
                  {index + 1}
                </div>

                <Card
                  className={`w-full cursor-pointer transition-all ${
                    selectedStopIndex === index
                      ? 'border-primary shadow-lg'
                      : 'hover:border-foreground/30'
                  }`}
                  onClick={() => setSelectedStopIndex(index)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <CardTitle className="text-base sm:text-lg">{stop.name}</CardTitle>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Badge variant="secondary">{stop.category}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLockToggle(index);
                          }}
                          className="h-8 w-8 text-muted-foreground"
                        >
                          {stop.locked ? <Lock size={16} /> : <Unlock size={16} />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">{stop.description}</p>
                  </CardContent>
                  <CardFooter>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        stop.name
                      )}&query_place_id=${stop.placeId}`}
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
