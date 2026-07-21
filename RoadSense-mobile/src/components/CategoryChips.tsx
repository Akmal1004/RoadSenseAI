import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../theme/hooks/useTheme";
import { SearchCategory } from "../types/search";

type Props = {
  categories: SearchCategory[];
  activeCategoryId?: string | null;
  onSelect: (category: SearchCategory) => void;
};

export default function CategoryChips({ categories, activeCategoryId, onSelect }: Props) {
  const { theme } = useTheme();

  return (
    <View style={styles.root}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => {
          const active = activeCategoryId === category.id;
          return (
            <Pressable
              key={category.id}
              onPress={() => onSelect(category)}
              style={[
                styles.chip,
                { backgroundColor: active ? theme.primary : theme.input, borderColor: active ? theme.primary : theme.border }
              ]}
            >
              <MaterialCommunityIcons name={category.icon as any} size={16} color={active ? "#FFFFFF" : theme.primary} />
              <Text style={[styles.text, { color: active ? "#FFFFFF" : theme.text }]}>{category.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginTop: 12 },
  chip: { alignItems: "center", borderRadius: 999, borderWidth: 1, flexDirection: "row", gap: 7, height: 38, marginRight: 8, paddingHorizontal: 12 },
  text: { fontSize: 12, fontWeight: "800" }
});
