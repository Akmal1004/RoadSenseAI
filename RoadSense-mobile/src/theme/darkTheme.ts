export type RoadSenseTheme = {
  name: "dark" | "light";
  background: string;
  surface: string;
  card: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  muted: string;
  success: string;
  warning: string;
  danger: string;
  input: string;
  iconButton: string;
  chipBackground: string;
  chipBorder: string;
  tabBar: string;
  mapLegend: string;
  modalOverlay: string;
  mapStyle: "dark" | "light";
};

export const darkTheme: RoadSenseTheme = {
  name: "dark",
  background: "#030B18",
  surface: "#091324",
  card: "rgba(255,255,255,0.05)",
  primary: "#00D4FF",
  secondary: "#2563FF",
  text: "#FFFFFF",
  textSecondary: "#94A3B8",
  border: "rgba(255,255,255,0.08)",
  muted: "#475569",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  input: "rgba(255,255,255,0.04)",
  iconButton: "rgba(255,255,255,0.08)",
  chipBackground: "rgba(0,212,255,0.1)",
  chipBorder: "rgba(0,212,255,0.22)",
  tabBar: "rgba(9,19,36,0.92)",
  mapLegend: "rgba(3,11,24,0.82)",
  modalOverlay: "rgba(0,0,0,0.62)",
  mapStyle: "dark"
};
