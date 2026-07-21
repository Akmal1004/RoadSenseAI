import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../theme/hooks/useTheme";

type Props = {
  value: string;
  placeholder?: string;
  loading?: boolean;
  onChangeText: (value: string) => void;
  onClear: () => void;
  onChooseOnMap?: () => void;
  onSubmit?: () => void;
};

export default function SearchBar({
  value,
  placeholder = "Search destination...",
  loading = false,
  onChangeText,
  onClear,
  onChooseOnMap,
  onSubmit
}: Props) {
  const { theme } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <MaterialCommunityIcons name="magnify" size={22} color={theme.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        returnKeyType="search"
        style={[styles.input, { color: theme.text }]}
      />
      {loading ? <ActivityIndicator color={theme.primary} size="small" /> : null}
      {value.length ? (
        <Pressable onPress={onClear} style={[styles.iconButton, { backgroundColor: theme.iconButton }]}>
          <MaterialCommunityIcons name="close" size={18} color={theme.text} />
        </Pressable>
      ) : null}
      {onChooseOnMap ? (
        <Pressable onPress={onChooseOnMap} style={[styles.iconButton, { backgroundColor: theme.chipBackground }]}>
          <MaterialCommunityIcons name="map-marker-plus-outline" size={19} color={theme.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 58,
    paddingHorizontal: 14
  },
  input: { flex: 1, fontSize: 15, minHeight: 54 },
  iconButton: { alignItems: "center", borderRadius: 14, height: 34, justifyContent: "center", width: 34 }
});
