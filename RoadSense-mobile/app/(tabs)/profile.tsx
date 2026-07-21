import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import GlassCard from "../../src/components/GlassCard";
import GradientButton from "../../src/components/GradientButton";
import { colors } from "../../src/constants/colors";
import { spacing } from "../../src/constants/theme";
import { useAppState } from "../../src/context/AppStateContext";
import { TravelPreference } from "../../src/types/route";

const routeTypes: TravelPreference[] = ["safest", "fastest", "eco"];

export default function ProfileScreen() {
  const { preferences, setPreferences } = useAppState();
  const [mileage, setMileage] = useState(String(preferences.vehicleMileage));
  const [fuelPrice, setFuelPrice] = useState(String(preferences.fuelPrice));
  const [routeType, setRouteType] = useState<TravelPreference>(preferences.defaultRouteType);
  const [saved, setSaved] = useState(false);

  async function save() {
    await setPreferences({
      ...preferences,
      defaultRouteType: routeType,
      vehicleMileage: Number(mileage) || 15,
      fuelPrice: Number(fuelPrice) || 100
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Preferences and app settings</Text>

      <GlassCard>
        <Text style={styles.section}>Preferences</Text>
        <Text style={styles.label}>Default Route Type</Text>
        <View style={styles.segment}>
          {routeTypes.map((item) => (
            <Pressable key={item} onPress={() => setRouteType(item)} style={[styles.segmentItem, routeType === item && styles.segmentActive]}>
              <Text style={[styles.segmentText, routeType === item && styles.segmentTextActive]}>{item.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
        <Field label="Vehicle Mileage" value={mileage} onChangeText={setMileage} suffix="km/L" />
        <Field label="Fuel Price" value={fuelPrice} onChangeText={setFuelPrice} suffix="Rs/L" />
        <Info label="Units" value="Metric" />
        {saved ? <Text style={styles.saved}>Preferences updated</Text> : null}
        <GradientButton label="Save Preferences" icon="content-save" onPress={save} style={styles.save} />
      </GlassCard>

      <GlassCard style={styles.about}>
        <Text style={styles.section}>About</Text>
        <Info label="RoadSense" value="AI-powered trip assistant" />
        <Info label="Version" value="1.0.0" />
        <Info label="Terms" value="External API usage applies." />
      </GlassCard>
    </ScrollView>
  );
}

function Field({ label, value, onChangeText, suffix }: { label: string; value: string; onChangeText: (value: string) => void; suffix: string }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput value={value} onChangeText={onChangeText} keyboardType="numeric" style={styles.input} />
        <Text style={styles.suffix}>{suffix}</Text>
      </View>
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.screen, paddingBottom: 128, paddingTop: 34 },
  title: { color: colors.text, fontSize: 34, fontWeight: "900" },
  subtitle: { color: colors.textSecondary, marginBottom: 22, marginTop: 6 },
  section: { color: colors.text, fontSize: 20, fontWeight: "900", marginBottom: 16 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: "700" },
  segment: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 18, flexDirection: "row", marginBottom: 16, marginTop: 10, padding: 4 },
  segmentItem: { alignItems: "center", borderRadius: 15, flex: 1, paddingVertical: 12 },
  segmentActive: { backgroundColor: "rgba(0,212,255,0.16)" },
  segmentText: { color: colors.textSecondary, fontSize: 11, fontWeight: "900" },
  segmentTextActive: { color: colors.primary },
  fieldRow: { marginBottom: 16 },
  inputWrap: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, flexDirection: "row", marginTop: 8, paddingHorizontal: 14 },
  input: { color: colors.text, flex: 1, minHeight: 50 },
  suffix: { color: colors.textSecondary },
  info: { borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: 13 },
  value: { color: colors.text, fontSize: 15, fontWeight: "800", marginTop: 4 },
  saved: { color: colors.success, fontSize: 14, fontWeight: "800", marginBottom: 12 },
  save: { marginTop: 8 },
  about: { marginTop: 18 }
});
