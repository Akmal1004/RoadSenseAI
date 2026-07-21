import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Coordinate } from "../types/route";
import { PlaceSuggestion } from "../types/search";
import { getDefaultLocation } from "../services/locationService";
import { getPlaceDetails, searchPlaces } from "../services/searchService";
import GradientButton from "./GradientButton";
import LoadingSkeleton from "./LoadingSkeleton";
import SearchBar from "./SearchBar";
import SearchResultsList from "./SearchResultsList";
import { useTheme } from "../theme/hooks/useTheme";

type Props = {
  visible: boolean;
  title: string;
  initialLabel?: string;
  initialCoordinate?: Coordinate;
  locationBias?: Coordinate | null;
  onCancel: () => void;
  onConfirm: (value: { label: string; coordinate: Coordinate }) => void;
};

export default function LocationPickerModal({
  visible,
  title,
  initialLabel,
  initialCoordinate,
  locationBias,
  onCancel,
  onConfirm
}: Props) {
  const { theme } = useTheme();
  const [query, setQuery] = useState(initialLabel ?? "");
  const [marker, setMarker] = useState<Coordinate>(initialCoordinate ?? locationBias ?? getDefaultLocation());
  const [selectedLabel, setSelectedLabel] = useState(initialLabel ?? coordinateLabel(initialCoordinate ?? locationBias ?? getDefaultLocation()));
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!visible) return;
    const initialMarker = initialCoordinate ?? locationBias ?? getDefaultLocation();
    setQuery(initialLabel ?? "");
    setMarker(initialMarker);
    setSelectedLabel(initialLabel ?? coordinateLabel(initialMarker));
    setSuggestions([]);
    setSearchError(null);
    setHasSearched(false);
  }, [initialCoordinate, initialLabel, locationBias, visible]);

  useEffect(() => {
    if (!visible) return;
    const normalizedQuery = query.trim().replace(/\s+/g, " ");
    if (normalizedQuery.length < 2) {
      requestRef.current?.abort();
      setSuggestions([]);
      setSearchError(null);
      setHasSearched(false);
      return;
    }

    const timeout = setTimeout(() => {
      search(normalizedQuery);
    }, 500);

    return () => clearTimeout(timeout);
  }, [query, visible]);

  async function search(value = query) {
    const normalizedQuery = value.trim().replace(/\s+/g, " ");
    if (!normalizedQuery) return;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setSearching(true);
    setSearchError(null);
    setHasSearched(true);
    try {
      const next = await searchPlaces(normalizedQuery, { locationBias, signal: controller.signal });
      setSuggestions(next);
    } catch (error) {
      if (controller.signal.aborted) return;
      setSuggestions([]);
      setSearchError(error instanceof Error ? error.message : "Location search failed.");
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  }

  async function chooseSuggestion(suggestion: PlaceSuggestion) {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setResolving(true);
    setSearchError(null);
    try {
      const details = await getPlaceDetails(suggestion.placeId, controller.signal);
      setMarker(details.coordinate);
      setSelectedLabel(details.name || details.address);
      setQuery(details.name || details.address);
      setSuggestions([]);
    } catch (error) {
      if (controller.signal.aborted) return;
      setSearchError(error instanceof Error ? error.message : "Could not load place details.");
    } finally {
      if (!controller.signal.aborted) setResolving(false);
    }
  }

  function confirm() {
    onConfirm({
      label: selectedLabel || coordinateLabel(marker),
      coordinate: marker
    });
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Pressable onPress={onCancel} style={[styles.iconButton, { backgroundColor: theme.iconButton }]}>
            <MaterialCommunityIcons name="close" size={24} color={theme.text} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Search and select a location to continue</Text>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onClear={() => {
              setQuery("");
              setSuggestions([]);
            }}
            onSubmit={() => search()}
            placeholder="Search a place"
            loading={searching || resolving}
          />
          {searching ? <LoadingSkeleton rows={2} /> : null}
          <SearchResultsList
            title="Suggested Places"
            suggestions={suggestions}
            emptyText={!searching && hasSearched && !suggestions.length && !searchError ? "No results found. Try a more specific place." : undefined}
            onSelectSuggestion={chooseSuggestion}
          />
          {searchError ? <Text style={[styles.searchError, { color: theme.danger }]}>{searchError}</Text> : null}
        </View>

        <View style={styles.mapFallback}>
          <MaterialCommunityIcons name="map-search-outline" size={42} color={theme.primary} />
          <Text style={[styles.mapFallbackText, { color: theme.textSecondary }]}>Map preview unavailable. Search and select a location.</Text>
        </View>

        <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <Text style={[styles.selectedLabel, { color: theme.textSecondary }]} numberOfLines={2}>{selectedLabel}</Text>
          <GradientButton label="Confirm Location" icon="check" loading={resolving} onPress={confirm} />
        </View>
      </View>
    </Modal>
  );
}

function coordinateLabel(coordinate: Coordinate): string {
  return `${coordinate.latitude.toFixed(6)},${coordinate.longitude.toFixed(6)}`;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { alignItems: "center", flexDirection: "row", gap: 12, padding: 18, paddingTop: 44 },
  iconButton: { alignItems: "center", borderRadius: 18, height: 42, justifyContent: "center", width: 42 },
  headerText: { flex: 1 },
  title: { fontSize: 24, fontWeight: "900" },
  subtitle: { marginTop: 2 },
  searchWrap: { paddingHorizontal: 18, zIndex: 2 },
  searchError: { fontSize: 12, marginTop: 8 },
  mapFallback: { alignItems: "center", flex: 1, gap: 12, justifyContent: "center", marginTop: 12, padding: 24 },
  mapFallbackText: { fontSize: 15, lineHeight: 22, textAlign: "center" },
  footer: { borderTopWidth: 1, gap: 12, padding: 18, paddingBottom: 24 },
  selectedLabel: { lineHeight: 20, textAlign: "center" }
});
