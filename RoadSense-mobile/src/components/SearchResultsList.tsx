import { StyleSheet, Text, View } from "react-native";
import SearchSuggestionItem from "./SearchSuggestionItem";
import { useTheme } from "../theme/hooks/useTheme";
import { LocationResult, PlaceSuggestion } from "../types/search";

type Props = {
  title: string;
  suggestions?: PlaceSuggestion[];
  results?: LocationResult[];
  emptyText?: string;
  onSelectSuggestion?: (suggestion: PlaceSuggestion) => void;
  onSelectResult?: (result: LocationResult) => void;
};

export default function SearchResultsList({
  title,
  suggestions = [],
  results = [],
  emptyText,
  onSelectSuggestion,
  onSelectResult
}: Props) {
  const { theme } = useTheme();
  const hasItems = suggestions.length > 0 || results.length > 0;

  if (!hasItems && !emptyText) return null;

  return (
    <View style={styles.root}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {suggestions.map((suggestion) => (
        <SearchSuggestionItem
          key={suggestion.id}
          title={suggestion.primaryText}
          subtitle={suggestion.secondaryText}
          category={suggestion.category}
          distanceKm={suggestion.distanceKm}
          onPress={() => onSelectSuggestion?.(suggestion)}
        />
      ))}
      {results.map((result) => (
        <SearchSuggestionItem
          key={result.id}
          title={result.label}
          subtitle={result.address}
          category={result.category}
          distanceKm={result.distanceKm}
          onPress={() => onSelectResult?.(result)}
        />
      ))}
      {!hasItems && emptyText ? <Text style={[styles.empty, { color: theme.textSecondary }]}>{emptyText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginTop: 16 },
  title: { fontSize: 14, fontWeight: "900", marginBottom: 2 },
  empty: { fontSize: 13, lineHeight: 19, paddingVertical: 10 }
});
