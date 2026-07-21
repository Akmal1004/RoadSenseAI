import { Coordinate } from "./route";

export type PlaceSuggestion = {
  id: string;
  placeId: string;
  primaryText: string;
  secondaryText: string;
  description: string;
  category?: string;
  distanceKm?: number;
};

export type PlaceDetails = {
  id: string;
  placeId: string;
  name: string;
  address: string;
  coordinate: Coordinate;
  category?: string;
  distanceKm?: number;
};

export type SearchHistory = {
  id: string;
  placeId?: string;
  label: string;
  address?: string;
  coordinate: Coordinate;
  category?: string;
  searchedAt: number;
};

export type SearchCategory = {
  id: string;
  label: string;
  icon: string;
  searchQuery: string;
};

export type LocationResult = {
  id: string;
  label: string;
  address: string;
  coordinate: Coordinate;
  placeId?: string;
  category?: string;
  distanceKm?: number;
};
