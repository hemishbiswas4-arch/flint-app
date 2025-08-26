import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getPlacesFromGoogle, mapGoogleTypeToCategory, NewGooglePlace } from "@/lib/places-utils";

interface SpotlightPlace {
  name: string;
  description: string;
  category: string;
  rating?: number;
  lat: number;
  lng: number;
  placeId: string;
}

// ✅ cache per location
let cached: Record<string, { suggestions: SpotlightPlace[]; timestamp: number }> = {};

export async function POST(req: NextRequest) {
  try {
    const { location, radius = 50 } = await req.json();

    // ✅ round coords so people in same city share cache
    const key = `${location.lat.toFixed(2)},${location.lng.toFixed(2)}`;

    if (cached[key] && Date.now() - cached[key].timestamp < 30 * 60 * 1000) {
      return NextResponse.json({ suggestions: cached[key].suggestions });
    }

    const candidateQueries = [
      "restaurants",
      "cafes",
      "tourist attractions",
      "museums",
      "parks",
      "nightlife",
    ];

    const placeResults = await Promise.all(
      candidateQueries.map((q) =>
        getPlacesFromGoogle(location.lat, location.lng, radius, q)
      )
    );

    const allPlaces: NewGooglePlace[] = placeResults
      .flat()
      .filter((p) => p.rating && p.rating >= 4.2);

    if (allPlaces.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    const formatted = allPlaces
      .map(
        (p) =>
          `- ${p.displayName.text} (${mapGoogleTypeToCategory(p.types)}) [⭐ ${
            p.rating ?? "N/A"
          }]`
      )
      .join("\n");

    const prompt = `From this list of venues in the city area, pick 5 spotlight-worthy and varied options.
Return JSON in format:
[{ "name": string, "category": string, "description": string }]

Venues:
${formatted}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(prompt);
    let suggestions: SpotlightPlace[] = [];

    try {
      const parsed = JSON.parse(result.response.text());
      suggestions = Array.isArray(parsed) ? parsed : [];
    } catch {
      suggestions = [];
    }

    const enriched: SpotlightPlace[] = suggestions.map((s) => {
      const match = allPlaces.find((p) => p.displayName.text === s.name);
      return {
        ...s,
        rating: match?.rating ?? undefined,
        lat: match?.location.latitude ?? 0,
        lng: match?.location.longitude ?? 0,
        placeId: match?.id ?? "",
      };
    });

    cached[key] = { suggestions: enriched, timestamp: Date.now() };

    return NextResponse.json({ suggestions: enriched });
  } catch (err) {
    console.error("Spotlight error:", err);
    return NextResponse.json({ error: "Failed to generate spotlight" }, { status: 500 });
  }
}
