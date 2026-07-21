import { ScrollView, StyleSheet, Text, View } from "react-native";
import AIChip from "./AIChip";
import { useTheme } from "../theme/hooks/useTheme";
import { SearchHistory } from "../types/search";

type Props = {
  searches: SearchHistory[];
  fallbackItems?: string[];
  onSelect: (item: SearchHistory | string) => void;
};

export default function RecentSearchList({ searches, fallbackItems = [], onSelect }: Props) {
  const { theme } = useTheme();
  const hasSearches = searches.length > 0;
  const items = hasSearches ? searches : fallbackItems;
  if (!items.length) return null;

  return (
    <View style={styles.root}>
      <Text style={[styles.title, { color: theme.text }]}>Recent Searches</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {items.map((item) => {
          const label = typeof item === "string" ? item : item.label;
          const key = typeof item === "string" ? item : item.id;
          return <AIChip key={key} label={label} onPress={() => onSelect(item)} />;
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginTop: 14 },
  title: { fontSize: 14, fontWeight: "900", marginBottom: 10 }
});
