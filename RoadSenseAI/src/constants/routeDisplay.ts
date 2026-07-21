import { colors } from "./colors";

export const routeLegend = [
  { id: "safest", label: "Safest Route", color: colors.routeByType.safest },
  { id: "fastest", label: "Fastest Route", color: colors.routeByType.fastest },
  { id: "eco", label: "Eco Route", color: colors.routeByType.eco }
];

export function routeColor(id: string, index = 0): string {
  if (id in colors.routeByType) {
    return colors.routeByType[id as keyof typeof colors.routeByType];
  }

  return colors.route[index % colors.route.length];
}
