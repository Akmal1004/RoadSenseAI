import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  MapPin, 
  X, 
  Clock, 
  Heart, 
  Navigation, 
  Fuel, 
  Hospital, 
  Utensils, 
  SquareParking, 
  Hotel, 
  Zap, 
  CircleDollarSign, 
  Map 
} from "lucide-react";
import { useAppState } from "../context/AppStateContext";
import { useRoutes } from "../hooks/useRoutes";
import { getPlaceDetails, searchNearbyPlaces, searchPlaces } from "../services/searchService";
import { getCurrentLocation, getDefaultLocation } from "../services/locationService";
import { getFavoriteLocations, getRecentSearches, saveRecentSearch } from "../services/searchHistoryService";
import { Coordinate, TravelPreference } from "../types/route";
import { LocationResult, PlaceDetails, PlaceSuggestion, SearchCategory, SearchHistory } from "../types/search";

const searchCategories: SearchCategory[] = [
  { id: "fuel", label: "Fuel Stations", icon: "gas", searchQuery: "fuel station" },
  { id: "hospitals", label: "Hospitals", icon: "hospital", searchQuery: "hospital" },
  { id: "restaurants", label: "Restaurants", icon: "utensils", searchQuery: "restaurant" },
  { id: "parking", label: "Parking", icon: "parking", searchQuery: "parking" },
  { id: "hotels", label: "Hotels", icon: "hotel", searchQuery: "hotel" },
  { id: "ev", label: "EV Chargers", icon: "ev", searchQuery: "ev charging station" },
  { id: "atms", label: "ATMs", icon: "atm", searchQuery: "atm" },
  { id: "nearby", label: "Nearby", icon: "nearby", searchQuery: "point of interest" }
];

const categoryIcons: Record<string, React.ReactNode> = {
  gas: <Fuel size={14} />,
  hospital: <Hospital size={14} />,
  utensils: <Utensils size={14} />,
  parking: <SquareParking size={14} />,
  hotel: <Hotel size={14} />,
  ev: <Zap size={14} />,
  atm: <CircleDollarSign size={14} />,
  nearby: <Map size={14} />
};

export default function RoutePlanner() {
  const { routePlan, preferences: userPreferences } = useAppState();
  const { plan, loading, error: planningError } = useRoutes();

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceCoordinate, setSourceCoordinate] = useState<Coordinate | null>(null);
  const [destinationCoordinate, setDestinationCoordinate] = useState<Coordinate | null>(null);
  const [preference, setPreference] = useState<TravelPreference>(userPreferences.defaultRouteType);
  
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [nearbyResults, setNearbyResults] = useState<LocationResult[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  
  const [recentSearches, setRecentSearches] = useState<SearchHistory[]>([]);
  const [favoriteLocations, setFavoriteLocations] = useState<SearchHistory[]>([]);
  
  const [searchLoading, setSearchLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [activeField, setActiveField] = useState<"source" | "destination" | null>(null);

  const searchAbortRef = useRef<AbortController | null>(null);
  const detailsAbortRef = useRef<AbortController | null>(null);
  const suppressNextSearchRef = useRef(false);
  const plannerRef = useRef<HTMLDivElement>(null);

  // Sync preference with global defaults when settings update
  useEffect(() => {
    setPreference(userPreferences.defaultRouteType);
  }, [userPreferences.defaultRouteType]);

  // Load history and favorites on mount
  useEffect(() => {
    refreshHistory();
  }, []);

  // Click outside detector to close suggestion list
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (plannerRef.current && !plannerRef.current.contains(event.target as Node)) {
        setActiveField(null);
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function refreshHistory() {
    const recents = await getRecentSearches();
    const favs = await getFavoriteLocations();
    setRecentSearches(recents);
    setFavoriteLocations(favs);
  }

  // Autocomplete logic for the active input field
  useEffect(() => {
    if (!activeField) return;

    const query = activeField === "source" ? source : destination;
    const coordinate = activeField === "source" ? sourceCoordinate : destinationCoordinate;
    const normalizedQuery = query.trim().replace(/\s+/g, " ");

    if (suppressNextSearchRef.current) {
      suppressNextSearchRef.current = false;
      return;
    }
    if (coordinate || normalizedQuery.length < 2) {
      searchAbortRef.current?.abort();
      setSuggestions([]);
      setSearchError(null);
      return;
    }

    const timeout = setTimeout(() => {
      searchLocation(normalizedQuery, activeField === "source");
    }, 500);

    return () => clearTimeout(timeout);
  }, [source, destination, activeField, sourceCoordinate, destinationCoordinate]);

  async function resolveLocationBias(): Promise<Coordinate> {
    if (currentLocation) return currentLocation;
    try {
      const coord = await getCurrentLocation();
      setCurrentLocation(coord);
      setLocationNotice(null);
      return coord;
    } catch (err) {
      const fallback = getDefaultLocation();
      setCurrentLocation(fallback);
      setLocationNotice(err instanceof Error ? err.message : "Location permissions denied.");
      return fallback;
    }
  }

  async function searchLocation(query: string, isSource: boolean) {
    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;
    setSearchLoading(true);
    setSearchError(null);
    
    if (!isSource) {
      setActiveCategoryId(null);
      setNearbyResults([]);
    }

    try {
      const locationBias = await resolveLocationBias();
      const results = await searchPlaces(query, { locationBias, signal: controller.signal });
      setSuggestions(results);
    } catch (err) {
      if (controller.signal.aborted) return;
      setSuggestions([]);
      setSearchError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      if (!controller.signal.aborted) setSearchLoading(false);
    }
  }

  async function planSelectedDestination(details: PlaceDetails | LocationResult) {
    suppressNextSearchRef.current = true;
    const label = "name" in details ? details.name : details.label;
    const address = "address" in details ? details.address : "";
    setDestination(label);
    setDestinationCoordinate(details.coordinate);
    setSuggestions([]);
    setNearbyResults([]);
    setSearchError(null);

    await saveRecentSearch({
      id: details.placeId ?? details.id,
      placeId: details.placeId,
      label,
      address,
      coordinate: details.coordinate,
      category: details.category
    });
    await refreshHistory();

    const startLoc = source.trim() || "Current Location";
    const startCoord = sourceCoordinate ?? currentLocation ?? (await resolveLocationBias());

    await plan(startLoc, label, preference, {
      source: startCoord,
      destination: details.coordinate
    });
  }

  async function selectSuggestion(suggestion: PlaceSuggestion) {
    detailsAbortRef.current?.abort();
    const controller = new AbortController();
    detailsAbortRef.current = controller;
    setDetailsLoading(true);
    setSearchError(null);

    try {
      const details = await getPlaceDetails(suggestion.placeId, controller.signal);
      if (activeField === "source") {
        suppressNextSearchRef.current = true;
        setSource(details.name);
        setSourceCoordinate(details.coordinate);
        setSuggestions([]);
        setSearchError(null);
      } else {
        await planSelectedDestination(details);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      setSearchError(err instanceof Error ? err.message : "Failed to load location details.");
    } finally {
      if (!controller.signal.aborted) setDetailsLoading(false);
    }
  }

  async function selectCategory(category: SearchCategory) {
    const coordinate = await resolveLocationBias();
    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;
    setSearchLoading(true);
    setSearchError(null);
    setActiveCategoryId(category.id);
    setSuggestions([]);
    setDestination(category.label);
    setDestinationCoordinate(null);

    try {
      const results = await searchNearbyPlaces({
        location: coordinate,
        query: category.searchQuery,
        category: category.label,
        signal: controller.signal
      });
      setNearbyResults(results);
    } catch (err) {
      if (controller.signal.aborted) return;
      setNearbyResults([]);
      setSearchError(err instanceof Error ? err.message : "Nearby search failed.");
    } finally {
      if (!controller.signal.aborted) setSearchLoading(false);
    }
  }

  async function selectSavedSearch(item: SearchHistory) {
    await planSelectedDestination({
      id: item.id,
      placeId: item.placeId ?? item.id,
      name: item.label,
      address: item.address ?? "",
      coordinate: item.coordinate,
      category: item.category
    });
  }

  async function handlePlan() {
    if (loading) return;
    if (!destination.trim()) {
      setFormError("Destination is required.");
      return;
    }
    setFormError(null);
    
    const startLoc = source.trim() || "Current Location";
    const startCoord = sourceCoordinate ?? currentLocation ?? (await resolveLocationBias());
    const destCoord = destinationCoordinate;

    await plan(startLoc, destination.trim(), preference, {
      source: startCoord,
      destination: destCoord
    });
  }

  const clearDestination = () => {
    setDestination("");
    setDestinationCoordinate(null);
    setSuggestions([]);
    setNearbyResults([]);
    setActiveCategoryId(null);
    setSearchError(null);
  };

  return (
    <div ref={plannerRef} className="glass-panel" style={{ height: "100%", display: "flex", flexDirection: "column", gap: "18px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 800, fontFamily: "var(--font-display)" }}>
        Route Planner
      </h2>

      {/* Source Location Field */}
      <div style={{ position: "relative" }}>
        <label style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
          Starting point
        </label>
        <div className="cyber-input-wrap">
          <MapPin size={18} color="var(--safest-green)" style={{ marginRight: "10px", flexShrink: 0 }} />
          <input
            type="text"
            className="cyber-input"
            value={source}
            placeholder="Current Location"
            onFocus={() => setActiveField("source")}
            onChange={(e) => {
              setSource(e.target.value);
              setSourceCoordinate(null);
              setActiveField("source");
            }}
          />
          {source && (
            <button 
              onClick={() => { setSource(""); setSourceCoordinate(null); setSuggestions([]); }}
              style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Starting Point Autocomplete */}
        {activeField === "source" && (suggestions.length > 0 || searchError) && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 50,
            marginTop: "2px",
            maxHeight: "220px",
            overflowY: "auto",
            background: "rgba(5, 12, 28, 0.98)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--border-radius-md)",
            padding: "8px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)"
          }}>
            {searchError && (
              <div style={{ color: "var(--danger-red)", padding: "10px", fontSize: "13px", fontWeight: 600 }}>
                {searchError}
              </div>
            )}
            
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => selectSuggestion(suggestion)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  padding: "8px 12px",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  borderRadius: "6px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <span style={{ fontSize: "14px", fontWeight: 700 }}>{suggestion.primaryText}</span>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{suggestion.secondaryText}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Destination Location Field */}
      <div style={{ position: "relative" }}>
        <label style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
          Destination
        </label>
        <div className="cyber-input-wrap">
          <Search size={18} color="var(--primary-cyan)" style={{ marginRight: "10px", flexShrink: 0 }} />
          <input
            type="text"
            className="cyber-input"
            value={destination}
            placeholder="Search destination..."
            onFocus={() => setActiveField("destination")}
            onChange={(e) => {
              setDestination(e.target.value);
              setDestinationCoordinate(null);
              setFormError(null);
              setActiveField("destination");
            }}
          />
          {(destination || searchLoading || detailsLoading) && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {(searchLoading || detailsLoading) && (
                <div style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid rgba(255, 255, 255, 0.1)",
                  borderTopColor: "var(--primary-cyan)",
                  borderRadius: "50%",
                  animation: "fadeIn 0.5s linear infinite"
                }} />
              )}
              <button 
                onClick={clearDestination}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Search Categories Chips */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", marginTop: "10px" }} className="no-scrollbar">
          {searchCategories.map((cat) => (
            <button
              key={cat.id}
              className={`chip ${activeCategoryId === cat.id ? "active" : ""}`}
              onClick={() => selectCategory(cat)}
              style={{ flexShrink: 0 }}
            >
              {categoryIcons[cat.icon]}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Destination Autocomplete */}
        {activeField === "destination" && (suggestions.length > 0 || nearbyResults.length > 0 || searchError) && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 50,
            marginTop: "6px",
            maxHeight: "220px",
            overflowY: "auto",
            background: "rgba(5, 12, 28, 0.98)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--border-radius-md)",
            padding: "8px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)"
          }}>
            {searchError && (
              <div style={{ color: "var(--danger-red)", padding: "10px", fontSize: "13px", fontWeight: 600 }}>
                {searchError}
              </div>
            )}
            
            {/* Geocoding suggestions */}
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => selectSuggestion(suggestion)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  padding: "8px 12px",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  borderRadius: "6px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <span style={{ fontSize: "14px", fontWeight: 700 }}>{suggestion.primaryText}</span>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{suggestion.secondaryText}</span>
              </button>
            ))}

            {/* Nearby results */}
            {nearbyResults.map((result) => (
              <button
                key={result.id}
                onClick={() => planSelectedDestination(result)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  padding: "8px 12px",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  borderRadius: "6px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <span style={{ fontSize: "14px", fontWeight: 700 }}>{result.label}</span>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{result.address}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {locationNotice && (
        <p style={{ color: "var(--warn-yellow)", fontSize: "11px", fontWeight: 700 }}>
          {locationNotice}
        </p>
      )}

      {/* Favorites & Recents widgets */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        
        {favoriteLocations.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", textTransform: "uppercase", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "8px" }}>
              <Heart size={12} color="var(--danger-red)" />
              <span>Favorites</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {favoriteLocations.map((fav) => (
                <button
                  key={fav.id}
                  onClick={() => selectSavedSearch(fav)}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "99px",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--primary-cyan)"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--glass-border)"}
                >
                  {fav.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {recentSearches.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", textTransform: "uppercase", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "8px" }}>
              <Clock size={12} />
              <span>Recent Search</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {recentSearches.slice(0, 4).map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => selectSavedSearch(rec)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    color: "var(--text-secondary)",
                    fontSize: "13px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)";
                    e.currentTarget.style.color = "#FFFFFF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  <span>{rec.label}</span>
                  <span style={{ fontSize: "10px", opacity: 0.6 }}>{rec.address?.split(",")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Travel Preferences Toggles */}
      <div style={{ marginTop: "auto" }}>
        <label style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
          Travel Preference
        </label>
        <div className="nav-segment">
          {(["safest", "fastest", "eco"] as TravelPreference[]).map((type) => (
            <button
              key={type}
              className={`nav-segment-btn ${preference === type ? "active" : ""}`}
              onClick={() => setPreference(type)}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Form Error messages */}
      {(formError || planningError) && (
        <p style={{ color: "var(--danger-red)", fontSize: "13px", fontWeight: 600 }}>
          {formError ?? planningError}
        </p>
      )}

      {/* CTA Plan Route Button */}
      <button 
        className="btn-gradient" 
        onClick={handlePlan}
        disabled={loading}
      >
        <Navigation size={16} style={{ transform: "rotate(45deg)" }} />
        <span>{loading ? "Optimizing Route..." : "Plan Safest Route"}</span>
      </button>
    </div>
  );
}
