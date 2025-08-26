export interface NewGooglePlace {
  id: string;
  displayName: { text: string };
  location: { latitude: number; longitude: number };
  types: string[];
  rating?: number;
}

export function mapGoogleTypeToCategory(types: string[] = []): string {
  if (types.includes("restaurant")) return "Restaurant";
  if (types.includes("cafe")) return "Cafe";
  if (types.includes("museum")) return "Museum";
  if (types.includes("park")) return "Park";
  if (types.includes("night_club")) return "Nightlife";
  return "Other";
}

export async function getPlacesFromGoogle(
  lat: number,
  lng: number,
  radiusKm: number,
  query: string
): Promise<NewGooglePlace[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("Missing Google Maps API key");

  const url = `https://places.googleapis.com/v1/places:searchText`;

  const body = {
    textQuery: query,
    locationBias: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radiusKm * 1000, // ✅ km → meters
      },
    },
  };

  try {
    const response = await fetch(`${url}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.location,places.types,places.rating",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Places API request failed: ${errorText}`);
    }

    const data = await response.json();
    return (data.places || []) as NewGooglePlace[];
  } catch (err) {
    console.error(`❌ Failed to fetch places for "${query}"`, err);
    return [];
  }
}
