import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AIChip from "../../src/components/AIChip";
import CategoryChips from "../../src/components/CategoryChips";
import FavoriteLocations from "../../src/components/FavoriteLocations";
import FloatingAIButton from "../../src/components/FloatingAIButton";
import GlassCard from "../../src/components/GlassCard";
import GradientButton from "../../src/components/GradientButton";
import LoadingSkeleton from "../../src/components/LoadingSkeleton";
import MapLocationPicker from "../../src/components/MapLocationPicker";
import MapPreview from "../../src/components/MapPreview";
import RecentSearchList from "../../src/components/RecentSearchList";
import SearchBar from "../../src/components/SearchBar";
import SearchResultsList from "../../src/components/SearchResultsList";
import StatCard from "../../src/components/StatCard";
import { recentDestinations } from "../../src/constants/mockData";
import { spacing } from "../../src/constants/theme";
import { useAppState } from "../../src/context/AppStateContext";
import { useRoutes } from "../../src/hooks/useRoutes";
import { useStats } from "../../src/hooks/useStats";
import { useWeather } from "../../src/hooks/useWeather";
import { cancelGeminiRequest, generateRouteInsights } from "../../src/services/aiService";
import { getPlaceDetails, searchNearbyPlaces, searchPlaces } from "../../src/services/searchService";
import { getCurrentLocation, getDefaultLocation } from "../../src/services/locationService";
import { getFavoriteLocations, getRecentSearches, saveRecentSearch } from "../../src/services/searchHistoryService";
import { useTheme } from "../../src/theme/hooks/useTheme";
import { Coordinate, TravelPreference } from "../../src/types/route";
import { LocationResult, PlaceDetails, PlaceSuggestion, SearchCategory, SearchHistory } from "../../src/types/search";

const preferences: Array<{ label: string; value: TravelPreference }> = [
  { label: "Safest", value: "safest" },
  { label: "Fastest", value: "fastest" },
  { label: "Eco", value: "eco" }
];

const searchCategories: SearchCategory[] = [
  { id: "fuel", label: "Fuel Stations", icon: "gas-station-outline", searchQuery: "fuel station" },
  { id: "hospitals", label: "Hospitals", icon: "hospital-building", searchQuery: "hospital" },
  { id: "restaurants", label: "Restaurants", icon: "silverware-fork-knife", searchQuery: "restaurant" },
  { id: "parking", label: "Parking", icon: "parking", searchQuery: "parking" },
  { id: "hotels", label: "Hotels", icon: "bed-outline", searchQuery: "hotel" },
  { id: "ev", label: "EV Chargers", icon: "ev-station", searchQuery: "ev charging station" },
  { id: "atms", label: "ATMs", icon: "cash-marker", searchQuery: "atm" },
  { id: "nearby", label: "Nearby Places", icon: "map-marker-radius-outline", searchQuery: "point of interest" }
];

const favoriteFallbacks = ["Home", "Work", "College", "Airport"];

export default function HomeScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { routePlan, preferences: userPreferences } = useAppState();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceCoordinate, setSourceCoordinate] = useState<Coordinate | null>(null);
  const [destinationCoordinate, setDestinationCoordinate] = useState<Coordinate | null>(null);
  const [pickerTarget, setPickerTarget] = useState<"source" | "destination" | null>(null);
  const [preference, setPreference] = useState<TravelPreference>(userPreferences.defaultRouteType);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [recentSearches, setRecentSearches] = useState<SearchHistory[]>([]);
  const [favoriteLocations, setFavoriteLocations] = useState<SearchHistory[]>([]);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [nearbyResults, setNearbyResults] = useState<LocationResult[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const detailsAbortRef = useRef<AbortController | null>(null);
  const suppressNextSearchRef = useRef(false);
  const { plan, loading, error } = useRoutes();
  const stats = useStats();
  const weather = useWeather(routePlan?.sourceCoordinate);
  const bestRoute = routePlan?.routes[0];
  const realInsights = [
    bestRoute ? `Best current option: ${bestRoute.name} to ${routePlan.destination}, ${bestRoute.distance} km in ${bestRoute.eta} minutes.` : "Plan a route to generate live route insights.",
    weather ? `Weather near your route: ${weather.conditions}, ${weather.temperature}°C, ${weather.rainProbability}% rain chance.` : "Weather intelligence appears after your first route plan.",
    bestRoute ? `Estimated fuel for this trip is ${bestRoute.fuelUsage.toFixed(2)} L, about Rs ${bestRoute.fuelCost}.` : "Fuel estimates are calculated from route distance and your mileage preference."
  ];
  const displayedInsights = aiInsights.length ? aiInsights : realInsights;

  useEffect(() => {
    setAiInsights([]);
    setInsightsError(null);
  }, [routePlan]);

  useEffect(() => () => cancelGeminiRequest("home-insights"), []);

  useEffect(() => {
    getRecentSearches().then(setRecentSearches);
    getFavoriteLocations().then(setFavoriteLocations);
  }, []);

  useEffect(() => {
    const normalizedQuery = destination.trim().replace(/\s+/g, " ");
    if (suppressNextSearchRef.current) {
      suppressNextSearchRef.current = false;
      return;
    }
    if (destinationCoordinate || normalizedQuery.length < 2) {
      searchAbortRef.current?.abort();
      setSuggestions([]);
      setSearchError(null);
      setHasSearched(false);
      return;
    }

    const timeout = setTimeout(() => {
      searchDestination(normalizedQuery);
    }, 500);

    return () => clearTimeout(timeout);
  }, [currentLocation, destination, destinationCoordinate]);

  async function refreshRecentSearches() {
    const next = await getRecentSearches();
    setRecentSearches(next);
  }

  async function resolveLocationBias(): Promise<Coordinate> {
    if (currentLocation) return currentLocation;

    try {
      const coordinate = await getCurrentLocation();
      setCurrentLocation(coordinate);
      setLocationNotice(null);
      return coordinate;
    } catch (error) {
      const fallback = getDefaultLocation();
      setCurrentLocation(fallback);
      setLocationNotice(error instanceof Error ? error.message : "Location permission denied. Nearby results may be less relevant.");
      return fallback;
    }
  }

  async function searchDestination(query: string) {
    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;
    setSearchLoading(true);
    setSearchError(null);
    setHasSearched(true);
    setActiveCategoryId(null);
    setNearbyResults([]);
    try {
      const locationBias = await resolveLocationBias();
      const next = await searchPlaces(query, { locationBias, signal: controller.signal });
      setSuggestions(next);
    } catch (error) {
      if (controller.signal.aborted) return;
      setSuggestions([]);
      setSearchError(error instanceof Error ? error.message : "Location search failed.");
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
    await refreshRecentSearches();
    const result = await plan(source.trim() || "Current Location", label, preference, {
      source: sourceCoordinate ?? currentLocation,
      destination: details.coordinate
    });
    if (result) router.push("/routes");
  }

  async function selectSuggestion(suggestion: PlaceSuggestion) {
    detailsAbortRef.current?.abort();
    const controller = new AbortController();
    detailsAbortRef.current = controller;
    setDetailsLoading(true);
    setSearchError(null);
    try {
      const details = await getPlaceDetails(suggestion.placeId, controller.signal);
      await planSelectedDestination(details);
    } catch (error) {
      if (controller.signal.aborted) return;
      setSearchError(error instanceof Error ? error.message : "Could not load place details.");
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
    setHasSearched(true);
    setActiveCategoryId(category.id);
    setSuggestions([]);
    setDestination(category.label);
    setDestinationCoordinate(null);
    try {
      const next = await searchNearbyPlaces({
        location: coordinate,
        query: category.searchQuery,
        category: category.label,
        signal: controller.signal
      });
      setNearbyResults(next);
    } catch (error) {
      if (controller.signal.aborted) return;
      setNearbyResults([]);
      setSearchError(error instanceof Error ? error.message : "Nearby search failed.");
    } finally {
      if (!controller.signal.aborted) setSearchLoading(false);
    }
  }

  async function selectRecentSearch(item: SearchHistory | string) {
    if (typeof item === "string") {
      setDestination(item);
      setDestinationCoordinate(null);
      return;
    }

    await planSelectedDestination({
      id: item.id,
      placeId: item.placeId ?? item.id,
      name: item.label,
      address: item.address ?? "",
      coordinate: item.coordinate,
      category: item.category
    });
  }

  async function selectFavoriteLocation(item: SearchHistory | string) {
    await selectRecentSearch(item);
  }

  async function handlePlan() {
    if (loading) return;
    if (!destination.trim()) {
      setFormError("Destination is required.");
      return;
    }
    setFormError(null);
    const result = await plan(source.trim() || "Current Location", destination.trim(), preference, {
      source: sourceCoordinate,
      destination: destinationCoordinate
    });
    if (result) router.push("/routes");
  }

  async function handleGenerateInsights() {
    if (!routePlan || insightsLoading) return;
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const nextInsights = await generateRouteInsights(routePlan, "home-insights");
      setAiInsights(nextInsights);
    } catch (error) {
      setInsightsError(error instanceof Error ? error.message : "AI service is temporarily busy. Please wait a minute and try again.");
    } finally {
      setInsightsLoading(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.logo, { color: theme.text }]}>RoadSense</Text>
            <Text style={[styles.kicker, { color: theme.primary }]}>AI navigation intelligence</Text>
          </View>
          <Pressable onPress={toggleTheme} style={[styles.themeToggle, { backgroundColor: theme.iconButton, borderColor: theme.border }]}>
            <MaterialCommunityIcons name={isDark ? "weather-sunny" : "moon-waning-crescent"} size={21} color={theme.text} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={[styles.title, { color: theme.text }]}>Trip Dashboard</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Plan an optimized journey with real-time safety intelligence.</Text>
        </View>

        <GlassCard>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Route Planner</Text>
          <Field
            label="Current Location"
            value={source}
            onChangeText={(value) => {
              setSource(value);
              setSourceCoordinate(null);
            }}
            icon="crosshairs-gps"
            onPick={() => setPickerTarget("source")}
          />
          <SearchBar
            value={destination}
            placeholder="Search destination..."
            loading={searchLoading || detailsLoading}
            onChangeText={(value) => {
              setDestination(value);
              setDestinationCoordinate(null);
              setFormError(null);
            }}
            onClear={() => {
              setDestination("");
              setDestinationCoordinate(null);
              setSuggestions([]);
              setNearbyResults([]);
              setActiveCategoryId(null);
              setSearchError(null);
            }}
            onChooseOnMap={() => setPickerTarget("destination")}
            onSubmit={() => destination.trim() && searchDestination(destination)}
          />
          <CategoryChips categories={searchCategories} activeCategoryId={activeCategoryId} onSelect={selectCategory} />
          {locationNotice ? <Text style={[styles.notice, { color: theme.warning }]}>{locationNotice}</Text> : null}
          {searchLoading || detailsLoading ? <LoadingSkeleton /> : null}
          <FavoriteLocations favorites={favoriteLocations} fallbackItems={favoriteFallbacks} onSelect={selectFavoriteLocation} />
          <RecentSearchList searches={recentSearches} fallbackItems={recentDestinations} onSelect={selectRecentSearch} />
          <SearchResultsList
            title={activeCategoryId ? "Nearby Places" : "Suggested Places"}
            suggestions={suggestions}
            results={nearbyResults}
            emptyText={!searchLoading && hasSearched && !suggestions.length && !nearbyResults.length && !searchError ? "No results found. Try a nearby landmark or a more specific place." : undefined}
            onSelectSuggestion={selectSuggestion}
            onSelectResult={planSelectedDestination}
          />
          <Text style={[styles.smallLabel, { color: theme.textSecondary }]}>Travel Preference</Text>
          <View style={[styles.segment, { backgroundColor: theme.input }]}>
            {preferences.map((item) => (
              <Pressable
                key={item.value}
                onPress={() => setPreference(item.value)}
                style={[styles.segmentItem, preference === item.value && { backgroundColor: theme.chipBackground }]}
              >
                <Text style={[styles.segmentText, { color: preference === item.value ? theme.primary : theme.textSecondary }]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
          {(formError || error || searchError) ? <Text style={[styles.error, { color: theme.danger }]}>{formError ?? error ?? searchError}</Text> : null}
          <GradientButton label="Plan Route" loading={loading} onPress={handlePlan} style={styles.cta} />
          {loading ? <ActivityIndicator color={theme.primary} style={styles.loader} /> : null}
        </GlassCard>

        <SectionHeader title="Recent Destinations" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recentDestinations.map((item) => (
            <AIChip key={item} label={item} onPress={() => setDestination(item)} />
          ))}
        </ScrollView>

        <SectionHeader title="Map Preview" />
        <MapPreview plan={routePlan} />

        <SectionHeader title="AI Insights" />
        <GlassCard>
          {displayedInsights.map((insight) => (
            <View key={insight} style={styles.insight}>
              <MaterialCommunityIcons name="star-four-points" size={16} color={theme.primary} />
              <Text style={[styles.insightText, { color: theme.textSecondary }]}>{insight}</Text>
            </View>
          ))}
          {insightsError ? <Text style={[styles.error, { color: theme.danger }]}>{insightsError}</Text> : null}
          <GradientButton
            label="Generate AI Analysis"
            icon="creation"
            loading={insightsLoading}
            loadingLabel="Generating..."
            onPress={handleGenerateInsights}
            style={styles.insightButton}
          />
        </GlassCard>

        <SectionHeader title="Live Hazards" />
        <GlassCard>
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="shield-check-outline" size={24} color={theme.success} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No current hazards reported</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Live traffic incident data is not connected yet. Route, weather, and map data are active.</Text>
          </View>
        </GlassCard>

        <SectionHeader title="Weekly Stats" />
        <View style={styles.grid}>
          <StatCard label="Trips" value={stats.trips} icon="routes" />
          <StatCard label="Avg Safety" value={stats.avgSafety} icon="shield-check" />
        </View>
        <View style={styles.grid}>
          <StatCard label="Saved Time" value={stats.savedTime} icon="clock-fast" />
          <StatCard label="Fuel Saved" value={stats.fuelSaved} icon="gas-station" />
        </View>
      </ScrollView>
      <FloatingAIButton onPress={() => router.push("/assistant")} />
      <MapLocationPicker
        visible={pickerTarget !== null}
        title={pickerTarget === "source" ? "Choose Source" : "Choose Destination"}
        initialLabel={pickerTarget === "source" ? source : destination}
        onCancel={() => setPickerTarget(null)}
        onConfirm={({ label, coordinate }) => {
          if (pickerTarget === "source") {
            setSource(label);
            setSourceCoordinate(coordinate);
            setCurrentLocation(coordinate);
          } else {
            setDestination(label);
            setDestinationCoordinate(coordinate);
            planSelectedDestination({
              id: `${coordinate.latitude},${coordinate.longitude}`,
              label,
              address: label,
              coordinate
            });
          }
          setPickerTarget(null);
        }}
      />
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  icon,
  onPick
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  icon: string;
  onPick?: () => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.field, { backgroundColor: theme.input }]}>
      <MaterialCommunityIcons name={icon as any} size={20} color={theme.primary} />
      <TextInput
        placeholder={label}
        placeholderTextColor={theme.textSecondary}
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, { color: theme.text }]}
      />
      <Pressable onPress={onPick} style={[styles.pickButton, { backgroundColor: theme.chipBackground }]}>
        <MaterialCommunityIcons name="map-search-outline" size={20} color={theme.text} />
      </Pressable>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  const { theme } = useTheme();
  return <Text style={[styles.sectionHeader, { color: theme.text }]}>{title}</Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: spacing.screen, paddingBottom: 128 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingTop: 18 },
  themeToggle: { alignItems: "center", borderRadius: 18, borderWidth: 1, height: 42, justifyContent: "center", width: 42 },
  logo: { fontSize: 24, fontWeight: "900" },
  kicker: { fontSize: 12, marginTop: 3 },
  hero: { marginVertical: 24 },
  title: { fontSize: 36, fontWeight: "900", letterSpacing: 0 },
  subtitle: { fontSize: 16, lineHeight: 23, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "900", marginBottom: 14 },
  field: { alignItems: "center", borderRadius: 18, flexDirection: "row", gap: 10, marginBottom: 12, paddingHorizontal: 14 },
  input: { flex: 1, fontSize: 15, minHeight: 54 },
  pickButton: { alignItems: "center", borderRadius: 14, height: 38, justifyContent: "center", width: 38 },
  smallLabel: { fontSize: 12, fontWeight: "700", marginBottom: 10, marginTop: 2 },
  notice: { fontSize: 12, lineHeight: 18, marginTop: 10 },
  segment: { borderRadius: 18, flexDirection: "row", padding: 4 },
  segmentItem: { alignItems: "center", borderRadius: 15, flex: 1, paddingVertical: 12 },
  segmentText: { fontWeight: "800" },
  cta: { marginTop: 16 },
  loader: { marginTop: 12 },
  error: { marginTop: 12 },
  sectionHeader: { fontSize: 20, fontWeight: "900", marginBottom: 12, marginTop: 24 },
  insight: { alignItems: "center", flexDirection: "row", gap: 10, marginBottom: 12 },
  insightText: { flex: 1, lineHeight: 20 },
  insightButton: { marginTop: 6 },
  emptyState: { alignItems: "center", gap: 8, paddingVertical: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "900" },
  emptyText: { lineHeight: 20, textAlign: "center" },
  grid: { flexDirection: "row", gap: 12, marginBottom: 12 }
});
