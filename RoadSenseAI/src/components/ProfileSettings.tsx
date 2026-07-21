import { useState, useEffect } from "react";
import { Save, Info, Car, Fuel, Eye } from "lucide-react";
import { useAppState } from "../context/AppStateContext";
import { TravelPreference } from "../types/route";

const preferenceOptions: TravelPreference[] = ["safest", "fastest", "eco"];

export default function ProfileSettings() {
  const { preferences, setPreferences } = useAppState();
  
  const [mileage, setMileage] = useState(String(preferences.vehicleMileage));
  const [fuelPrice, setFuelPrice] = useState(String(preferences.fuelPrice));
  const [routeType, setRouteType] = useState<TravelPreference>(preferences.defaultRouteType);
  const [units, setUnits] = useState(preferences.units);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state with global preferences
  useEffect(() => {
    setMileage(String(preferences.vehicleMileage));
    setFuelPrice(String(preferences.fuelPrice));
    setRouteType(preferences.defaultRouteType);
    setUnits(preferences.units);
  }, [preferences]);

  async function handleSave() {
    await setPreferences({
      defaultRouteType: routeType,
      vehicleMileage: Number(mileage) || 15,
      fuelPrice: Number(fuelPrice) || 100,
      units: units
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  }

  return (
    <div className="glass-panel" style={{ height: "100%", display: "flex", flexDirection: "column", gap: "18px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 800, fontFamily: "var(--font-display)" }}>
        Profile & Settings
      </h2>

      {/* Default Route Preference Toggle */}
      <div>
        <label style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "8px", display: "block" }}>
          Default Routing Preference
        </label>
        <div className="nav-segment">
          {preferenceOptions.map((opt) => (
            <button
              key={opt}
              className={`nav-segment-btn ${routeType === opt ? "active" : ""}`}
              onClick={() => setRouteType(opt)}
            >
              {opt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle Mileage Field */}
      <div>
        <label style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
          Vehicle Mileage
        </label>
        <div className="cyber-input-wrap">
          <Car size={18} color="var(--primary-cyan)" style={{ marginRight: "10px", flexShrink: 0 }} />
          <input
            type="number"
            className="cyber-input"
            value={mileage}
            placeholder="15"
            onChange={(e) => setMileage(e.target.value)}
          />
          <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 700, marginLeft: "8px", flexShrink: 0 }}>
            km/L
          </span>
        </div>
      </div>

      {/* Fuel Cost Field */}
      <div>
        <label style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
          Local Fuel Price
        </label>
        <div className="cyber-input-wrap">
          <Fuel size={18} color="var(--primary-cyan)" style={{ marginRight: "10px", flexShrink: 0 }} />
          <input
            type="number"
            className="cyber-input"
            value={fuelPrice}
            placeholder="100"
            onChange={(e) => setFuelPrice(e.target.value)}
          />
          <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 700, marginLeft: "8px", flexShrink: 0 }}>
            Rs/L
          </span>
        </div>
      </div>

      {/* Measurement Units Toggle */}
      <div>
        <label style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "8px", display: "block" }}>
          System Units
        </label>
        <div className="nav-segment">
          {(["metric", "imperial"] as const).map((u) => (
            <button
              key={u}
              className={`nav-segment-btn ${units === u ? "active" : ""}`}
              onClick={() => setUnits(u)}
            >
              {u.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Success Banner */}
      {savedSuccess && (
        <div style={{ color: "var(--safest-green)", fontSize: "13px", fontWeight: 700 }}>
          Preferences updated successfully!
        </div>
      )}

      {/* Save Button */}
      <button className="btn-gradient" onClick={handleSave}>
        <Save size={16} />
        <span>Save Preferences</span>
      </button>

      {/* About Box */}
      <div style={{
        marginTop: "auto",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingTop: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
        <h4 style={{ fontSize: "12px", fontWeight: 800, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "6px" }}>
          <Info size={14} color="var(--primary-cyan)" />
          <span>About RoadSense</span>
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Application Version</span>
            <span style={{ color: "#FFFFFF", fontWeight: 600 }}>1.0.0</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>License Environment</span>
            <span style={{ color: "#FFFFFF", fontWeight: 600 }}>Open-Source MVP</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
            <span>API Providers:</span>
            <span style={{ color: "#FFFFFF", fontWeight: 500, fontSize: "11px" }}>
              • OpenRouteService (Geocoding & Polyline)
            </span>
            <span style={{ color: "#FFFFFF", fontWeight: 500, fontSize: "11px" }}>
              • Open-Meteo Weather APIs (Forecasts)
            </span>
            <span style={{ color: "#FFFFFF", fontWeight: 500, fontSize: "11px" }}>
              • Gemini 1.5 Flash (Copilot Insights)
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
