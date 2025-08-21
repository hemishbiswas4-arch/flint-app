// Location: src/app/api/generate/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/auth";
import { Pool } from "pg";

// --- DATABASE CONNECTION ---
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// --- TYPES ---
type Category = 'Food' | 'Activity' | 'Sightseeing' | 'Entertainment' | 'Shopping' | 'Other';
interface Stop {
  name: string;
  description: string;
  category: Category;
  locked: boolean;
  lat: number;
  lng: number;
  placeId: string;
}
interface GeneratedStop {
  name: string;
  description: string;
  category: Category;
}
interface ItineraryRequest {
  location: { name: string; lat: number; lng: number; };
  radius: number;
  groupType: string;
  duration: string;
  theme: string;
  currentItinerary: Stop[];
  seenPlaces: string[];
}
interface NewGooglePlace {
    id: string;
    displayName: { text: string };
    types: string[];
    priceLevel?: string;
    location: { latitude: number; longitude: number; };
    rating?: number;
    userRatingCount?: number;
}

// --- PATHS DATABASE & KEYWORDS ---
const vibeDatabase = [
    { name: 'Sporty Fit', tags: { group: 'Date', theme: 'Active' }, recipe: ['Active Fun', 'Casual Restaurant'] },
    { name: 'Picnic Core', tags: { group: 'Date', theme: 'Relaxing' }, recipe: ['Aesthetic Snack Pickup', 'Park Picnic Spot', 'Dessert Cafe'] },
    { name: 'Cafe Crawl', tags: { group: 'Date', theme: 'Relaxing' }, recipe: ['Cafe', 'Second Cafe', 'Dessert Cafe'] },
    { name: 'Arts & Indie', tags: { group: 'Date', theme: 'Creative' }, recipe: ['Museum', 'Thrift Store', 'Stylish Cafe'] },
    { name: 'Concert/Live Gig', tags: { group: 'Date', theme: 'Entertainment' }, recipe: ['Casual Restaurant', 'Live Music Venue', 'Late-Night Bar'] },
    { name: 'Foodie Quest', tags: { group: 'Date', theme: 'Foodie' }, recipe: ['Hyped Food Spot', 'Street Food', 'Dessert Cafe'] },
    { name: 'Boujee Night Out', tags: { group: 'Date', theme: 'Romantic' }, recipe: ['Rooftop Bar', 'Fine Dining', 'Cocktail Lounge'] },
    { name: 'Chill & Cozy', tags: { group: 'Date', theme: 'Relaxing' }, recipe: ['Bookstore', 'Dessert Cafe', 'Gaming Lounge'] },
    { name: 'Adventure Date', tags: { group: 'Date', theme: 'Active' }, recipe: ['Outdoor Activity', 'Scenic Viewpoint', 'Casual Restaurant'] },
    { name: 'Seasonal Aesthetic', tags: { group: 'Date', theme: 'Romantic' }, recipe: ['Seasonal Activity', 'Cafe', 'Walkable Area'] },
    { name: 'Rom-Com Energy', tags: { group: 'Date', theme: 'Romantic' }, recipe: ['Flower Shop', 'Walkable Area', 'Ice Cream Shop'] },
    { name: 'Late-Night Vibes', tags: { group: 'Date', theme: 'Entertainment' }, recipe: ['Late-Night Restaurant', 'Neon Lit Walk', 'Dessert Cafe'] },
    { name: 'Tote Run', tags: { group: 'Solo', theme: 'Relaxing' }, recipe: ['Farmers Market', 'Flower Shop', 'Cafe'] },
    { name: 'Thrift Flip', tags: { group: 'Solo', theme: 'Creative' }, recipe: ['Vintage Shops', 'Record Store', 'Cafe'] },
    { name: 'Art Stroll', tags: { group: 'Solo', theme: 'Creative' }, recipe: ['Art Gallery', 'Street Art', 'Stylish Cafe'] },
    { name: 'Food Crawl', tags: { group: 'Solo', theme: 'Foodie' }, recipe: ['Street Food', 'Dessert Cafe', 'Bubble Tea'] },
    { name: 'Book Nook', tags: { group: 'Solo', theme: 'Relaxing' }, recipe: ['Indie Bookstore', 'Library', 'Cafe'] },
    { name: 'Park Day', tags: { group: 'Solo', theme: 'Relaxing' }, recipe: ['Park Picnic Spot', 'Outdoor Activity', 'Ice Cream Shop'] },
    { name: 'Moon Walk', tags: { group: 'Solo', theme: 'Entertainment' }, recipe: ['Neon Lit Walk', 'Ice Cream Shop', 'Late-Night Restaurant'] },
    { name: 'Solo Screen', tags: { group: 'Solo', theme: 'Entertainment' }, recipe: ['Indie Cinema', 'Casual Restaurant', 'Quiet Bar'] },
    { name: 'Brunch Babes', tags: { group: 'Friends', theme: 'Foodie' }, recipe: ['Brunch Spot', 'Shopping', 'Cafe'] },
    { name: 'Thrift Squad', tags: { group: 'Friends', theme: 'Creative' }, recipe: ['Thrift Store', 'Flea Market', 'Bubble Tea'] },
    { name: 'Foodie Quest (Friends)', tags: { group: 'Friends', theme: 'Foodie' }, recipe: ['Hyped Food Spot', 'Street Food', 'Dessert Cafe'] },
    { name: 'Arcade Mode', tags: { group: 'Friends', theme: 'Entertainment' }, recipe: ['Arcade', 'Bowling', 'Pizza Spot'] },
    { name: 'Culture Squad', tags: { group: 'Friends', theme: 'Creative' }, recipe: ['Museum', 'Pop-up Event', 'Casual Restaurant'] },
    { name: 'Rooftop Squad', tags: { group: 'Friends', theme: 'Entertainment' }, recipe: ['Rooftop Bar', 'Casual Restaurant', 'Late-Night Bar'] },
    { name: 'Concert Mode', tags: { group: 'Friends', theme: 'Entertainment' }, recipe: ['Casual Restaurant', 'Live Music Venue', 'Late-Night Bar'] },
    { name: 'Park Day (Family)', tags: { group: 'Family', theme: 'Active' }, recipe: ['Family Park', 'Ice Cream Shop', 'Casual Restaurant'] },
    { name: 'Museum Trip', tags: { group: 'Family', theme: 'Creative' }, recipe: ['Family Museum', 'Lunch Spot', 'Bookstore'] },
    { name: 'Fun Zone', tags: { group: 'Family', theme: 'Entertainment' }, recipe: ['Amusement', 'Pizza Spot', 'Dessert Cafe'] },
    { name: 'Family Foodie Quest', tags: { group: 'Family', theme: 'Foodie' }, recipe: ['Kid-Friendly Restaurant', 'Dessert Cafe', 'Gourmet Store'] },
];

const queryKeywords = {
    'Activity': ['fun activities'], 'Food': ['restaurants'], 'Entertainment': ['entertainment venues'], 'Sightseeing': ['tourist attractions'],
    'Cafe': ['specialty coffee shops', 'cozy cafes'], 'Second Cafe': ['aesthetic cafes'], 'Bookstore': ['independent bookstores'],
    'Cozy Restaurant': ['cozy restaurants with warm ambiance'], 'Quiet Bar': ['quiet bars', 'lounges'], 'Active Fun': ['bowling alleys', 'arcades', 'go-karting', 'rock climbing'],
    'Casual Restaurant': ['casual dining', 'breweries', 'food trucks'], 'Park': ['parks with walking trails'], 'Outdoor Activity': ['hiking spots', 'bike trails', 'kayaking'],
    'Sports Bar': ['sports bars'], 'Art Gallery': ['art galleries'], 'Stylish Cafe': ['aesthetic cafes', 'instagrammable coffee shops'],
    'Museum': ['museums', 'cultural centers'], 'Thrift Store': ['vintage clothing stores', 'thrift shops'], 'Live Music Venue': ['live music venues', 'local band gigs'],
    'Late-Night Bar': ['late night bars'], 'Hyped Food Spot': ['hyped restaurants', 'popular food spots'], 'Street Food': ['street food stalls'],
    'Dessert Cafe': ['dessert cafes', 'ice cream shops'], 'Rooftop Bar': ['rooftop bars'], 'Fine Dining': ['fine dining restaurants'],
    'Cocktail Lounge': ['cocktail lounges'], 'Gaming Lounge': ['gaming lounges', 'board game cafes'], 'Scenic Viewpoint': ['scenic viewpoints'],
    'Late-Night Restaurant': ['late night restaurants', '24/7 diners', 'midnight ramen'], 'Neon Lit Walk': ['city parks for night walk', 'well-lit streets'],
    'Farmers Market': ['farmers markets'], 'Flower Shop': ['flower shops'], 'Vintage Shops': ['vintage shops'], 'Record Store': ['record stores'],
    'Indie Bookstore': ['independent bookstores'], 'Library': ['public libraries'], 'Brunch Spot': ['brunch restaurants', 'bottomless mimosas'],
    'Shopping': ['shopping areas', 'boutiques'], 'Flea Market': ['flea markets'], 'Bubble Tea': ['bubble tea shops'], 'Arcade': ['arcades', 'barcades'],
    'Bowling': ['bowling alleys'], 'Pizza Spot': ['pizza restaurants'], 'Pop-up Event': ['pop-up events', 'street fairs', 'night markets'],
    'Ice Cream Shop': ['ice cream shops'], 'Walkable Area': ['downtown areas for walking', 'scenic neighborhood'], 'Seasonal Activity': ['seasonal events', 'pumpkin patch', 'ice skating rink'], 'Aesthetic Snack Pickup': ['gourmet grocery', 'charcuterie shop', 'aesthetic bakery'], 'Park Picnic Spot': ['parks with scenic views', 'botanical gardens'],
    'Family Park': ['parks with playgrounds', 'family-friendly parks'], 'Family Museum': ['science museums', 'childrens museums', 'interactive exhibits'], 'Lunch Spot': ['family restaurants', 'casual lunch spots'], 'Amusement': ['amusement parks', 'family fun centers', 'arcades'], 'Kid-Friendly Restaurant': ['restaurants with play areas', 'family-friendly dining'], 'Gourmet Store': ['gourmet food stores', 'specialty food shops'],
};

// --- HELPER FUNCTIONS ---
function mapGoogleTypeToCategory(types: string[]): Category {
    if (types.includes('restaurant') || types.includes('cafe') || types.includes('bar') || types.includes('bakery')) return 'Food';
    if (types.includes('tourist_attraction') || types.includes('museum') || types.includes('park') || types.includes('art_gallery')) return 'Sightseeing';
    if (types.includes('movie_theater') || types.includes('bowling_alley') || types.includes('night_club') || types.includes('amusement_park')) return 'Entertainment';
    if (types.includes('shopping_mall') || types.includes('store') || types.includes('book_store') || types.includes('clothing_store')) return 'Shopping';
    if (types.includes('gym') || types.includes('spa') || types.includes('stadium') || types.includes('dance_school') || types.includes('fitness_center')) return 'Activity';
    return 'Other';
}

// --- GOOGLE APIS ---
async function getPlacesFromGoogle(lat: number, lng: number, radius: number, queryKeyword: string, locationName: string): Promise<NewGooglePlace[]> {
    const PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    if (!PLACES_API_KEY) throw new Error("Google Maps API key is not configured.");
    
    const textQuery = `${queryKeyword} in ${locationName}`;
    const url = 'https://places.googleapis.com/v1/places:searchText';
    const headers = { 'Content-Type': 'application/json', 'X-Goog-Api-Key': PLACES_API_KEY, 'X-Goog-FieldMask': 'places.id,places.displayName,places.types,places.location,places.rating,places.userRatingCount' };
    const body = JSON.stringify({ textQuery, maxResultCount: 20, locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: radius * 1000 } } });

    try {
        const response = await fetch(url, { method: 'POST', headers, body });
        if (!response.ok) { throw new Error(`Google Places API request failed`); }
        const data = await response.json();
        const allPlaces = data.places || [];

        const highQualityPlaces = allPlaces.filter((p: NewGooglePlace) => (p.rating || 0) >= 4.0 && (p.userRatingCount || 0) > 20);
        if (highQualityPlaces.length >= 5) return highQualityPlaces;

        const goodQualityPlaces = allPlaces.filter((p: NewGooglePlace) => (p.rating || 0) >= 3.0 && (p.userRatingCount || 0) > 5);
        return goodQualityPlaces;

    } catch (error) {
        console.error(`Failed to fetch places for query "${textQuery}":`, error);
        return [];
    }
}

// --- MAIN API FUNCTION ---
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) { return new Response(JSON.stringify({ message: "Not authenticated" }), { status: 401 }); }

  const client = await pool.connect();
  try {
    const userResult = await client.query('SELECT "usageCount" FROM "users" WHERE id = $1', [session.user.id]);
    if (userResult.rows.length === 0) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    const usageCount = userResult.rows[0].usageCount;
    if (usageCount <= 0) return new Response(JSON.stringify({ message: "Usage limit reached." }), { status: 403 });

    const { location, radius, groupType, duration, theme, currentItinerary, seenPlaces = [] }: ItineraryRequest = await request.json();
    const getStopsCount = (d: string): number => d.includes("Quick") ? 2 : d.includes("All day") ? 4 : 3;
    const numberOfStops = getStopsCount(duration);
    const lockedStops: Stop[] = currentItinerary.filter((s) => s.locked);
    
    let matchingVibes = vibeDatabase.filter(vibe => 
        (vibe.tags.group === groupType) && (vibe.tags.theme === theme)
    );
    if (matchingVibes.length === 0) {
        matchingVibes = vibeDatabase.filter(vibe => vibe.tags.group === groupType);
    }
    if (matchingVibes.length === 0) {
        return new Response(JSON.stringify({ message: `Couldn't find any vibes for '${groupType}'.` }), { status: 404 });
    }
    const selectedVibe = matchingVibes[Math.floor(Math.random() * matchingVibes.length)];
    const structure = selectedVibe.recipe.slice(0, numberOfStops);
    
    const placePromises = structure.map(step => {
        const queryKeywordOptions = (queryKeywords[step as keyof typeof queryKeywords] || [step]);
        const queryKeyword = queryKeywordOptions[Math.floor(Math.random() * queryKeywordOptions.length)];
        return getPlacesFromGoogle(location.lat, location.lng, radius, queryKeyword, location.name);
    });

    const allPlacesResults = await Promise.all(placePromises);
    
    const venueMap = new Map<string, NewGooglePlace | Stop>();
    lockedStops.forEach(stop => {
      venueMap.set(stop.name, stop);
    });
    allPlacesResults.flat().forEach(place => {
        if (!venueMap.has(place.displayName.text) && !seenPlaces.includes(place.displayName.text)) {
            venueMap.set(place.displayName.text, place);
        }
    });
    const availableVenues = Array.from(venueMap.values());

    if (availableVenues.length < numberOfStops) {
      return new Response(JSON.stringify({ message: "Sorry, we couldn't find enough high-quality places for your request. Please try a wider radius." }), { status: 404 });
    }
    
    const formattedVenues = availableVenues.map(place => {
      // ✅ CORRECTED: Use a type guard to safely access properties
      const name = 'displayName' in place ? place.displayName.text : place.name;
      const types = 'types' in place ? place.types : [];
      const rating = 'rating' in place ? place.rating : 'N/A';
      const lat = 'location' in place ? place.location.latitude : place.lat;
      const lng = 'location' in place ? place.location.longitude : place.lng;
      return `- Name: "${name}", Category: "${mapGoogleTypeToCategory(types)}", Rating: ${rating || 'N/A'}, Coords: (${lat}, ${lng})`;
    }).join('\n');
    
    const baseInstructions = `You are an expert local guide for ${location.name}. Create a perfect itinerary from the pre-vetted list of venues.
**THEMATIC COHESION:** The itinerary's flow must feel logical. Descriptions must be vibrant and explain *why* each stop fits the theme.
**CRITICAL RULES:**
1.  **PRIORITIZE PROXIMITY:** You MUST choose stops that are geographically close to each other to form a convenient and logical path. Use the provided "Coords" for each venue to make this decision. The user should not have to travel long distances between stops.
2.  **ENSURE VARIETY:** Pick a variety of venue categories that fit a logical daily path. Do NOT pick multiple venues from the same category unless the theme is specific (e.g., "Cafe Crawl").
3.  **USE EXACT VENUE NAMES:** The "name" in your JSON output MUST be an exact match from the "AVAILABLE VENUES" list.
4.  **STRICT JSON OUTPUT:** Respond with a single JSON object with one key: "stops".`;
    const preferences = `**USER PREFERENCES:**\n- Group: "${groupType}", Duration: "${duration}", Theme: "${theme}", Selected Vibe: "${selectedVibe.name}"`;
    const availableVenuesSection = `**AVAILABLE VENUES (Choose from this list):**\n${formattedVenues}`;
    const lockedStopsText = lockedStops.map(s => `- ${s.name}`).join('\n');
    const requiredStopsCount = numberOfStops - lockedStops.length;
    const lockedPrompt = lockedStops.length > 0 
        ? `The user has LOCKED these stops:\n${lockedStopsText}\nYou MUST include them. Build the rest of the path around them by choosing ${requiredStopsCount} new stops.` 
        : `Create a brand new path of ${numberOfStops} stops from scratch.`;
    
    const prompt = `${baseInstructions}\n${lockedPrompt}\n${preferences}\n${availableVenuesSection}`;
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const generatedItinerary: { stops: GeneratedStop[] } = JSON.parse(responseText);

    if (!generatedItinerary.stops || !Array.isArray(generatedItinerary.stops)) {
        throw new Error("AI response was not in the expected format.");
    }
    
    await client.query('UPDATE "users" SET "usageCount" = "usageCount" - 1 WHERE id = $1', [session.user.id]);
    
    const finalGeneratedStops: GeneratedStop[] = [...generatedItinerary.stops];
    lockedStops.forEach(lockedStop => {
        if (!finalGeneratedStops.some(s => s.name === lockedStop.name)) {
            finalGeneratedStops.push(lockedStop);
        }
    });

    const finalStops = finalGeneratedStops.map((newStop: GeneratedStop) => {
        const originalVenue = availableVenues.find(v => ('displayName' in v && v.displayName ? v.displayName.text : (v as Stop).name) === newStop.name);
        if (!originalVenue) return null;
        const isLocked = lockedStops.some(locked => locked.name === newStop.name);
        const lat = 'location' in originalVenue ? originalVenue.location.latitude : (originalVenue as Stop).lat;
        const lng = 'location' in originalVenue ? originalVenue.location.longitude : (originalVenue as Stop).lng;
        const placeId = 'id' in originalVenue ? originalVenue.id : (originalVenue as Stop).placeId;
        return { ...newStop, lat, lng, placeId, locked: isLocked };
    }).filter((stop): stop is Stop => stop !== null);

    return new Response(JSON.stringify({ stops: finalStops }), { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ message: `AI generation failed: ${errorMessage}` }), { status: 500 });
  } finally {
    if (client) client.release();
  }
}