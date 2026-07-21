import { TurboModuleRegistry } from "react-native";

export function isMapLibreNativeAvailable(): boolean {
  // TurboModuleRegistry is undefined on web — guard before calling .get()
  return TurboModuleRegistry != null && TurboModuleRegistry.get("MLRNCameraModule") != null;
}
