import AsyncStorage from "@react-native-async-storage/async-storage";
import { SearchHistory } from "../types/search";

export const recentSearchesKey = "roadsense_recent_searches";
const favoriteLocationsKey = "roadsense_favorite_locations";

async function readHistory(): Promise<SearchHistory[]> {
  try {
    const raw = await AsyncStorage.getItem(recentSearchesKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("[RoadSense Storage] Recent searches read failed", error);
    return [];
  }
}

export async function getRecentSearches(): Promise<SearchHistory[]> {
  const searches = await readHistory();
  return searches.sort((a, b) => b.searchedAt - a.searchedAt).slice(0, 10);
}

export async function saveRecentSearch(search: Omit<SearchHistory, "searchedAt">): Promise<void> {
  const current = await readHistory();
  const normalizedLabel = search.label.trim().toLowerCase();
  const next: SearchHistory[] = [
    {
      ...search,
      label: search.label.trim(),
      searchedAt: Date.now()
    },
    ...current.filter((item) => item.label.trim().toLowerCase() !== normalizedLabel && item.placeId !== search.placeId)
  ].slice(0, 10);

  await AsyncStorage.setItem(recentSearchesKey, JSON.stringify(next)).catch((error) => {
    console.warn("[RoadSense Storage] Recent searches save failed", error);
  });
}

export async function getFavoriteLocations(): Promise<SearchHistory[]> {
  try {
    const raw = await AsyncStorage.getItem(favoriteLocationsKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("[RoadSense Storage] Favorite locations read failed", error);
    return [];
  }
}

export async function saveFavoriteLocation(favorite: Omit<SearchHistory, "searchedAt">): Promise<void> {
  const current = await getFavoriteLocations();
  const normalizedLabel = favorite.label.trim().toLowerCase();
  const next: SearchHistory[] = [
    {
      ...favorite,
      label: favorite.label.trim(),
      searchedAt: Date.now()
    },
    ...current.filter((item) => item.label.trim().toLowerCase() !== normalizedLabel && item.placeId !== favorite.placeId)
  ].slice(0, 10);

  await AsyncStorage.setItem(favoriteLocationsKey, JSON.stringify(next)).catch((error) => {
    console.warn("[RoadSense Storage] Favorite location save failed", error);
  });
}
